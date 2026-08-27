import { desc, eq, inArray } from 'drizzle-orm';

import { db } from './db/index.js';
import { adminNotifications } from './db/schema.ts';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const formatNotification = (notification) => ({
  ...notification,
  customerId: notification.customerId || '',
  createdAt: notification.createdAt.toISOString(),
  readAt: notification.readAt?.toISOString() || ''
});

export async function addAdminNotification(notification) {
  const customerId = String(notification?.customerId || '');
  const [record] = await db
    .insert(adminNotifications)
    .values({
      type: String(notification?.type || 'info'),
      title: String(notification?.title || 'Ny notis'),
      message: String(notification?.message || ''),
      requestId: String(notification?.requestId || ''),
      customerId: UUID_PATTERN.test(customerId) ? customerId : null
    })
    .returning();

  return formatNotification(record);
}

export async function listAdminNotifications() {
  const notifications = await db
    .select()
    .from(adminNotifications)
    .orderBy(desc(adminNotifications.createdAt));

  return notifications.map(formatNotification);
}

export async function markAdminNotificationsRead(ids = []) {
  const validIds = ids.filter((id) => UUID_PATTERN.test(id));

  if (ids.length > 0 && validIds.length === 0) {
    return listAdminNotifications();
  }

  const condition = ids.length > 0
    ? inArray(adminNotifications.id, validIds)
    : eq(adminNotifications.read, false);

  await db
    .update(adminNotifications)
    .set({ read: true, readAt: new Date() })
    .where(condition);

  return listAdminNotifications();
}
