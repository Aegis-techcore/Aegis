import { addAdminNotification } from '../../lib/notificationStore';
import {
  checkRateLimit,
  rateLimitResponse
} from '../../lib/rateLimit';
import { saveContactRequest } from '../../lib/requestStore';

export const runtime = 'nodejs';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanSingleLine = (value, maxLength) =>
  String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, maxLength);

const cleanMultiline = (value, maxLength) =>
  String(value ?? '')
    .trim()
    .slice(0, maxLength);

export async function POST(request) {
  const rateLimit = checkRateLimit(request, {
    key: 'consumer-withdrawal',
    limit: 5,
    windowMs: 10 * 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: 'Formuläret skickade ogiltig data.' },
      { status: 400 }
    );
  }

  const name = cleanSingleLine(body?.name, 120);
  const email = cleanSingleLine(
    body?.email,
    254
  ).toLowerCase();
  const reference = cleanSingleLine(
    body?.reference,
    160
  );
  const note = cleanMultiline(body?.note, 2000);

  if (
    !name ||
    !EMAIL_PATTERN.test(email) ||
    body?.confirmWithdrawal !== true
  ) {
    return Response.json(
      {
        message:
          'Fyll i namn och giltig e-post och bekräfta att du vill använda ångerrätten.'
      },
      { status: 400 }
    );
  }

  const message = [
    'Kunden meddelar att hen vill använda sin ångerrätt.',
    reference ? `Referens: ${reference}` : '',
    note ? `Kommentar: ${note}` : ''
  ].filter(Boolean).join('\n');

  const record = await saveContactRequest({
    name,
    company: '',
    email,
    phone: '',
    service: 'withdrawal',
    serviceLabel: 'Ångerrätt / frånträde',
    message,
    status: 'sent',
    error: ''
  });

  await addAdminNotification({
    type: 'consumer_withdrawal',
    title: 'Begäran om ångerrätt',
    message:
      `${name} har registrerat en begäran om ångerrätt. Kontrollera avtal, utfört arbete och eventuell återbetalning.`,
    requestId: record.id
  });

  return Response.json({
    message:
      'Din begäran om ångerrätt är registrerad. Aegis återkommer efter kontroll av avtalet och eventuell återbetalning.',
    referenceId: record.id,
    receivedAt: record.createdAt
  });
}
