import { NextResponse } from 'next/server';
import { CUSTOMER_COOKIE_NAME } from '../../../lib/customerAuth';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ message: 'Utloggad.' });

  response.cookies.set({
    name: CUSTOMER_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });

  return response;
}
