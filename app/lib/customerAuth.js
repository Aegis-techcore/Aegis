import { createHmac, timingSafeEqual } from 'node:crypto';

export const CUSTOMER_COOKIE_NAME = 'aegis_customer_session';

const getCustomerSecret = () => {
  const secret =
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'CUSTOMER_SESSION_SECRET måste vara konfigurerad i produktion.'
      );
    }

    return 'aegis-customer-local-development-secret';
  }

  return secret;
};

const sign = (value) =>
  createHmac('sha256', getCustomerSecret())
    .update(value)
    .digest('hex');

export function createCustomerToken(customerId) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const payload = `customer:${customerId}:${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

export function verifyCustomerToken(token) {
  if (!token || !token.includes('.')) {
    return null;
  }

  const separatorIndex = token.lastIndexOf('.');

  if (separatorIndex < 1) {
    return null;
  }

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);

  const [role, customerId, expiresAt] = payload.split(':');

  if (
    role !== 'customer' ||
    !customerId ||
    !expiresAt ||
    Number(expiresAt) < Date.now()
  ) {
    return null;
  }

  const expectedSignature = sign(payload);

  const signatureBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  return customerId;
}

export function getCustomerIdFromRequest(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;

  return verifyCustomerToken(token);
}