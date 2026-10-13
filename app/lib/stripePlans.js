import { MEMBERSHIP_PLANS } from './membershipPlans.js';

// This adapter is server-only: public plan data never contains Stripe price IDs.
const priceIds = {
  Privat: process.env.STRIPE_PRICE_PRIVATE,
  Start: process.env.STRIPE_PRICE_START,
  Plus: process.env.STRIPE_PRICE_PLUS,
  Pro: process.env.STRIPE_PRICE_PRO,
  Business: process.env.STRIPE_PRICE_BUSINESS
};

export const STRIPE_PLANS = Object.fromEntries(
  MEMBERSHIP_PLANS.map((plan) => [plan.name, {
    ...plan,
    priceId: priceIds[plan.name]
  }])
);

export function getStripePlan(planName) {
  const plan = STRIPE_PLANS[planName];
  return plan?.priceId ? plan : null;
}
