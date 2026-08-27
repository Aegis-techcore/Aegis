import { readFile } from 'node:fs/promises';
import path from 'node:path';

import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set before importing legacy JSON data');
}

const { db } = await import('../app/lib/db/index.js');
const {
  adminNotifications,
  contactRequests,
  customers
} = await import('../app/lib/db/schema.ts');
const dataDirectory = path.join(process.cwd(), 'data');
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const readArray = async (filename) => {
  try {
    const content = await readFile(path.join(dataDirectory, filename), 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const requests = await readArray('contact-requests.json');
const notifications = await readArray('admin-notifications.json');
let importedRequests = 0;
let importedNotifications = 0;

for (const record of requests) {
  if (!uuidPattern.test(String(record.id || ''))) {
    console.warn('Skipping contact request with invalid UUID');
    continue;
  }

  const { id, createdAt, ...payload } = record;
  const result = await db
    .insert(contactRequests)
    .values({
      id,
      payload,
      createdAt: new Date(createdAt || Date.now())
    })
    .onConflictDoNothing({ target: contactRequests.id })
    .returning({ id: contactRequests.id });
  importedRequests += result.length;
}

for (const record of notifications) {
  if (!uuidPattern.test(String(record.id || ''))) {
    console.warn('Skipping admin notification with invalid UUID');
    continue;
  }

  let customerId = uuidPattern.test(String(record.customerId || ''))
    ? record.customerId
    : null;

  if (customerId) {
    const customer = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    customerId = customer.length > 0 ? customerId : null;
  }

  const result = await db
    .insert(adminNotifications)
    .values({
      id: record.id,
      read: Boolean(record.read),
      type: String(record.type || 'info'),
      title: String(record.title || 'Ny notis'),
      message: String(record.message || ''),
      requestId: String(record.requestId || ''),
      customerId,
      createdAt: new Date(record.createdAt || Date.now()),
      readAt: record.readAt ? new Date(record.readAt) : null
    })
    .onConflictDoNothing({ target: adminNotifications.id })
    .returning({ id: adminNotifications.id });
  importedNotifications += result.length;
}

console.log(`Imported ${importedRequests}/${requests.length} contact requests`);
console.log(`Imported ${importedNotifications}/${notifications.length} admin notifications`);
