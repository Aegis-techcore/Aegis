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
    subject: 'Svar på din förfrågan',
    html: `
      <p>Hej ${contactRequest.name},</p>

      <p>Tack för att du kontaktade Aegis.</p>

      <p>Vi har läst igenom din förfrågan och behöver tyvärr meddela att vi inte kommer kunna hantera den just nu.</p>

      <p>Vi återkommer så snart vi kan för att förklara situationen och ge dig mer information.</p>

      <p>Med vänliga hälsningar,<br/>
      Aegis<br/>
      Secure by Design. Built for Tomorrow.</p>
    `,
    text: `Hej ${contactRequest.name},

Tack för att du kontaktade Aegis.

Vi har läst igenom din förfrågan och behöver tyvärr meddela att vi inte kommer kunna hantera den just nu.

Vi återkommer så snart vi kan för att förklara situationen och ge dig mer information.

Med vänliga hälsningar,
Aegis
Secure by Design. Built for Tomorrow.`
  });

  return Response.json({ message: 'Nekningsmail skickat.' });
}