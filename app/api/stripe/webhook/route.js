import {
  activateMembershipFromStripe,
  getCustomer,
  markMembershipPaymentFailed,
  syncMembershipSubscription
} from '../../../lib/customerStore';
import { getStripe } from '../../../lib/stripe';

export const runtime = 'nodejs';

const stripeId = (value) =>
  typeof value === 'string' ? value : value?.id || '';

const unixToIso = (value) =>
  value ? new Date(value * 1000).toISOString() : '';

const checkoutIsPaid = (session) =>
  session?.mode === 'subscription' &&
  session?.status === 'complete' &&
  ['paid', 'no_payment_required'].includes(
    session?.payment_status
  );

async function activateCheckoutSession(stripe, session) {
  const customerId =
    session.metadata?.customerId ||
    session.client_reference_id;

  if (!customerId || !checkoutIsPaid(session)) {
    return;
  }

  const subscriptionId = stripeId(session.subscription);

  if (!subscriptionId) {
    return;
  }

  const subscription =
    await stripe.subscriptions.retrieve(subscriptionId);

  if (!['active', 'trialing'].includes(subscription.status)) {
    return;
  }

  const stripePriceId =
    subscription.items?.data?.[0]?.price?.id || '';
  const current = await getCustomer(customerId);

  if (
    !current ||
    current.source !== 'stripe-checkout' ||
    (
      current.stripePriceId &&
      current.stripePriceId !== stripePriceId
    )
  ) {
    console.error(
      'Stripe checkout did not match the pending Aegis membership.',
      { customerId, sessionId: session.id }
    );
    return;
  }

  await activateMembershipFromStripe(
    customerId,
    {
      stripeCustomerId:
        stripeId(session.customer),
      stripeSubscriptionId: subscription.id,
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
}

export async function POST(request) {
  const signature =
    request.headers.get('stripe-signature');
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return Response.json(
      { message: 'Webhook är inte konfigurerad.' },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch {
    return Response.json(
      { message: 'Ogiltig webhook-signatur.' },
      { status: 400 }
    );
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await activateCheckoutSession(
        stripe,
        event.data.object
      );
    }

    if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object;
      const customerId =
        session.metadata?.customerId ||
        session.client_reference_id;

      if (customerId) {
        await markMembershipPaymentFailed(
          customerId,
          session.id
        );
      }
    }

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object;

      await syncMembershipSubscription(
        subscription.id,
        {
          subscriptionStatus:
            subscription.status,
          currentPeriodEnd: unixToIso(
            subscription.current_period_end
          ),
          cancelAtPeriodEnd:
            Boolean(
              subscription.cancel_at_period_end
            )
        }
      );
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error(
      'Stripe webhook processing error:',
      error
    );

    return Response.json(
      { message: 'Webhook kunde inte behandlas.' },
      { status: 500 }
    );
  }
}
