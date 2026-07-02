import { isAdminRequest } from '../../../../lib/adminAuth';
import { deleteCustomer, updateCustomer } from '../../../../lib/customerStore';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  const { id } = await params;
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: 'Ogiltig data.' }, { status: 400 });
  }

  const customer = await updateCustomer(id, payload);

  if (!customer) {
    return Response.json({ message: 'Kunden hittades inte.' }, { status: 404 });
  }

  return Response.json({ customer });
}

export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteCustomer(id);

  if (!deleted) {
    return Response.json({ message: 'Kunden hittades inte.' }, { status: 404 });
  }

  return Response.json({ message: 'Kunden togs bort.' });
}
