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

const pool = connectionString ? new Pool({ connectionString }) : null;
const adapter = pool ? new PrismaPg(pool) : null;

const createDummyPrisma = () => {
  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === '$connect' || prop === '$disconnect') return async () => {};
      if (prop === '$transaction') return async (cb: any) => cb(createDummyPrisma());
      return new Proxy({}, {
        get: () => async () => {
          throw new Error('Database connection string is missing. Please set DATABASE_URL.');
        }
      });
    }
  }) as unknown as PrismaClient;
};

export const db = globalForPrisma.prisma ?? (adapter 
  ? new PrismaClient({ adapter, log: ['error'] })
  : createDummyPrisma()
);



if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
