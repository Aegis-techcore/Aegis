import { getCustomerIdFromRequest } from '../../../lib/customerAuth';
import { requestCustomerCancellation } from '../../../lib/customerStore';

export const runtime = 'nodejs';

export async function POST(request) {
  const customerId = getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const customer = await requestCustomerCancellation(customerId, payload?.reason);

  if (!customer) {
    return Response.json({ message: 'Kunden hittades inte.' }, { status: 404 });
  }

  return Response.json({ customer });
}
