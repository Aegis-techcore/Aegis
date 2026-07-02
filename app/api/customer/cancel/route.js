import { getCustomerIdFromRequest } from '../../../lib/customerAuth';
import { requestCustomerCancellation } from '../../../lib/customerStore';

export const runtime = 'nodejs';

const publicCustomer = (customer) => ({
  id: customer.id,
  type: customer.type,
  status: customer.status,
  name: customer.name,
  company: customer.company,
  email: customer.email,
  phone: customer.phone,
  plan: customer.plan,
  price: customer.price,
  billingCycle: customer.billingCycle,
  projectTitle: customer.projectTitle,
  requirements: customer.requirements,
  signedAt: customer.signedAt,
  cancellationRequestedAt: customer.cancellationRequestedAt,
  cancelledAt: customer.cancelledAt,
  cancellationReason: customer.cancellationReason,
  messages: customer.messages || []
});

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

  return Response.json({ customer: publicCustomer(customer) });
}
