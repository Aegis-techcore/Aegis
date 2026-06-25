const OWNER_EMAIL = 'aegis.infon@gmail.com';
const FROM_EMAIL = 'onboarding@resend.dev';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const SERVICE_LABELS = {
  programming: 'Programmering & Utveckling',
  fullstack: 'Fullstack-utveckling',
  data: 'Data & Excel-automation',
  cybersecurity: 'Cybersäkerhet',
  network: 'Nätverk & Brandvägg',
  embedded: 'Embedded Systems / IoT',
  ai: 'AI-chatbot / Automation',
  games: 'Spelutveckling'
};

const sanitize = (value) => String(value || '').trim();

const buildInquiryText = ({ name, email, serviceLabel, message }) => [
  `Namn: ${name}`,
  `E-post: ${email}`,
  `Huvudområde: ${serviceLabel}`,
  '',
  'Projektbeskrivning:',
  message
].join('\n');

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const sendEmail = async (payload) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    return { ok: true };
  }

  const errorText = await response.text().catch(() => '');
  return { ok: false, error: errorText || response.statusText };
};

const sendWithResend = async ({ name, email, serviceLabel, message }) => {
  const inquiryText = buildInquiryText({ name, email, serviceLabel, message });
  const inquiryHtml = `
    <h2>Ny förfrågan från ${escapeHtml(name)}</h2>
    <p><strong>Namn:</strong> ${escapeHtml(name)}</p>
    <p><strong>E-post:</strong> ${escapeHtml(email)}</p>
    <p><strong>Huvudområde:</strong> ${escapeHtml(serviceLabel)}</p>
    <p><strong>Projektbeskrivning:</strong></p>
    <p>${escapeHtml(message).replaceAll('\n', '<br>')}</p>
  `;

  const ownerEmailSent = await sendEmail({
    from: FROM_EMAIL,
    to: OWNER_EMAIL,
    subject: `Ny förfrågan från ${name}`,
    html: inquiryHtml,
    text: inquiryText
  });

  if (!ownerEmailSent.ok) {
    return { ok: false, status: 502, message: `Kunde inte skicka förfrågan till mottagaren: ${ownerEmailSent.error}` };
  }

  await sendEmail({
    from: FROM_EMAIL,
    to: email,
    subject: 'Vi har mottagit din förfrågan',
    html: '<p>Tack för din förfrågan. Vi har mottagit ditt meddelande och återkommer snart.</p>',
    text: 'Tack för din förfrågan. Vi har mottagit ditt meddelande och återkommer snart.'
  });

  return { ok: true, status: 200, message: 'Förfrågan skickad.' };
};

export async function sendContactRequest(payload) {
  const name = sanitize(payload?.name);
  const email = sanitize(payload?.email);
  const service = sanitize(payload?.service);
  const message = sanitize(payload?.message);
  const serviceLabel = SERVICE_LABELS[service] || service;

  if (!name || !email || !service || !message) {
    return { ok: false, status: 400, message: 'Alla fält måste fyllas i.' };
  }

  if (!RESEND_API_KEY) {
    return { ok: false, status: 500, message: 'Servern saknar RESEND_API_KEY. Lägg till den i environment variables.' };
  }

  return sendWithResend({ name, email, serviceLabel, message });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const result = await sendContactRequest(req.body);
  return res.status(result.status).json({ message: result.message });
}
