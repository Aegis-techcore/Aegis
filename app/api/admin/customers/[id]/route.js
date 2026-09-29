import {
  isAdminRequest
} from '../../../../lib/adminAuth';
import {
  deleteCustomer,
  getCustomer,
  updateCustomer
} from '../../../../lib/customerStore';
import { getStripe } from '../../../../lib/stripe';

export const runtime = 'nodejs';

const subscriptionAllowsActivation = (status) =>
  ['active', 'trialing'].includes(status);

const cancelStripeSubscriptionIfNeeded = async (customer) => {
  if (
    !customer?.stripeSubscriptionId ||
    customer.subscriptionStatus === 'canceled'
  ) {
    return;
  }

  const stripe = getStripe();

  await stripe.subscriptions.cancel(
    customer.stripeSubscriptionId
  );
};

export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) {
    return Response.json(
      { message: 'Inte inloggad.' },
      { status: 401 }
    );
  }

  const { id } = await params;
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { message: 'Ogiltig data.' },
      { status: 400 }
    );
  }

  const current = await getCustomer(id);

  if (!current) {
    return Response.json(
      { message: 'Kunden hittades inte.' },
      { status: 404 }
    );
  }

  if (
    payload?.status === 'active' &&
    current.source === 'stripe-checkout' &&
    !subscriptionAllowsActivation(
      current.subscriptionStatus
    )
  ) {
    return Response.json(
      {
        message:
          'Stripe-medlemskapet kan inte aktiveras manuellt innan Stripe har verifierat prenumerationen.'
      },
      { status: 409 }
    );
  }

  if (current.source === 'stripe-checkout') {
    const billingFieldsChanged =
      (
        payload?.plan !== undefined &&
        String(payload.plan).trim() !== current.plan
      ) ||
      (
        payload?.price !== undefined &&
        String(payload.price).trim() !== current.price
      ) ||
      (
        payload?.billingCycle !== undefined &&
        String(payload.billingCycle).trim() !== current.billingCycle
      );

    if (billingFieldsChanged) {
      return Response.json(
        {
          message:
            'Plan, pris och faktureringsperiod för Stripe-medlemskap måste ändras genom ett separat Stripe-planflöde.'
        },
        { status: 409 }
      );
    }

    if (
      payload?.status &&
      payload.status !== current.status &&
      payload.status !== 'cancelled'
    ) {
      return Response.json(
        {
          message:
            'Status för Stripe-medlemskap synkas från Stripe och kan inte ändras manuellt.'
        },
        { status: 409 }
      );
    }
  }

  if (
    payload?.status === 'cancelled' &&
    current.stripeSubscriptionId &&
    current.subscriptionStatus !== 'canceled'
  ) {
    try {
      await cancelStripeSubscriptionIfNeeded(current);
    } catch (error) {
      console.error(
        'Stripe admin cancellation error:',
        error
      );

      return Response.json(
        {
          message:
            'Kunden kunde inte avslutas eftersom Stripe-prenumerationen inte kunde stoppas.'
        },
        { status: 502 }
      );
    }
  }

  const customer = await updateCustomer(id, payload);

  return Response.json({ customer });
}

export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) {
    return Response.json(
      { message: 'Inte inloggad.' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    return Response.json(
      { message: 'Kunden hittades inte.' },
      { status: 404 }
    );
  }

  try {
    await cancelStripeSubscriptionIfNeeded(customer);
  } catch (error) {
    console.error(
      'Stripe admin cancellation error:',
      error
    );

    return Response.json(
      {
        message:
          'Kunden kunde inte tas bort eftersom Stripe-prenumerationen inte kunde avslutas.'
      },
      { status: 502 }
    );
  }

  const deleted = await deleteCustomer(id);

  if (!deleted) {
    return Response.json(
      { message: 'Kunden hittades inte.' },
      { status: 404 }
    );
  }

  return Response.json({
    message: 'Kunden togs bort.'
  });
}
