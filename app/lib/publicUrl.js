const cleanUrl = (value) =>
  String(value || '').trim().replace(/\/+$/, '');

const parseHttpUrl = (value) => {
  const cleaned = cleanUrl(value);

  if (!cleaned) {
    return '';
  }

  const parsed = new URL(cleaned);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Publik URL måste använda http eller https.');
  }

  return parsed.origin + parsed.pathname.replace(/\/+$/, '');
};

export function getPublicBaseUrl(request) {
  const configured =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configured) {
    return parseHttpUrl(configured);
  }

  if (process.env.VERCEL_URL) {
    return parseHttpUrl(
      `https://${String(process.env.VERCEL_URL)
        .replace(/^https?:\/\//, '')}`
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    const origin = request?.headers?.get('origin');

    if (origin) {
      return parseHttpUrl(origin);
    }

    return 'http://localhost:3000';
  }

  throw new Error(
    'SITE_URL eller NEXT_PUBLIC_SITE_URL måste vara konfigurerad i produktion.'
  );
}
