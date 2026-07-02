import { Resend } from 'resend';
import { isAdminRequest } from '../../../../../lib/adminAuth';
import { getContactRequest } from '../../../../../lib/requestStore';

export const runtime = 'nodejs';

const FROM_EMAIL = 'onboarding@resend.dev';

export async function POST(request, { params }) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  const { id } = await params;
  const contactRequest = await getContactRequest(id);

  if (!contactRequest) {
    return Response.json({ message: 'Förfrågan hittades inte.' }, { status: 404 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: contactRequest.email,
    subject: 'Din förfrågan har godkänts',
    html: `
      <p>Hej ${contactRequest.name},</p>

      <p>Tack för din förfrågan till Aegis.</p>

      <p>Vi har gått igenom ditt meddelande och vill meddela att din förfrågan har godkänts.</p>

      <p>Vi kommer att återkomma med mer information, detaljer kring nästa steg och första fakturan så snart som möjligt.</p>

      <p>Med vänliga hälsningar,<br/>
      Aegis<br/>
      Secure by Design. Built for Tomorrow.</p>
    `,
    text: `Hej ${contactRequest.name},

Tack för din förfrågan till Aegis.

Vi har gått igenom ditt meddelande och vill meddela att din förfrågan har godkänts.

Vi kommer att återkomma med mer information, detaljer kring nästa steg och första fakturan så snart som möjligt.

Med vänliga hälsningar,
Aegis
Secure by Design. Built for Tomorrow.`
  });

  return Response.json({ message: 'Godkännandemail skickat.' });
}