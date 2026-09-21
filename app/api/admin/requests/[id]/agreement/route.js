import { Resend } from 'resend';
import { isAdminRequest } from '../../../../../lib/adminAuth';
import { createAgreementFromRequest } from '../../../../../lib/customerStore';
import { getPublicBaseUrl } from '../../../../../lib/publicUrl';
import { getContactRequest } from '../../../../../lib/requestStore';

export const runtime = 'nodejs';

const FROM_EMAIL = 'Aegis Core <onboarding@resend.dev>';
const getFromEmail = () =>
  process.env.RESEND_FROM_EMAIL ||
  process.env.CONTACT_FROM_EMAIL ||
  FROM_EMAIL;

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

  const { id } = await params;
  const contactRequest = await getContactRequest(id);

  if (!contactRequest) {
    return Response.json(
      { message: 'Förfrågan hittades inte.' },
      { status: 404 }
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const customer = await createAgreementFromRequest(
    contactRequest,
    {
      ...payload,
      price: String(payload?.price || '').trim().slice(0, 80),
      billingCycle: String(payload?.billingCycle || '').trim().slice(0, 80),
      projectTitle: String(payload?.projectTitle || '').trim().slice(0, 180),
      requirements: String(payload?.requirements || '').trim().slice(0, 10000),
      adminNotes: String(payload?.adminNotes || '').trim().slice(0, 5000)
    }
  );

  const signUrl =
    `${getPublicBaseUrl(request)}/avtal/${customer.signToken}`;
  const emailMessage = String(
    payload?.emailMessage || ''
  ).trim().slice(0, 5000);
  const contractText = String(
    customer.requirements || ''
  ).trim();
  const priceText =
    `${customer.price || 'Enligt överenskommelse'} ${customer.billingCycle || ''}`.trim();

  let emailStatus = 'not_sent';
  let emailError = '';

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(
      process.env.RESEND_API_KEY
    );

    try {
      const result = await resend.emails.send({
        from: getFromEmail(),
        to: customer.email,
        subject: 'Signera ditt avtal med Aegis',
        html: `
          <p>Hej ${escapeHtml(customer.name)},</p>
          ${emailMessage ? `<p>${escapeHtml(emailMessage).replaceAll('\n', '<br>')}</p>` : ''}
          <p>Aegis har förberett ett avtal för <strong>${escapeHtml(customer.projectTitle)}</strong>.</p>
          <p><strong>Pris:</strong> ${escapeHtml(priceText)}</p>
          <p><strong>Avtal/krav:</strong></p>
          <div style="white-space:pre-wrap;border:1px solid #d1d5db;border-radius:12px;padding:16px;background:#f8fafc;color:#111827;">${escapeHtml(contractText || 'Inga extra krav angivna.')}</div>
          <p>Öppna länken för att läsa allt och signera digitalt:</p>
          <p><a href="${escapeHtml(signUrl)}">${escapeHtml(signUrl)}</a></p>
          <p>Länken gäller i 7 dagar. När du signerar väljer du själv din kundkod för inloggning i kundportalen.</p>
          <p>Med vänliga hälsningar,<br>Aegis</p>
        `,
        text: `Hej ${customer.name},

${emailMessage ? `${emailMessage}\n\n` : ''}Aegis har förberett ett avtal för ${customer.projectTitle}.
Pris: ${priceText}

Avtal/krav:
${contractText || 'Inga extra krav angivna.'}

Signera här:
${signUrl}

Länken gäller i 7 dagar. När du signerar väljer du själv din kundkod för inloggning i kundportalen.

Med vänliga hälsningar,
Aegis`
      });

      if (result?.error) {
        emailStatus = 'failed';
        emailError =
          result.error.message ||
          'Kunde inte skicka avtalsmejlet.';
      } else {
        emailStatus = 'sent';
      }
    } catch (sendError) {
      emailStatus = 'failed';
      emailError =
        sendError.message ||
        'Kunde inte skicka avtalsmejlet.';
    }
  }

  return Response.json({
    customer: {
      ...customer,
      signUrl
    },
    emailStatus,
    emailError
  });
}
