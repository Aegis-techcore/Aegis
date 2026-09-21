import { Resend } from 'resend';
import { addAdminNotification } from './notificationStore';
import { saveContactRequest } from './requestStore';

const OWNER_EMAIL =
  process.env.OWNER_EMAIL || 'aegis.infon@gmail.com';

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  'Aegis Core <onboarding@resend.dev>';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const cleanSingleLine = (value, maxLength) =>
  String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, maxLength);

const cleanMultiline = (value, maxLength) =>
  String(value ?? '')
    .trim()
    .slice(0, maxLength);

const normalizePhone = (value) => {
  const compact = cleanSingleLine(value, 40)
    .replace(/[^\d+]/g, '');

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

const isValidPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

const buildInquiryText = ({
  name,
  company,
  email,
  phone,
  serviceLabel,
  message
}) => [
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

const sendSmsConfirmation = async ({
  phone,
  name
}) => {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID;
  const authToken =
    process.env.TWILIO_AUTH_TOKEN;
  const fromPhone =
    process.env.TWILIO_FROM_PHONE;

  if (
    !accountSid ||
    !authToken ||
    !fromPhone ||
    !phone
  ) {
    return;
  }

  const params = new URLSearchParams({
    From: fromPhone,
    To: phone,
    Body:
      `Hej ${name}! Tack för din förfrågan till Aegis. Vi har mottagit ditt meddelande och återkommer snart.`
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization:
          `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type':
          'application/x-www-form-urlencoded'
      },
      body: params
    }
  );

  if (!response.ok) {
    throw new Error(
      `Twilio svarade med ${response.status}`
    );
  }
};

const sendWithResend = async ({
  name,
  company,
  email,
  phone,
  serviceLabel,
  message
}) => {
  const resend = new Resend(
    process.env.RESEND_API_KEY
  );

  const inquiryText = buildInquiryText({
    name,
    company,
    email,
    phone,
    serviceLabel,
    message
  });

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

    ownerEmailError = result?.error;
  } catch (error) {
    ownerEmailError = error;
  }

  if (ownerEmailError) {
    return {
      ok: false,
      status: 502,
      message:
        'Förfrågan kunde inte skickas just nu. Försök igen senare.'
    };
  }

  try {
    const confirmation =
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject:
          'Vi har mottagit din förfrågan',
        html:
          '<p>Tack för din förfrågan. Vi har mottagit ditt meddelande och återkommer snart.</p>',
        text:
          'Tack för din förfrågan. Vi har mottagit ditt meddelande och återkommer snart.'
      });

    if (confirmation?.error) {
      throw new Error(
        confirmation.error.message ||
        'Kundbekräftelsen misslyckades.'
      );
    }
  } catch {
    // Kundbekräftelsen ska inte blockera en redan mottagen förfrågan.
  }

  try {
    await sendSmsConfirmation({ phone, name });
  } catch {
    // SMS-bekräftelsen ska inte blockera en redan mottagen förfrågan.
  }

  return {
    ok: true,
    status: 200,
    message: 'Förfrågan skickad.'
  };
};

export async function sendContactRequest(payload) {
  const name = cleanSingleLine(
    payload?.name,
    120
  );
  const company = cleanSingleLine(
    payload?.company,
    160
  );
  const email = cleanSingleLine(
    payload?.email,
    254
  ).toLowerCase();
  const phone = normalizePhone(payload?.phone);
  const service = cleanSingleLine(
    payload?.service,
    60
  );
  const message = cleanMultiline(
    payload?.message,
    5000
  );
  const serviceLabel = SERVICE_LABELS[service];

  if (
    !name ||
    !EMAIL_PATTERN.test(email) ||
    !isValidPhone(phone) ||
    !serviceLabel ||
    !message
  ) {
    return {
      ok: false,
      status: 400,
      message:
        'Kontrollera namn, e-post, telefon, tjänst och meddelande.'
    };
  }

  const requestData = {
    name,
    company,
    email,
    phone,
    service,
    serviceLabel,
    message
  };

  if (!process.env.RESEND_API_KEY) {
    const internalError =
      'RESEND_API_KEY saknas.';

    const record =
      await saveContactRequest({
        ...requestData,
        status: 'failed',
        error: internalError
      });

    await addAdminNotification({
      type: 'contact_request',
      title: 'Ny förfrågan',
      message:
        `${name} skickade en förfrågan inom ${serviceLabel}.`,
      requestId: record.id
    });

    return {
      ok: false,
      status: 503,
      message:
        'Kontaktformuläret är tillfälligt otillgängligt. Försök igen senare.'
    };
  }

  const result = await sendWithResend({
    name,
    company,
    email,
    phone,
    serviceLabel,
    message
  });

  const record = await saveContactRequest({
    ...requestData,
    status: result.ok ? 'sent' : 'failed',
    error: result.ok ? '' : result.message
  });

  await addAdminNotification({
    type: 'contact_request',
    title: 'Ny förfrågan',
    message:
      `${name} skickade en förfrågan inom ${serviceLabel}.`,
    requestId: record.id
  });

  return result;
}
