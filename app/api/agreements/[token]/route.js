import {
  isValidAccessCode,
  normalizeAccessCode
} from '../../../lib/customerAuth';
import {
  getCustomerBySignToken,
  signAgreement
} from '../../../lib/customerStore';
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse
} from '../../../lib/rateLimit';

export const runtime = 'nodejs';

const publicAgreement = (customer) => ({
  id: customer.id,
  type: customer.type,
  status: customer.status,
  name: customer.name,
  company: customer.company,
  email: customer.email,
  phone: customer.phone,
  plan: customer.plan,
  price: customer.price,
  billingCycle: customer.billingCycle,
  projectTitle: customer.projectTitle,
  requirements: customer.requirements,
  serviceLabel: customer.serviceLabel,
  signedAt: customer.signedAt,
  signatureName: customer.signatureName
});

export async function GET(request, { params }) {
  const rateLimit = checkRateLimit(request, {
    key: 'agreement-read',
    limit: 30,
    windowMs: 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  const { token } = await params;
  const customer = await getCustomerBySignToken(token);

  if (!customer) {
    return Response.json(
      { message: 'Avtalet hittades inte eller har gått ut.' },
      { status: 404 }
    );
  }

  return Response.json({
    agreement: publicAgreement(customer)
  });
}

export async function POST(request, { params }) {
  const rateLimit = checkRateLimit(request, {
    key: 'agreement-sign',
    limit: 8,
    windowMs: 10 * 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  const { token } = await params;
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { message: 'Ogiltig data.' },
      { status: 400 }
    );
  }

  if (payload?.accepted !== true) {
    return Response.json(
      {
        message:
          'Du behöver godkänna avtalet först.'
      },
      { status: 400 }
    );
  }

  const accessCode = normalizeAccessCode(
    payload?.accessCode
  );

  if (!isValidAccessCode(accessCode)) {
    return Response.json(
      {
        message:
          'Kundkoden måste innehålla 8–64 bokstäver, siffror eller bindestreck.'
      },
      { status: 400 }
    );
  }

  const customer = await signAgreement(
    token,
    {
      ...payload,
      signatureName: String(
        payload?.signatureName || ''
      ).trim().slice(0, 120),
      signatureTitle: String(
        payload?.signatureTitle || ''
      ).trim().slice(0, 120),
      accessCode
    },
    { ip: getClientIp(request) }
  );

  if (!customer) {
    return Response.json(
      { message: 'Avtalet hittades inte eller har gått ut.' },
      { status: 404 }
    );
  }

  return Response.json({
    agreement: publicAgreement(customer),
    login: {
      email: customer.email
    }
  });
}
