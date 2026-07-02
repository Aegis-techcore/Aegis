import { NextResponse } from 'next/server';
import { CUSTOMER_COOKIE_NAME, createCustomerToken } from '../../../lib/customerAuth';
import { createMembershipCustomer, listCustomers } from '../../../lib/customerStore';
import { addAdminNotification } from '../../../lib/notificationStore';

export const runtime = 'nodejs';

const planPrices = {
  Privat: '399 kr',
  Start: '899 kr',
  Plus: '1 790 kr',
  Pro: '3 490 kr',
  Business: '6 990 kr'
};

const sanitize = (value) => String(value || '').trim();

const getIp = (request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  request.headers.get('x-real-ip') ||
  '';

const detectCardBrand = (digits) => {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Kort';
};

const isFutureExpiry = (month, year) => {
  const numericMonth = Number(month);
  const numericYear = Number(year);

  if (!numericMonth || !numericYear || numericMonth < 1 || numericMonth > 12) {
    return false;
  }

  const now = new Date();
  const expiry = new Date(numericYear, numericMonth, 1);

  return expiry > now;
};

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Ogiltig data.' }, { status: 400 });
  }

  const plan = sanitize(payload?.plan);
  const name = sanitize(payload?.name);
  const email = sanitize(payload?.email).toLowerCase();
  const phone = sanitize(payload?.phone);
  const accessCode = sanitize(payload?.accessCode)
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '');
  const cardHolder = sanitize(payload?.cardHolder);
  const cardDigits = sanitize(payload?.cardNumber).replace(/\D/g, '');
  const cvc = sanitize(payload?.cvc).replace(/\D/g, '');
  const expMonth = sanitize(payload?.expMonth).padStart(2, '0');
  const expYear = sanitize(payload?.expYear).length === 2
    ? `20${sanitize(payload?.expYear)}`
    : sanitize(payload?.expYear);

  if (!planPrices[plan]) {
    return NextResponse.json({ message: 'Välj ett giltigt abonnemang.' }, { status: 400 });
  }

  if (!name || !email || !phone) {
    return NextResponse.json({ message: 'Fyll i namn, e-post och telefon.' }, { status: 400 });
  }

  if (accessCode.length < 8) {
    return NextResponse.json({ message: 'Skapa en kundkod med minst 8 tecken.' }, { status: 400 });
  }

  const customers = await listCustomers();
  const loginAlreadyExists = customers.some((customer) =>
    String(customer.email || '').toLowerCase() === email &&
    String(customer.accessCode || '').toUpperCase() === accessCode
  );

  if (loginAlreadyExists) {
    return NextResponse.json({ message: 'Den kundkoden används redan för denna e-post.' }, { status: 409 });
  }

  if (!payload?.acceptedTerms) {
    return NextResponse.json({ message: 'Du behöver godkänna medlemskraven först.' }, { status: 400 });
  }

  if (!cardHolder || cardDigits.length < 12 || cardDigits.length > 19 || cvc.length < 3 || cvc.length > 4 || !isFutureExpiry(expMonth, expYear)) {
    return NextResponse.json({ message: 'Kontrollera kortuppgifterna.' }, { status: 400 });
  }

  const customer = await createMembershipCustomer({
    plan,
    price: planPrices[plan],
    billingCycle: 'per månad',
    name,
    company: payload?.company,
    email,
    phone,
    accessCode,
    signatureTitle: payload?.signatureTitle,
    requirements: payload?.requirements,
    cardBrand: detectCardBrand(cardDigits),
    cardLast4: cardDigits.slice(-4),
    cardHolder,
    expMonth,
    expYear,
    paymentMode: 'test'
  }, { ip: getIp(request) });

  const response = NextResponse.json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      status: customer.status,
      accessCode: customer.accessCode,
      paymentMethod: customer.paymentMethod
    }
  });

  response.cookies.set({
    name: CUSTOMER_COOKIE_NAME,
    value: createCustomerToken(customer.id),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });

  await addAdminNotification({
    type: 'new_membership',
    title: 'Ny medlem',
    message: `${customer.name} blev medlem på ${customer.plan}.`,
    customerId: customer.id
  });

  return response;
}
