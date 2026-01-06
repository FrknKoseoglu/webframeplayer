import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // In production, this might crash if env var is missing
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ DATABASE_URL is not defined in environment variables. Database connections will fail.');
  } else {
    console.warn('⚠️ DATABASE_URL not found in db.ts initialization');
  }
}

const pool = new Pool({ connectionString: connectionString || '' });
const adapter = new PrismaPg(pool);

export const db = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ['error'],
});



if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
