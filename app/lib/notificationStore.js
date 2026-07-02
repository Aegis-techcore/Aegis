import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'admin-notifications.json');

const readNotifications = async () => {
  try {
    const content = await readFile(NOTIFICATIONS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const writeNotifications = async (notifications) => {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf8');
};

export async function addAdminNotification(notification) {
  const notifications = await readNotifications();
  const record = {
    id: randomUUID(),
    read: false,
    createdAt: new Date().toISOString(),
    type: String(notification?.type || 'info'),
    title: String(notification?.title || 'Ny notis'),
    message: String(notification?.message || ''),
    requestId: String(notification?.requestId || ''),
    customerId: String(notification?.customerId || '')
  };

  notifications.unshift(record);
  await writeNotifications(notifications);
  return record;
}

export async function listAdminNotifications() {
  const notifications = await readNotifications();
  return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function markAdminNotificationsRead(ids = []) {
  const notifications = await readNotifications();
  const idSet = new Set(ids);
  const nextNotifications = notifications.map((notification) => (
    idSet.size === 0 || idSet.has(notification.id)
      ? { ...notification, read: true, readAt: notification.readAt || new Date().toISOString() }
      : notification
  ));

  await writeNotifications(nextNotifications);
  return nextNotifications;
}
