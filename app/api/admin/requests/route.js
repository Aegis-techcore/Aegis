import { isAdminRequest } from '../../../lib/adminAuth';
import { listContactRequests } from '../../../lib/requestStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  const requests = await listContactRequests();
  return Response.json({ requests });
}
