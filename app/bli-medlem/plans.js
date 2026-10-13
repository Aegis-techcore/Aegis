import { getMembershipPlan } from '../lib/membershipPlans.js';

export const plans = [
  {
    name: 'Privat',
    price: getMembershipPlan('Privat').displayPrice,
    audience: 'Privatpersoner med personlig hemsida, portfolio eller mindre digital tjänst.',
    hours: 'Upp till 30 minuter per vecka'
  },
  {
    name: 'Start',
    price: getMembershipPlan('Start').displayPrice,
    audience: 'Mindre företag som vill hålla sin webbplats uppdaterad.',
    hours: 'Upp till 1 timme per vecka'
  },
  {
    name: 'Plus',
    price: getMembershipPlan('Plus').displayPrice,
    audience: 'Företag som vill förbättra webbplatsen löpande.',
    hours: 'Upp till 2 timmar per vecka'
  },
  {
    name: 'Pro',
    price: getMembershipPlan('Pro').displayPrice,
    audience: 'Företag med aktiv vidareutveckling och support.',
    hours: 'Upp till 3 timmar per vecka'
  },
  {
    name: 'Business',
    price: getMembershipPlan('Business').displayPrice,
    audience: 'Långsiktigt partnerskap för utveckling, support och digital tillväxt.',
    hours: 'Upp till 5 timmar per vecka'
  }
];
