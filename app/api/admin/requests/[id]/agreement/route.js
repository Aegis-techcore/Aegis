import { Resend } from 'resend';
import { isAdminRequest } from '../../../../../lib/adminAuth';
import { createAgreementFromRequest } from '../../../../../lib/customerStore';
import { getContactRequest } from '../../../../../lib/requestStore';

export const runtime = 'nodejs';

const FROM_EMAIL = 'onboarding@resend.dev';

const getBaseUrl = (request) => {
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
};

const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export async function POST(request, { params }) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Inte inloggad.' }, { status: 401 });
  }

  const { id } = await params;
  const contactRequest = await getContactRequest(id);

  if (!contactRequest) {
    return Response.json({ message: 'Förfrågan hittades inte.' }, { status: 404 });
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const customer = await createAgreementFromRequest(contactRequest, payload);
  const signUrl = `${getBaseUrl(request)}/avtal/${customer.signToken}`;
  let emailStatus = 'not_sent';

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject: 'Signera ditt avtal med Aegis',
      html: `
        <p>Hej ${escapeHtml(customer.name)},</p>
        <p>Aegis har förberett ett avtal för ${escapeHtml(customer.projectTitle)}.</p>
        <p><strong>Pris:</strong> ${escapeHtml(customer.price || 'Enligt överenskommelse')} ${escapeHtml(customer.billingCycle)}</p>
        <p>Öppna länken för att läsa kraven och signera digitalt:</p>
        <p><a href="${escapeHtml(signUrl)}">${escapeHtml(signUrl)}</a></p>
        <p>Din kundkod för inloggning efter signering är: <strong>${escapeHtml(customer.accessCode)}</strong></p>
        <p>Med vänliga hälsningar,<br>Aegis</p>
      `,
      text: `Hej ${customer.name},

Aegis har förberett ett avtal för ${customer.projectTitle}.
Pris: ${customer.price || 'Enligt överenskommelse'} ${customer.billingCycle}

Signera här:
${signUrl}

Din kundkod för inloggning efter signering är:
${customer.accessCode}

Med vänliga hälsningar,
Aegis`
    });
    emailStatus = 'sent';
  }

  return Response.json({
    customer: {
      ...customer,
      signUrl
    },
    emailStatus
  });
}
