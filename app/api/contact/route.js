import { sendContactRequest } from '../../lib/contact';

export const runtime = 'nodejs';

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: 'Formuläret skickade ogiltig data.' }, { status: 400 });
  }

  const result = await sendContactRequest(payload);
  return Response.json({ message: result.message }, { status: result.status });
}
