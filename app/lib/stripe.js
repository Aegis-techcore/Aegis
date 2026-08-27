import Stripe from 'stripe';

let stripeClient;

export function getStripe() {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY saknas.');
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}
