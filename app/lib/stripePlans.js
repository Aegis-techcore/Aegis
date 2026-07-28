export const STRIPE_PLANS = {
    Privat: {
      name: 'Privat',
      displayPrice: '99 kr',
      priceId: process.env.STRIPE_PRICE_PRIVATE
    },
    Start: {
      name: 'Start',
      displayPrice: '299 kr',
      priceId: process.env.STRIPE_PRICE_START
    },
    Plus: {
      name: 'Plus',
      displayPrice: '699 kr',
      priceId: process.env.STRIPE_PRICE_PLUS
    },
    Pro: {
      name: 'Pro',
      displayPrice: '1 490 kr',
      priceId: process.env.STRIPE_PRICE_PRO
    },
    Business: {
      name: 'Business',
      displayPrice: '2 990 kr',
      priceId: process.env.STRIPE_PRICE_BUSINESS
    }
  };
  
  export function getStripePlan(planName) {
    const plan = STRIPE_PLANS[planName];
  
    if (!plan?.priceId) {
      return null;
    }
  
    return plan;
  }