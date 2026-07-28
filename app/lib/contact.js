import { Resend } from 'resend';
import { addAdminNotification } from './notificationStore';
import { saveContactRequest } from './requestStore';

const OWNER_EMAIL =
  process.env.OWNER_EMAIL || 'aegis.infon@gmail.com';

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'Aegis Core <onboarding@resend.dev>';

const SERVICE_LABELS = {
  programming: 'Programmering & Utveckling',
  fullstack: 'Fullstack-utveckling',
  data: 'Data & Excel-automation',
  cybersecurity: 'Cybersäkerhet',
  network: 'Nätverk & Brandvägg',
  embedded: 'Embedded Systems / IoT',
  ai: 'AI-chatbot / Automation',
  maintenance: 'Webbunderhåll & IT-support',
  games: 'Spelutveckling'
};

const sanitize = (value) => String(value || '').trim();

const normalizePhone = (value) => {
  const compact = sanitize(value).replace(/[^\d+]/g, '');

  if (!compact) {
    return '';
  }

  if (compact.startsWith('00')) {
    return `+${compact.slice(2)}`;
  }

  if (compact.startsWith('+')) {
    return compact;
  }

  if (compact.startsWith('0')) {
    return `+46${compact.slice(1)}`;
  }

  return `+${compact}`;
};

const buildInquiryText = ({ name, company, email, phone, serviceLabel, message }) => [
  `Namn: ${name}`,
  `Företag: ${company || 'Ej angivet'}`,
  `E-post: ${email}`,
  `Telefon: ${phone}`,
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

const sendSmsConfirmation = async ({ phone, name }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_FROM_PHONE;

  if (!accountSid || !authToken || !fromPhone || !phone) {
    return;
  }

  const params = new URLSearchParams({
    From: fromPhone,
    To: phone,
    Body: `Hej ${name}! Tack för din förfrågan till Aegis. Vi har mottagit ditt meddelande och återkommer snart.`
  });

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });
};

const sendWithResend = async ({ name, company, email, phone, serviceLabel, message }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const inquiryText = buildInquiryText({ name, company, email, phone, serviceLabel, message });
  const inquiryHtml = `
    <h2>Ny förfrågan från ${escapeHtml(name)}</h2>
    <p><strong>Namn:</strong> ${escapeHtml(name)}</p>
    <p><strong>Företag:</strong> ${escapeHtml(company || 'Ej angivet')}</p>
    <p><strong>E-post:</strong> ${escapeHtml(email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Huvudområde:</strong> ${escapeHtml(serviceLabel)}</p>
    <p><strong>Projektbeskrivning:</strong></p>
    <p>${escapeHtml(message).replaceAll('\n', '<br>')}</p>
  `;

  let ownerEmailError;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `Ny förfrågan från ${name}`,
      html: inquiryHtml,
      text: inquiryText
    });
    ownerEmailError = result.error;
  } catch (error) {
    ownerEmailError = error;
  }

  if (ownerEmailError) {
    return { ok: false, status: 502, message: `Kunde inte skicka förfrågan till mottagaren: ${ownerEmailError.message}` };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Vi har mottagit din förfrågan',
      html: '<p>Tack för din förfrågan. Vi har mottagit ditt meddelande och återkommer snart.</p>',
      text: 'Tack för din förfrågan. Vi har mottagit ditt meddelande och återkommer snart.'
    });
  } catch {
    // Kundbekräftelsen ska inte blockera förfrågan när ägarmailet redan är skickat.
  }

  try {
    await sendSmsConfirmation({ phone, name });
  } catch {
    // SMS-bekräftelsen ska inte blockera förfrågan när ägarmailet redan är skickat.
  }

  return { ok: true, status: 200, message: 'Förfrågan skickad.' };
};

export async function sendContactRequest(payload) {
  const name = sanitize(payload?.name);
  const company = sanitize(payload?.company);
  const email = sanitize(payload?.email);
  const phone = normalizePhone(payload?.phone);
  const service = sanitize(payload?.service);
  const message = sanitize(payload?.message);
  const serviceLabel = SERVICE_LABELS[service] || service;
  const requestData = { name, company, email, phone, service, serviceLabel, message };

  if (!name || !email || !phone || !service || !message) {
    return { ok: false, status: 400, message: 'Alla fält måste fyllas i.' };
  }

  if (!process.env.RESEND_API_KEY) {
    const result = { ok: false, status: 500, message: 'Servern saknar RESEND_API_KEY. Lägg till den i environment variables.' };
    const record = await saveContactRequest({ ...requestData, status: 'failed', error: result.message });
    await addAdminNotification({
      type: 'contact_request',
      title: 'Ny förfrågan',
      message: `${name} skickade en förfrågan inom ${serviceLabel}.`,
      requestId: record.id
    });
    return result;
  }

  const result = await sendWithResend({ name, company, email, phone, serviceLabel, message });

  const record = await saveContactRequest({
    ...requestData,
    status: result.ok ? 'sent' : 'failed',
    error: result.ok ? '' : result.message,
  });

  await addAdminNotification({
    type: 'contact_request',
    title: 'Ny förfrågan',
    message: `${name} skickade en förfrågan inom ${serviceLabel}.`,
    requestId: record.id
  });

  return result;
}
