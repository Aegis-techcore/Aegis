import { NextResponse } from 'next/server';
import {
  CUSTOMER_COOKIE_NAME,
  createCustomerToken
} from '../../../lib/customerAuth';
import {
  activateMembershipFromStripe
} from '../../../lib/customerStore';
import { getStripe } from '../../../lib/stripe';

export const runtime = 'nodejs';

const stripeId = (value) =>
  typeof value === 'string' ? value : value?.id || '';

const unixToIso = (value) =>
  value ? new Date(value * 1000).toISOString() : '';

export async function GET(request) {
  const sessionId =
    new URL(request.url).searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { message: 'Stripe-session saknas.' },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId,
        {
          expand: [
            'subscription',
            'customer'
          ]
        }
      );

    const customerId =
      session.metadata?.customerId ||
      session.client_reference_id;

    const paid =
      session.status === 'complete' &&
      ['paid', 'no_payment_required'].includes(
        session.payment_status
      );

    if (!customerId || !paid) {
      return NextResponse.json(
        {
          verified: false,
          message:
            'Betalningen är ännu inte verifierad.'
        },
        { status: 409 }
      );
    }

    const subscription =
      typeof session.subscription === 'object'
        ? session.subscription
        : null;

    const customer =
      await activateMembershipFromStripe(
        customerId,
        {
          stripeCustomerId: stripeId(session.customer),
          stripeSubscriptionId:
            stripeId(session.subscription),
          stripeCheckoutSessionId: session.id,
          stripePriceId:
            subscription?.items?.data?.[0]?.price?.id ||
            '',
          subscriptionStatus:
            subscription?.status || 'active',
          currentPeriodEnd: unixToIso(
            subscription?.current_period_end
          ),
          cancelAtPeriodEnd:
            Boolean(subscription?.cancel_at_period_end)
        }
      );

    if (!customer) {
      return NextResponse.json(
        { message: 'Kundkontot hittades inte.' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      verified: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        status: customer.status,
        plan: customer.plan
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
