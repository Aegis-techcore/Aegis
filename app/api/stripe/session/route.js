import { NextResponse } from 'next/server';
import {
  activateMembershipFromStripe,
  getCustomer
} from '../../../lib/customerStore';
import {
  checkRateLimit,
  rateLimitResponse
} from '../../../lib/rateLimit';
import { getStripe } from '../../../lib/stripe';

export const runtime = 'nodejs';

const stripeId = (value) =>
  typeof value === 'string' ? value : value?.id || '';

const unixToIso = (value) =>
  value ? new Date(value * 1000).toISOString() : '';

export async function GET(request) {
  const rateLimit = checkRateLimit(request, {
    key: 'stripe-session',
    limit: 20,
    windowMs: 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  const sessionId =
    new URL(request.url).searchParams.get('session_id');

  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json(
      { message: 'Stripe-session saknas eller är ogiltig.' },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId,
        {
          expand: ['subscription']
        }
      );

    const customerId =
      session.metadata?.customerId ||
      session.client_reference_id;

    const paid =
      session.mode === 'subscription' &&
      session.status === 'complete' &&
      ['paid', 'no_payment_required'].includes(
        session.payment_status
      );

    const subscription =
      typeof session.subscription === 'object'
        ? session.subscription
        : null;

    const stripePriceId =
      subscription?.items?.data?.[0]?.price?.id || '';

    if (
      !customerId ||
      !paid ||
      !subscription ||
      !['active', 'trialing'].includes(subscription.status)
    ) {
      return NextResponse.json(
        {
          verified: false,
          message:
            'Betalningen är ännu inte verifierad.'
        },
        { status: 409 }
      );
    }

    const existing = await getCustomer(customerId);

    if (
      !existing ||
      existing.source !== 'stripe-checkout' ||
      (
        existing.stripePriceId &&
        existing.stripePriceId !== stripePriceId
      )
    ) {
      return NextResponse.json(
        { message: 'Betalningen kunde inte kopplas till medlemskapet.' },
        { status: 409 }
      );
    }

    const customer =
      await activateMembershipFromStripe(
        customerId,
        {
          stripeCustomerId: stripeId(session.customer),
          stripeSubscriptionId:
            stripeId(session.subscription),
          stripeCheckoutSessionId: session.id,
          stripePriceId,
          subscriptionStatus: subscription.status,
          currentPeriodEnd: unixToIso(
            subscription.current_period_end
          ),
          cancelAtPeriodEnd:
            Boolean(subscription.cancel_at_period_end)
        }
      );

    if (!customer) {
      return NextResponse.json(
        { message: 'Medlemskapet kunde inte aktiveras.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      verified: true,
      status: customer.status,
      plan: customer.plan
    });
  } catch (error) {
    console.error(
      'Stripe session verification error:',
      error
    );

    return NextResponse.json(
      {
        message:
          'Kunde inte verifiera betalningen.'
      },
      { status: 500 }
    );
  }
}
