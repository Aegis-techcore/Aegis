import {
  getCustomerIdFromRequest
} from '../../../lib/customerAuth';
import {
  getCustomer,
  requestCustomerCancellation
} from '../../../lib/customerStore';
import { getStripe } from '../../../lib/stripe';

export const runtime = 'nodejs';

const publicCustomer = (customer) => ({
  id: customer.id,
  type: customer.type,
  status: customer.status,
  name: customer.name,
  company: customer.company,
  email: customer.email,
  phone: customer.phone,
  plan: customer.plan,
  price: customer.price,
  billingCycle: customer.billingCycle,
  projectTitle: customer.projectTitle,
  requirements: customer.requirements,
  signedAt: customer.signedAt,
  cancellationRequestedAt:
    customer.cancellationRequestedAt,
  cancelledAt: customer.cancelledAt,
  cancellationReason:
    customer.cancellationReason,
  messages: customer.messages || []
});

export async function POST(request) {
  const customerId =
    getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json(
      { message: 'Inte inloggad.' },
      { status: 401 }
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const current = await getCustomer(customerId);

  if (!current) {
    return Response.json(
      { message: 'Kunden hittades inte.' },
      { status: 404 }
    );
  }

  if (current.type !== 'membership') {
    return Response.json(
      { message: 'Endast medlemskap kan avslutas via detta flöde.' },
      { status: 409 }
    );
  }

  if (current.status === 'cancelled') {
    return Response.json({
      customer: publicCustomer(current)
    });
  }

  if (
    current.stripeSubscriptionId &&
    current.subscriptionStatus !== 'canceled'
  ) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(
        current.stripeSubscriptionId
      );
    } catch (error) {
      console.error(
        'Stripe cancellation error:',
        error
      );

      return Response.json(
        {
          message:
            'Prenumerationen kunde inte avslutas hos Stripe. Inga lokala uppgifter ändrades.'
        },
        { status: 502 }
      );
    }
  }

  const customer =
    await requestCustomerCancellation(
      customerId,
      payload?.reason
    );

  return Response.json({
    customer: publicCustomer(customer)
  });
}
