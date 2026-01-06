
import dotenv from 'dotenv';
import path from 'path';

// Load .env and .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Setup Prisma
const connectionString = process.env.DATABASE_URL;
let prisma: PrismaClient;

if (!connectionString) {
  console.warn('WARNING: DATABASE_URL is missing. Using generic client.');
  prisma = new PrismaClient();
} else {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

// Mock Auth
const mockSession = {
  user: {
    id: 'placeholder_id',
    role: 'SERVICE_PROVIDER',
    name: 'Test Provider',
    email: 'test@example.com'
  }
};

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve(mockSession))
}));

// Mock DB (Optional, but we want Integration with Real DB, so we use real Prisma)
// We only Mock Auth.

// Import Handlers dynamically to ensure env vars are loaded first
let POST: any;
let PATCH: any;

describe('Credit & Anti-Abuse System Integration Tests (Direct Handler)', () => {
  let providerId: string;

  beforeAll(async () => {
    // Dynamic import to ensure DB is initialized with loaded env vars
    const route = await import('../src/app/api/provider/customers/route');
    POST = route.POST;
    PATCH = route.PATCH;

    // 1. Create Provider in DB
    const provider = await prisma.serviceProvider.create({
      data: {
        username: 'test_handler_prov',
        password: 'hash', // Not relevant as we mock auth
        email: 'test_handler@example.com',
        credits: 5,
        userLimit: 100,
      },
    });
    providerId = provider.id;
    mockSession.user.id = providerId; // Update mock session
  });

  afterAll(async () => {
    // Cleanup
    await prisma.creditLog.deleteMany({ where: { providerId } });
    await prisma.customer.deleteMany({ where: { providerId } });
    await prisma.serviceProvider.deleteMany({ where: { id: providerId } });
    await prisma.$disconnect();
  });

  describe('A. Credit Logic', () => {
    it('Should create a customer and deduct 1 credit', async () => {
      const req = new NextRequest('http://localhost/api/provider/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Credit Test User',
          type: 'M3U',
          m3uUrl: 'http://example.com/playlist.m3u',
          createMagicLink: false,
        })
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.name).toBe('Credit Test User');

      // Verify DB
      const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
      expect(provider?.credits).toBe(4);
    });

    it('Should reject creation if credits = 0', async () => {
      // Set credits to 0
      await prisma.serviceProvider.update({
        where: { id: providerId },
        data: { credits: 0 },
      });

      const req = new NextRequest('http://localhost/api/provider/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Zero Credit User',
          type: 'M3U',
          m3uUrl: 'http://example.com',
        })
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.error).toMatch(/yetersiz|insufficient/i);
    });
  });

  describe('B. The 15-Minute Lock (Time Travel Test)', () => {
    let customerId: string;

    beforeAll(async () => {
      // Reset credits
      await prisma.serviceProvider.update({
        where: { id: providerId },
        data: { credits: 10 },
      });
    });

    it('Should ALLOW updating critical fields within 15 mins', async () => {
      // Create user
      const createReq = new NextRequest('http://localhost/api/provider/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Lock Test User',
          type: 'XTREAM',
          xtreamUsername: 'user_orig',
          xtreamPassword: 'pass',
          xtreamHost: 'http://orig.com',
        })
      });
      const createRes = await POST(createReq);
      const customer = await createRes.json();
      customerId = customer.id;

      // Update
      const updateReq = new NextRequest('http://localhost/api/provider/customers', {
        method: 'PATCH',
        body: JSON.stringify({
          id: customerId,
          type: 'XTREAM',
          xtreamHost: 'http://new.com', // Critical
        })
      });

      const updateRes = await PATCH(updateReq);
      const updated = await updateRes.json();

      expect(updateRes.status).toBe(200);
      expect(updated.xtreamHost).toBe('http://new.com');
    });

    it('Should BLOCK updating critical fields after 15 mins', async () => {
      // Time Travel
      const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000);
      await prisma.customer.update({
        where: { id: customerId },
        data: { createdAt: twentyMinsAgo },
      });

      // Update
      const updateReq = new NextRequest('http://localhost/api/provider/customers', {
        method: 'PATCH',
        body: JSON.stringify({
          id: customerId,
          xtreamUsername: 'hacked_user', // Critical
        })
      });

      const updateRes = await PATCH(updateReq);
      
      expect(updateRes.status).toBe(403);
      // const body = await updateRes.json(); // May throw if empty? No, error returns json
    });

    it('Should ALLOW updating non-critical fields after 15 mins', async () => {
      const updateReq = new NextRequest('http://localhost/api/provider/customers', {
        method: 'PATCH',
        body: JSON.stringify({
          id: customerId,
          notes: 'Updated notes',
          xtreamPassword: 'newpass',
        })
      });

      const updateRes = await PATCH(updateReq);
      const updated = await updateRes.json();

      expect(updateRes.status).toBe(200);
      expect(updated.notes).toBe('Updated notes');
    });
  });

  describe('C. Race Condition (Double Spend)', () => {
    beforeAll(async () => {
      await prisma.serviceProvider.update({
        where: { id: providerId },
        data: { credits: 1 },
      });
    });

    it('Should prevent creating multiple users with only 1 credit', async () => {
      const payload = {
        type: 'M3U',
        m3uUrl: 'http://race.com',
        createMagicLink: false,
      };

      // Concurrent requests
      // We can't await inside map easily logic-wise for concurrency, 
      // but creating 3 promises for POST(req) works.
      
      const promises = [0, 1, 2].map(i => {
        const req = new NextRequest('http://localhost/api/provider/customers', {
          method: 'POST',
          body: JSON.stringify({ ...payload, name: `Race ${i}` })
        });
        return POST(req);
      });

      const responses = await Promise.all(promises);
      const successCount = responses.filter((r) => r.status === 200).length;
      
      expect(successCount).toBe(1);

      // Verify DB
      const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
      console.log('Final Credits:', provider?.credits);
      expect(provider?.credits).toBeGreaterThanOrEqual(0);
    });
  });
});
