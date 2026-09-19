import { NextResponse } from 'next/server';
import {
  CUSTOMER_COOKIE_NAME,
  createCustomerToken
} from '../../../lib/customerAuth';
import { findCustomerByLogin } from '../../../lib/customerStore';
import {
  checkRateLimit,
  rateLimitResponse
} from '../../../lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(request) {
  const rateLimit = checkRateLimit(request, {
    key: 'customer-login',
    limit: 8,
    windowMs: 5 * 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: 'Ogiltig data.' },
      { status: 400 }
    );
  }

  const customer = await findCustomerByLogin(
    payload?.email,
    payload?.accessCode
  );

  if (!customer) {
    return NextResponse.json(
      { message: 'Fel e-post eller kundkod.' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      status: customer.status
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

  return response;
}
