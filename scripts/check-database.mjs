import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set before checking the database');
}

const { db } = await import('../app/lib/db/index.js');

try {
  await db.execute(sql`select 1`);
  console.log('Database readiness check passed');
} catch (error) {
  const cause = error.cause || error;
  console.error('Database readiness check failed', {
    code: cause.code || 'unknown',
    message: cause.message || 'unknown error'
  });
  process.exit(1);
}
