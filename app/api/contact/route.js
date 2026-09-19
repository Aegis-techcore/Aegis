import { sendContactRequest } from '../../lib/contact';
import {
  checkRateLimit,
  rateLimitResponse
} from '../../lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(request) {
  const rateLimit = checkRateLimit(request, {
    key: 'contact',
    limit: 5,
    windowMs: 10 * 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        message:
          'Formuläret skickade ogiltig data.'
      },
      { status: 400 }
    );
  }

  const result = await sendContactRequest(payload);

  return Response.json(
    { message: result.message },
    { status: result.status }
  );
}
