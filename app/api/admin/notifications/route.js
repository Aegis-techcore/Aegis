import { isAdminRequest } from '../../../lib/adminAuth';
import { listAdminNotifications, markAdminNotificationsRead } from '../../../lib/notificationStore';

export const runtime = 'nodejs';

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  const notifications = await listAdminNotifications();

  return Response.json({
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length
  });
}

export async function PATCH(request) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const notifications = await markAdminNotificationsRead(Array.isArray(payload?.ids) ? payload.ids : []);

  return Response.json({
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length
  });
}
