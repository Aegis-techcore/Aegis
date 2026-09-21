const REQUIRED_KEYS = [
  'DATABASE_URL',
  'ADMIN_PASSWORD',
  'ADMIN_SESSION_SECRET',
  'CUSTOMER_SESSION_SECRET',
  'RESEND_API_KEY',
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

  const siteUrl =
    String(env.SITE_URL || '').trim();

  if (!siteUrl) {
    errors.push('SITE_URL saknas');
  } else {
    try {
      const parsed = new URL(siteUrl);

      if (parsed.protocol !== 'https:') {
        errors.push(
          'SITE_URL måste använda https i produktion'
        );
      }
    } catch {
      errors.push('SITE_URL är ogiltig');
    }
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
