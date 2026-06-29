import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'aegis_admin_session';

const getAdminSecret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'aegis-dev-secret';

const sign = (value) => createHmac('sha256', getAdminSecret()).update(value).digest('hex');

export function isAdminPasswordValid(password) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return false;
  }

  const passwordBuffer = Buffer.from(String(password || ''));
  const expectedBuffer = Buffer.from(expected);

  if (passwordBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(passwordBuffer, expectedBuffer);
}

export function createAdminToken() {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 8;
  const payload = `admin:${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token) {
  if (!token || !token.includes('.')) {
    return false;
  }

  const [role, expiresAt, signature] = token.split(/[.:]/);
  const payload = `${role}:${expiresAt}`;
  const expectedSignature = sign(payload);

  if (role !== 'admin' || Number(expiresAt) < Date.now()) {
    return false;
  }

  const signatureBuffer = Buffer.from(signature || '');
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export function isAdminRequest(request) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}
