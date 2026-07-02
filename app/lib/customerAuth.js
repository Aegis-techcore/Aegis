import { createHmac, timingSafeEqual } from 'node:crypto';

export const CUSTOMER_COOKIE_NAME = 'aegis_customer_session';

const getCustomerSecret = () =>
  process.env.CUSTOMER_SESSION_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  'aegis-customer-dev-secret';

const sign = (value) => createHmac('sha256', getCustomerSecret()).update(value).digest('hex');

export function createCustomerToken(customerId) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const payload = `customer:${customerId}:${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

export function verifyCustomerToken(token) {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [payload, signature] = token.split('.');
  const [role, customerId, expiresAt] = payload.split(':');
  const expectedSignature = sign(payload);

  if (role !== 'customer' || !customerId || Number(expiresAt) < Date.now()) {
    return null;
  }

  const signatureBuffer = Buffer.from(signature || '');
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  return customerId;
}

export function getCustomerIdFromRequest(request) {
  return verifyCustomerToken(request.cookies.get(CUSTOMER_COOKIE_NAME)?.value);
}
