import { neon } from '@neondatabase/serverless';
import { drizzle as createNeonDatabase } from 'drizzle-orm/neon-http';
import { drizzle as createPostgresDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL saknas.');
}

const requestedDriver = (process.env.DATABASE_DRIVER || 'auto').toLowerCase();

if (!['auto', 'neon', 'postgres'].includes(requestedDriver)) {
  throw new Error('DATABASE_DRIVER måste vara auto, neon eller postgres.');
}

const databaseUrl = process.env.DATABASE_URL;
const databaseHost = new URL(databaseUrl).hostname;
const useNeonDriver = requestedDriver === 'neon' || (
  requestedDriver === 'auto' && databaseHost.endsWith('.neon.tech')
);

let db;

if (useNeonDriver) {
  const sql = neon(databaseUrl);
  db = createNeonDatabase(sql);
} else {
  const poolSize = Number(process.env.DATABASE_POOL_SIZE || 10);
  const client = postgres(databaseUrl, {
    max: Number.isFinite(poolSize) ? poolSize : 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false
  });
  db = createPostgresDatabase(client);
}

export { db };
