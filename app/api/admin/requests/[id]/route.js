import { isAdminRequest } from '../../../../lib/adminAuth';
import { deleteContactRequest } from '../../../../lib/requestStore';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteContactRequest(id);

  if (!deleted) {
    return Response.json({ message: 'Förfrågan hittades inte.' }, { status: 404 });
  }

  return Response.json({ message: 'Förfrågan borttagen.' });
}
