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
      subject: "Din förfrågan har godkänts",
      html: `
        <p>Hej ${safeName},</p>
        <p>Tack för din förfrågan till Aegis.</p>
        <p>Vi har gått igenom ditt meddelande och vill meddela att din förfrågan har godkänts.</p>
        <p>Vi kommer att återkomma med mer information, detaljer kring nästa steg och första fakturan så snart som möjligt.</p>
        <p>Med vänliga hälsningar,<br/>
        Aegis<br/>
        Secure by Design. Built for Tomorrow.</p>
      `,
      text: `Hej ${name},

Tack för din förfrågan till Aegis.

Vi har gått igenom ditt meddelande och vill meddela att din förfrågan har godkänts.

Vi kommer att återkomma med mer information, detaljer kring nästa steg och första fakturan så snart som möjligt.

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
      message: "Godkännandemail skickat."
    });
  } catch (error) {
    console.error('Admin contact email error:', error);

    return Response.json(
      { message: 'E-postmeddelandet kunde inte skickas.' },
      { status: 502 }
    );
  }
}
