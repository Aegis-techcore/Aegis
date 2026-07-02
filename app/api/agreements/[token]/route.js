import { getCustomerBySignToken, signAgreement } from '../../../lib/customerStore';

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

const getIp = (request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  request.headers.get('x-real-ip') ||
  '';

export async function GET(_request, { params }) {
  const { token } = await params;
  const customer = await getCustomerBySignToken(token);

  if (!customer) {
    return Response.json({ message: 'Avtalet hittades inte.' }, { status: 404 });
  }

  return Response.json({ agreement: publicAgreement(customer) });
}

export async function POST(request, { params }) {
  const { token } = await params;
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: 'Ogiltig data.' }, { status: 400 });
  }

  if (!payload?.accepted) {
    return Response.json({ message: 'Du behöver godkänna avtalet först.' }, { status: 400 });
  }

  const customer = await signAgreement(token, payload, { ip: getIp(request) });

  if (!customer) {
    return Response.json({ message: 'Avtalet hittades inte.' }, { status: 404 });
  }

  return Response.json({
    agreement: publicAgreement(customer),
    login: {
      email: customer.email,
      accessCode: customer.accessCode
    }
  });
}
