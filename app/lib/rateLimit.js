const DEFAULT_WINDOW_MS = 60_000;

const buckets =
  globalThis.__aegisRateLimitBuckets ||
  new Map();

if (!globalThis.__aegisRateLimitBuckets) {
  globalThis.__aegisRateLimitBuckets = buckets;
}

export function getClientIp(request) {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers
    .get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim();

  return forwarded || 'unknown';
}

export function checkRateLimit(
  request,
  {
    key = 'default',
    limit = 20,
    windowMs = DEFAULT_WINDOW_MS
  } = {}
) {
  const now = Date.now();
  const identifier = `${key}:${getClientIp(request)}`;
  const current = buckets.get(identifier);

  if (!current || current.resetAt <= now) {
    const next = {
      count: 1,
      resetAt: now + windowMs
    };

    buckets.set(identifier, next);
    cleanupExpiredBuckets(now);

    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: 0
    };
  }

  current.count += 1;

  if (current.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000)
      )
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: 0
  };
}

export function rateLimitResponse(result) {
  return Response.json(
    {
      message:
        'För många försök. Vänta en stund och försök igen.'
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSeconds)
      }
    }
  );
}

function cleanupExpiredBuckets(now) {
  if (buckets.size < 500) {
    return;
  }

  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key);
    }
  }
}
