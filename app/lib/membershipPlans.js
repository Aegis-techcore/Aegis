// Public catalogue shared by the website and Stripe's server-side adapter.
// Keep environment variables and payment-provider configuration out of this file.
export const MEMBERSHIP_PLANS = [
  { name: 'Privat', displayPrice: '299 kr' },
  { name: 'Start', displayPrice: '499 kr' },
  { name: 'Plus', displayPrice: '999 kr' },
  { name: 'Pro', displayPrice: '1 499 kr' },
  { name: 'Business', displayPrice: '2 999 kr' }
];

export function getMembershipPlan(name) {
  return MEMBERSHIP_PLANS.find((plan) => plan.name === name) ?? null;
}
