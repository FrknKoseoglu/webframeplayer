import 'dotenv/config';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

// Configure WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;

// Force load .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = require('dotenv').parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL missing');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ 
  adapter,
  datasources: {
    db: {
      url: connectionString,
    },
  },
});

async function main() {
  try {
    console.log('Testing Raw Pool settings...');
    // Test raw pool first
    const client = await pool.connect();
    console.log('Pool Connected!');
    const res = await client.query('SELECT version()');
    console.log('Neon Version:', res.rows[0]);
    client.release();

    console.log('Testing Prisma...');
    await prisma.$connect();
    console.log('Prisma Connected!');
    const count = await prisma.superAdmin.count();
    console.log('SuperAdmins:', count);
    await prisma.$disconnect();
  } catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
  }
}

main();
