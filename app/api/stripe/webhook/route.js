import {
  activateMembershipFromStripe,
  syncMembershipSubscription
} from '../../../lib/customerStore';
import { getStripe } from '../../../lib/stripe';

export const runtime = 'nodejs';

const stripeId = (value) =>
  typeof value === 'string' ? value : value?.id || '';

const unixToIso = (value) =>
  value ? new Date(value * 1000).toISOString() : '';

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
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerId =
        session.metadata?.customerId ||
        session.client_reference_id;

      if (customerId) {
        let subscription = null;

        if (session.subscription) {
          subscription =
            await stripe.subscriptions.retrieve(
              stripeId(session.subscription)
            );
        }

        await activateMembershipFromStripe(
          customerId,
          {
            stripeCustomerId:
              stripeId(session.customer),
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
              Boolean(
                subscription?.cancel_at_period_end
              )
          }
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
