import { sql } from 'drizzle-orm';

import { db } from '../../lib/db/index.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: 'ready' });
  } catch (error) {
    console.error('Readiness check failed', error);
    return Response.json(
      { status: 'not-ready' },
      { status: 503 }
    );
  }
}
