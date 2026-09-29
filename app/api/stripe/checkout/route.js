import { NextResponse } from 'next/server';
import {
  isValidAccessCode,
  normalizeAccessCode
} from '../../../lib/customerAuth';
import { createPendingMembershipCustomer } from '../../../lib/customerStore';
import {
  getClientIp,
  checkRateLimit,
  rateLimitResponse
} from '../../../lib/rateLimit';
import { getPublicBaseUrl } from '../../../lib/publicUrl';
import { getStripe } from '../../../lib/stripe';
import { getStripePlan } from '../../../lib/stripePlans';

export const runtime = 'nodejs';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value, maxLength) =>
  String(value ?? '').trim().slice(0, maxLength);

const MEMBERSHIP_TERMS_VERSION = '2026-09-29';

const buildMembershipRequirements = (stripePlan) => [
  `Villkorsversion: ${MEMBERSHIP_TERMS_VERSION}`,
  `Medlemskapet gäller abonnemanget ${stripePlan.name} för ${stripePlan.displayPrice}/månad.`,
  'Aegis hjälper med webbundehåll, mindre utveckling, teknisk rådgivning och IT-support inom vald nivå.',
  'Extra arbete utöver abonnemangets omfattning startar först efter separat godkännande.',
  'Kunden ansvarar för att lämna korrekt information, inloggningar och material som behövs för arbetet.',
  'Medlemskapet kan avslutas via kundportalen.',
  'Om kunden är konsument och avtalet ingås på distans gäller som huvudregel 14 dagars ångerrätt enligt tillämplig svensk konsumenträtt. Information om hur ångerrätten används finns i Aegis allmänna villkor.'
].join('\n');

export async function POST(request) {
  const rateLimit = checkRateLimit(request, {
    key: 'stripe-checkout',
    limit: 8,
    windowMs: 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  try {
    const body = await request.json();

    const name = clean(body?.name, 120);
    const company = clean(body?.company, 160);
    const email = clean(body?.email, 254).toLowerCase();
    const phone = clean(body?.phone, 40);
    const signatureTitle = clean(body?.signatureTitle, 120);
    const accessCode = normalizeAccessCode(body?.accessCode);
    const plan = clean(body?.plan, 40);

    if (!name) {
      return NextResponse.json(
        { message: 'Namn saknas.' },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { message: 'Ange en giltig e-postadress.' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { message: 'Telefonnummer saknas.' },
        { status: 400 }
      );
    }

    if (!isValidAccessCode(accessCode)) {
      return NextResponse.json(
        {
          message:
            'Kundkoden måste innehålla 8–64 bokstäver, siffror eller bindestreck.'
        },
        { status: 400 }
      );
    }

    if (body?.acceptedTerms !== true) {
      return NextResponse.json(
        { message: 'Du måste godkänna medlemskraven.' },
        { status: 400 }
      );
    }

    const stripePlan = getStripePlan(plan);

    if (!stripePlan) {
      return NextResponse.json(
        { message: 'Den valda abonnemangsplanen är inte giltig.' },
        { status: 400 }
      );
    }

    if (
      stripePlan.name === 'Privat' &&
      body?.startServiceImmediately !== true
    ) {
      return NextResponse.json(
        {
          message:
            'För Privat behöver du bekräfta att tjänsten får börja under ångerfristen.'
        },
        { status: 400 }
      );
    }

    const requirements = buildMembershipRequirements(stripePlan);

    const pendingCustomer =
      await createPendingMembershipCustomer(
        {
          name,
          company,
          email,
          phone,
          signatureTitle,
          accessCode,
          plan: stripePlan.name,
          price: stripePlan.displayPrice,
          requirements,
          stripePriceId: stripePlan.priceId
        },
        { ip: getClientIp(request) }
      );

    const stripe = getStripe();
    const siteUrl = getPublicBaseUrl(request);

    const session =
      await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: stripePlan.priceId,
            quantity: 1
          }
        ],
        customer_email: email,
        success_url:
          `${siteUrl}/bli-medlem/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:
          `${siteUrl}/bli-medlem?plan=${encodeURIComponent(stripePlan.name)}&cancelled=true`,
        client_reference_id: pendingCustomer.id,
        metadata: {
          customerId: pendingCustomer.id,
          plan: stripePlan.name,
          termsVersion: MEMBERSHIP_TERMS_VERSION
        },
        subscription_data: {
          metadata: {
            customerId: pendingCustomer.id,
            plan: stripePlan.name,
            termsVersion: MEMBERSHIP_TERMS_VERSION
          }
        },
        allow_promotion_codes: true
      });

    if (!session.url) {
      return NextResponse.json(
        { message: 'Stripe returnerade ingen betalningslänk.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url
    });
  } catch (error) {
    if (error?.message === 'CUSTOMER_EMAIL_EXISTS') {
      return NextResponse.json(
        {
          message:
            'Det finns redan ett konto med denna e-post. Logga in i kundportalen eller kontakta Aegis.'
        },
        { status: 409 }
      );
    }

    if (error?.message === 'INVALID_MEMBERSHIP_DATA') {
      return NextResponse.json(
        { message: 'Medlemsuppgifterna är ogiltiga.' },
        { status: 400 }
      );
    }

    if (error?.message === 'PENDING_MEMBERSHIP_EXISTS') {
      return NextResponse.json(
        {
          message:
            'Det finns redan en väntande betalning för denna e-post. Använd samma kundkod som vid det första försöket eller kontakta Aegis.'
        },
        { status: 409 }
      );
    }

    console.error('Stripe Checkout error:', error);

    return NextResponse.json(
      { message: 'Kunde inte starta betalningen.' },
      { status: 500 }
    );
  }
}
