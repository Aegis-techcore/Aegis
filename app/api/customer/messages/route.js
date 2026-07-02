import { getCustomerIdFromRequest } from '../../../lib/customerAuth';
import { addCustomerMessage, getCustomer } from '../../../lib/customerStore';

export const runtime = 'nodejs';

export async function POST(request) {
  const customerId = getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  const customer = await getCustomer(customerId);

  if (!customer) {
    return Response.json({ message: 'Kunden hittades inte.' }, { status: 404 });
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: 'Ogiltig data.' }, { status: 400 });
  }

  const message = await addCustomerMessage(customerId, 'customer', payload?.message);

  if (!message) {
    return Response.json({ message: 'Skriv ett meddelande först.' }, { status: 400 });
  }

  return Response.json({ message });
}
