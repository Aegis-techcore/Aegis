import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';
import { getStripePlan } from '../../../lib/stripePlans';

export async function POST(request) {
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

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    const metadata = {
      name: name.trim(),
      company: company?.trim() || '',
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      signatureTitle: signatureTitle?.trim() || '',
      accessCode: accessCode.trim().toUpperCase(),
      plan: stripePlan.name,
      requirements: requirements || ''
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',

      line_items: [
        {
          price: stripePlan.priceId,
          quantity: 1
        }
      ],

      customer_email: email.trim().toLowerCase(),

      success_url: `${origin}/bli-medlem/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/bli-medlem?plan=${encodeURIComponent(
        stripePlan.name
      )}&cancelled=true`,

      metadata,

      subscription_data: {
        metadata: {
          plan: stripePlan.name,
          email: email.trim().toLowerCase()
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
    console.error('Stripe Checkout error:', error);

    return NextResponse.json(
      { message: 'Kunde inte starta betalningen.' },
      { status: 500 }
    );
  }
}