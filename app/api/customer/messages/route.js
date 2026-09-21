import {
  getCustomerIdFromRequest
} from '../../../lib/customerAuth';
import {
  addCustomerMessage,
  getCustomer
} from '../../../lib/customerStore';
import {
  addAdminNotification
} from '../../../lib/notificationStore';
import {
  checkRateLimit,
  rateLimitResponse
} from '../../../lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(request) {
  const customerId =
    getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json(
      { message: 'Inte inloggad.' },
      { status: 401 }
    );
  }

  const rateLimit = checkRateLimit(request, {
    key: `customer-message:${customerId}`,
    limit: 20,
    windowMs: 5 * 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  const customer = await getCustomer(customerId);

  if (!customer) {
    return Response.json(
      { message: 'Kunden hittades inte.' },
      { status: 404 }
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { message: 'Ogiltig data.' },
      { status: 400 }
    );
  }

  const rawMessage = String(
    payload?.message || ''
  ).trim();

  if (!rawMessage) {
    return Response.json(
      { message: 'Skriv ett meddelande först.' },
      { status: 400 }
    );
  }

  if (rawMessage.length > 5000) {
    return Response.json(
      {
        message:
          'Meddelandet får innehålla högst 5000 tecken.'
      },
      { status: 400 }
    );
  }

  const message = await addCustomerMessage(
    customerId,
    'customer',
    rawMessage
  );

  await addAdminNotification({
    type: 'customer_message',
    title: 'Nytt kundmeddelande',
    message:
      `${customer.name} skrev i kundportalen.`,
    customerId: customer.id
  });

  return Response.json({ message });
}
