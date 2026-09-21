import { sql } from 'drizzle-orm';

import { db } from '../../lib/db/index.js';
import {
  getProductionConfigErrors
} from '../../lib/runtimeConfig.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const configErrors =
    getProductionConfigErrors();

  if (configErrors.length > 0) {
    console.error(
      'Production configuration invalid:',
      configErrors
    );

    return Response.json(
      { status: 'not-ready' },
      { status: 503 }
    );
  }

  try {
    await db.execute(sql`select 1`);

    return Response.json({
      status: 'ready'
    });
  } catch (error) {
    console.error(
      'Readiness check failed',
      error
    );

    return Response.json(
      { status: 'not-ready' },
      { status: 503 }
    );
  }
}
