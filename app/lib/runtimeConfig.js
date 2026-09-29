const REQUIRED_KEYS = [
  'DATABASE_URL',
  'ADMIN_PASSWORD',
  'ADMIN_SESSION_SECRET',
  'CUSTOMER_SESSION_SECRET',
  'SITE_URL',
  'NEXT_PUBLIC_SITE_URL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'OWNER_EMAIL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_PRIVATE',
  'STRIPE_PRICE_START',
  'STRIPE_PRICE_PLUS',
  'STRIPE_PRICE_PRO',
  'STRIPE_PRICE_BUSINESS'
];

const SESSION_SECRET_KEYS = [
  'ADMIN_SESSION_SECRET',
  'CUSTOMER_SESSION_SECRET'
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const extractEmail = (value) => {
  const cleaned = String(value || '').trim();
  const bracketMatch = cleaned.match(/<([^<>]+)>$/);
  return (bracketMatch?.[1] || cleaned).trim().toLowerCase();
};

const validateSiteUrl = (key, value, errors) => {
  try {
    const parsed = new URL(String(value || '').trim());

    if (parsed.protocol !== 'https:') {
      errors.push(`${key} måste använda https i produktion`);
    }

    if (
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      (parsed.pathname && parsed.pathname !== '/')
    ) {
      errors.push(`${key} måste vara en ren origin utan credentials, path, query eller fragment`);
    }

    return parsed.origin;
  } catch {
    errors.push(`${key} är ogiltig`);
    return '';
  }
};

export function getProductionConfigErrors(
  env = process.env
) {
  if (env.NODE_ENV !== 'production') {
    return [];
  }

  const errors = [];

  for (const key of REQUIRED_KEYS) {
    if (!String(env[key] || '').trim()) {
      errors.push(`${key} saknas`);
    }
  }

  for (const key of SESSION_SECRET_KEYS) {
    if (String(env[key] || '').length < 32) {
      errors.push(`${key} måste vara minst 32 tecken`);
    }
  }

  if (
    String(env.ADMIN_PASSWORD || '').length < 12
  ) {
    errors.push(
      'ADMIN_PASSWORD måste vara minst 12 tecken'
    );
  }

  const siteUrl = validateSiteUrl(
    'SITE_URL',
    env.SITE_URL,
    errors
  );
  const publicSiteUrl = validateSiteUrl(
    'NEXT_PUBLIC_SITE_URL',
    env.NEXT_PUBLIC_SITE_URL,
    errors
  );

  if (
    siteUrl &&
    publicSiteUrl &&
    siteUrl !== publicSiteUrl
  ) {
    errors.push(
      'SITE_URL och NEXT_PUBLIC_SITE_URL måste peka på samma origin'
    );
  }

  const ownerEmail = extractEmail(env.OWNER_EMAIL);
  const resendFromEmail = extractEmail(env.RESEND_FROM_EMAIL);

  if (ownerEmail && !EMAIL_PATTERN.test(ownerEmail)) {
    errors.push('OWNER_EMAIL är ogiltig');
  }

  if (
    resendFromEmail &&
    !EMAIL_PATTERN.test(resendFromEmail)
  ) {
    errors.push('RESEND_FROM_EMAIL är ogiltig');
  }

  if (resendFromEmail.endsWith('@resend.dev')) {
    errors.push(
      'RESEND_FROM_EMAIL får inte använda resend.dev i produktion; verifiera en egen avsändardomän'
    );
  }

  if (
    env.ADMIN_SESSION_SECRET &&
    env.CUSTOMER_SESSION_SECRET &&
    env.ADMIN_SESSION_SECRET ===
      env.CUSTOMER_SESSION_SECRET
  ) {
    errors.push(
      'ADMIN_SESSION_SECRET och CUSTOMER_SESSION_SECRET måste vara olika'
    );
  }

  return errors;
}
