import { getCustomerIdFromRequest } from '../../../lib/customerAuth';
import { getCustomer } from '../../../lib/customerStore';

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
  paymentMethod: customer.paymentMethod,
  messages: customer.messages || []
});

export async function GET(request) {
  const customerId = getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  const customer = await getCustomer(customerId);

  if (!customer) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  return Response.json({ authenticated: true, customer: publicCustomer(customer) });
}
