import { isAdminRequest } from '../../../lib/adminAuth';
import { getCustomerStats, listCustomers } from '../../../lib/customerStore';
import { getPublicBaseUrl } from '../../../lib/publicUrl';

export const runtime = 'nodejs';

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return Response.json(
      { message: 'Inte inloggad.' },
      { status: 401 }
    );
  }

  const customers = await listCustomers();
  const baseUrl = getPublicBaseUrl(request);

  return Response.json({
    customers: customers.map((customer) => ({
      ...customer,
      signUrl: customer.signToken
        ? `${baseUrl}/avtal/${customer.signToken}`
        : ''
    })),
    stats: getCustomerStats(customers)
  });
}
