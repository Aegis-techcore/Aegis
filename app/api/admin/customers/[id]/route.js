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

  const customer = await updateCustomer(id, payload);

  if (!customer) {
    return Response.json(
      { message: 'Kunden hittades inte.' },
      { status: 404 }
    );
  }

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

  if (
    customer.stripeSubscriptionId &&
    customer.subscriptionStatus !== 'canceled'
  ) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(
        customer.stripeSubscriptionId
      );
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
