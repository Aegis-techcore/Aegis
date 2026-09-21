import { Resend } from 'resend';
import { isAdminRequest } from '../../../../../lib/adminAuth';
import { getContactRequest } from '../../../../../lib/requestStore';

export const runtime = 'nodejs';

const FROM_EMAIL = 'Aegis Core <onboarding@resend.dev>';

const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export async function POST(request, { params }) {
  if (!isAdminRequest(request)) {
    return Response.json(
      { message: 'Inte inloggad.' },
      { status: 401 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { message: 'E-posttjänsten är inte konfigurerad.' },
      { status: 503 }
    );
  }

  const { id } = await params;
  const contactRequest = await getContactRequest(id);

  if (!contactRequest) {
    return Response.json(
      { message: 'Förfrågan hittades inte.' },
      { status: 404 }
    );
  }

  const name = String(contactRequest.name || '')
    .trim()
    .slice(0, 120);
  const safeName = escapeHtml(name);
  const resend = new Resend(
    process.env.RESEND_API_KEY
  );

  try {
    const result = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        FROM_EMAIL,
      to: contactRequest.email,
      subject: "Svar på din förfrågan",
      html: `
        <p>Hej ${safeName},</p>
        <p>Tack för att du kontaktade Aegis.</p>
        <p>Vi har läst igenom din förfrågan och behöver tyvärr meddela att vi inte kommer kunna hantera den just nu.</p>
        <p>Vi återkommer så snart vi kan för att förklara situationen och ge dig mer information.</p>
        <p>Med vänliga hälsningar,<br/>
        Aegis<br/>
        Secure by Design. Built for Tomorrow.</p>
      `,
      text: `Hej ${name},

Tack för att du kontaktade Aegis.

Vi har läst igenom din förfrågan och behöver tyvärr meddela att vi inte kommer kunna hantera den just nu.

Vi återkommer så snart vi kan för att förklara situationen och ge dig mer information.

Med vänliga hälsningar,
Aegis
Secure by Design. Built for Tomorrow.`
    });

    if (result?.error) {
      throw new Error(
        result.error.message ||
        'E-posttjänsten returnerade ett fel.'
      );
    }

    return Response.json({
      message: "Nekningsmail skickat."
    });
  } catch (error) {
    console.error('Admin contact email error:', error);

    return Response.json(
      { message: 'E-postmeddelandet kunde inte skickas.' },
      { status: 502 }
    );
  }
}
