import { NextResponse } from 'next/server';
import { createPendingMembershipCustomer } from '../../../lib/customerStore';
import { getClientIp, checkRateLimit, rateLimitResponse } from '../../../lib/rateLimit';
import { getStripe } from '../../../lib/stripe';
import { getStripePlan } from '../../../lib/stripePlans';

export const runtime = 'nodejs';

const getSiteUrl = (request) => {
  const configured =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV !== 'production') {
    return (
      request.headers.get('origin') ||
      'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  throw new Error('SITE_URL saknas i produktion.');
};

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

    const {
      name,
      company,
      email,
      phone,
      signatureTitle,
      accessCode,
      plan,
      acceptedTerms,
      requirements
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { message: 'Namn saknas.' },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { message: 'E-post saknas.' },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { message: 'Telefonnummer saknas.' },
        { status: 400 }
      );
    }

    if (!accessCode || accessCode.trim().length < 8) {
      return NextResponse.json(
        { message: 'Kundkoden måste innehålla minst 8 tecken.' },
        { status: 400 }
      );
    }

    if (!acceptedTerms) {
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
    const siteUrl = getSiteUrl(request);

    const session =
      await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: stripePlan.priceId,
            quantity: 1
          }
        ],
        customer_email: email.trim().toLowerCase(),
        success_url:
          `${siteUrl}/bli-medlem/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:
          `${siteUrl}/bli-medlem?plan=${encodeURIComponent(stripePlan.name)}&cancelled=true`,
        client_reference_id: pendingCustomer.id,
        metadata: {
          customerId: pendingCustomer.id,
          plan: stripePlan.name
        },
        subscription_data: {
          metadata: {
            customerId: pendingCustomer.id,
            plan: stripePlan.name
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

    return NextResponse.json({ url: session.url });
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

    console.error('Stripe Checkout error:', error);

    return NextResponse.json(
      { message: 'Kunde inte starta betalningen.' },
      { status: 500 }
    );
  }
}
