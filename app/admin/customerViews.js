// Presentation and filtering for the admin dashboard. No network or database access.
import { MEMBERSHIP_PLANS } from '../lib/membershipPlans.js';

export const statusLabels = {
  pending_signature: 'Väntar signering',
  pending_payment: 'Väntar betalning',
  active: 'Aktiv',
  cancel_requested: 'Avslut begärt',
  cancelled: 'Avslutad',
  completed: 'Slutförd'
};

export const typeLabels = {
  membership: 'Medlemskap',
  order: 'Beställning'
};

export const planOptions = [...MEMBERSHIP_PLANS.map((plan) => plan.name), 'Projekt'];

export const viewTabs = [
  { id: 'requests', label: 'Förfrågningar' },
  { id: 'active', label: 'Aktiva' },
  { id: 'pending', label: 'Väntar' },
  { id: 'archive', label: 'Arkiv' },
  { id: 'all', label: 'Alla kunder' }
];

const statusesByView = {
  active: ['active'],
  pending: ['pending_signature', 'pending_payment'],
  archive: ['cancel_requested', 'cancelled', 'completed']
};

export function getDraftValue(drafts, requestId, field, fallback = '') {
  return drafts[requestId]?.[field] ?? fallback;
}

function matchesView(customer, view) {
  return view === 'all' || (statusesByView[view]?.includes(customer.status) ?? false);
}

export function getStats(customers) {
  return {
    total: customers.length,
    active: customers.filter((customer) => matchesView(customer, 'active')).length,
    pending: customers.filter((customer) => matchesView(customer, 'pending')).length,
    archive: customers.filter((customer) => matchesView(customer, 'archive')).length
  };
}

export function filterCustomers(customers, view, search) {
  const query = search.trim().toLowerCase();

  return customers.filter((customer) => {
    if (!matchesView(customer, view)) return false;
    if (!query) return true;

    const searchable = [
      customer.name,
      customer.company,
      customer.email,
      customer.phone,
      customer.projectTitle,
      customer.plan
    ].join(' ').toLowerCase();

    return searchable.includes(query);
  });
}
