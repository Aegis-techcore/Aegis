import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

console.log('Stripe-kontroll:', {
  finns: !!secretKey,
  början: secretKey?.slice(0, 8),
  längd: secretKey?.length,
});

if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY saknas.');
}

export const stripe = new Stripe(secretKey);