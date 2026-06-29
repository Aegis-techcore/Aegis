import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, createAdminToken, isAdminPasswordValid } from '../../../lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Ogiltig inloggning.' }, { status: 400 });
  }

  if (!isAdminPasswordValid(payload?.password)) {
    return NextResponse.json({ message: 'Fel lösenord.' }, { status: 401 });
  }

  const response = NextResponse.json({ message: 'Inloggad.' });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminToken(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
