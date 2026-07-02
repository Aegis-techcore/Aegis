import { isAdminRequest } from '../../../lib/adminAuth';
import { getCustomerStats, listCustomers } from '../../../lib/customerStore';

export const runtime = 'nodejs';

const getBaseUrl = (request) => {
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
};

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  const customers = await listCustomers();
  const baseUrl = getBaseUrl(request);

  return Response.json({
    customers: customers.map((customer) => ({
      ...customer,
      signUrl: customer.signToken ? `${baseUrl}/avtal/${customer.signToken}` : ''
    })),
    stats: getCustomerStats(customers)
  });
}
