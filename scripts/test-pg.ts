import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Testing PG Pool...');
    const client = await pool.connect();
    console.log('Pool Connected!');
    const res = await client.query('SELECT version()');
    console.log('PG Version:', res.rows[0]);
    client.release();

    console.log('Testing Prisma with PG Adapter...');
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
