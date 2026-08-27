import { desc, eq } from 'drizzle-orm';

import { db } from './db/index.js';
import { contactRequests } from './db/schema.ts';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const formatRequest = (row) => ({
  ...row.payload,
  id: row.id,
  createdAt: row.createdAt.toISOString()
});

export async function saveContactRequest(request) {
  const [record] = await db
    .insert(contactRequests)
    .values({ payload: request })
    .returning();

  return formatRequest(record);
}

export async function listContactRequests() {
  const rows = await db
    .select()
    .from(contactRequests)
    .orderBy(desc(contactRequests.createdAt));

  return rows.map(formatRequest);
}

export async function deleteContactRequest(id) {
  if (!UUID_PATTERN.test(id)) {
    return false;
  }

  const rows = await db
    .delete(contactRequests)
    .where(eq(contactRequests.id, id))
    .returning({ id: contactRequests.id });

  return rows.length > 0;
}

export async function getContactRequest(id) {
  if (!UUID_PATTERN.test(id)) {
    return null;
  }

  const [row] = await db
    .select()
    .from(contactRequests)
    .where(eq(contactRequests.id, id))
    .limit(1);

  return row ? formatRequest(row) : null;
}
