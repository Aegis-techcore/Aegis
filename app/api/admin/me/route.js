import { isAdminRequest } from '../../../lib/adminAuth';

export const runtime = 'nodejs';

export async function GET(request) {
  return Response.json({ authenticated: isAdminRequest(request) });
}
