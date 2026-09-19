import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual
} from 'node:crypto';
import { promisify } from 'node:util';

export const CUSTOMER_COOKIE_NAME = 'aegis_customer_session';

const scrypt = promisify(scryptCallback);
const ACCESS_CODE_PREFIX = 'scrypt';
const ACCESS_CODE_KEY_LENGTH = 64;

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

export function normalizeAccessCode(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '');
}

export async function hashAccessCode(value) {
  const normalized = normalizeAccessCode(value);

  if (!normalized) {
    throw new Error('Kundkod saknas.');
  }

  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(
    normalized,
    salt,
    ACCESS_CODE_KEY_LENGTH
  );

  return [
    ACCESS_CODE_PREFIX,
    salt,
    Buffer.from(derivedKey).toString('hex')
  ].join('$');
}

export async function verifyAccessCode(
  value,
  storedValue
) {
  const normalized = normalizeAccessCode(value);
  const stored = String(storedValue || '');

  if (!normalized || !stored) {
    return {
      valid: false,
      needsUpgrade: false
    };
  }

  if (!stored.startsWith(`${ACCESS_CODE_PREFIX}$`)) {
    const candidate = Buffer.from(normalized);
    const expected = Buffer.from(
      normalizeAccessCode(stored)
    );

    if (candidate.length !== expected.length) {
      return {
        valid: false,
        needsUpgrade: false
      };
    }

    return {
      valid: timingSafeEqual(candidate, expected),
      needsUpgrade: true
    };
  }

  const [prefix, salt, encodedKey] = stored.split('$');

  if (
    prefix !== ACCESS_CODE_PREFIX ||
    !salt ||
    !encodedKey
  ) {
    return {
      valid: false,
      needsUpgrade: false
    };
  }

  const derivedKey = await scrypt(
    normalized,
    salt,
    ACCESS_CODE_KEY_LENGTH
  );

  const candidate = Buffer.from(derivedKey);
  const expected = Buffer.from(encodedKey, 'hex');

  if (candidate.length !== expected.length) {
    return {
      valid: false,
      needsUpgrade: false
    };
  }

  return {
    valid: timingSafeEqual(candidate, expected),
    needsUpgrade: false
  };
}

export function createCustomerToken(customerId) {
  const expiresAt =
    Date.now() + 1000 * 60 * 60 * 24 * 30;
  const payload =
    `customer:${customerId}:${expiresAt}`;

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

  const [role, customerId, expiresAt] =
    payload.split(':');

  if (
    role !== 'customer' ||
    !customerId ||
    !expiresAt ||
    Number(expiresAt) < Date.now()
  ) {
    return null;
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
    return null;
  }

  if (
    !timingSafeEqual(
      signatureBuffer,
      expectedBuffer
    )
  ) {
    return null;
  }

  return customerId;
}

export function getCustomerIdFromRequest(request) {
  const token = request.cookies.get(
    CUSTOMER_COOKIE_NAME
  )?.value;

  return verifyCustomerToken(token);
}
