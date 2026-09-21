import {
  createHmac,
  timingSafeEqual
} from 'node:crypto';

export const ADMIN_COOKIE_NAME =
  'aegis_admin_session';

const MIN_SECRET_LENGTH = 32;

const getAdminSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (secret?.length >= MIN_SECRET_LENGTH) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'ADMIN_SESSION_SECRET måste vara minst 32 tecken i produktion.'
    );
  }

  return 'aegis-admin-local-development-secret';
};

const sign = (value) =>
  createHmac('sha256', getAdminSecret())
    .update(value)
    .digest('hex');

export function isAdminPasswordValid(password) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return false;
  }

  const passwordBuffer = Buffer.from(
    String(password || '')
  );
  const expectedBuffer = Buffer.from(expected);

  if (
    passwordBuffer.length !== expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    passwordBuffer,
    expectedBuffer
  );
}

export function createAdminToken() {
  const expiresAt =
    Date.now() + 1000 * 60 * 60 * 8;
  const payload = `admin:${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token) {
  if (!token || !token.includes('.')) {
    return false;
  }

  const separatorIndex = token.lastIndexOf('.');

  if (separatorIndex < 1) {
    return false;
  }

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const [role, expiresAt] = payload.split(':');

  if (
    role !== 'admin' ||
    !expiresAt ||
    Number(expiresAt) < Date.now()
  ) {
    return false;
  }

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(
    signature,
    'utf8'
  );
  const expectedBuffer = Buffer.from(
    expectedSignature,
    'utf8'
  );

  if (
    signatureBuffer.length !== expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    signatureBuffer,
    expectedBuffer
  );
}

export function isAdminRequest(request) {
  return verifyAdminToken(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value
  );
}
