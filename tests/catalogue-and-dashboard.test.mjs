import assert from 'node:assert/strict';
import test from 'node:test';
import { MEMBERSHIP_PLANS, getMembershipPlan } from '../app/lib/membershipPlans.js';
import { subscriptionPlans } from '../app/abonnemang/plans.js';
import { plans as signupPlans } from '../app/bli-medlem/plans.js';
import { SERVICE_LABELS, serviceOptions } from '../app/lib/services.js';
import { filterCustomers, getStats, getDraftValue } from '../app/admin/customerViews.js';
import { formatDate } from '../app/lib/formatDate.js';

test('subscription and signup pages agree on all five public membership prices', () => {
  const expected = [
    ['Privat', '299 kr'],
    ['Start', '499 kr'],
    ['Plus', '999 kr'],
    ['Pro', '1 499 kr'],
    ['Business', '2 999 kr']
  ];
  assert.deepEqual(MEMBERSHIP_PLANS.map(({ name, displayPrice }) => [name, displayPrice]), expected);
  for (const pagePlans of [subscriptionPlans, signupPlans]) {
    assert.deepEqual(pagePlans.map(({ name, price }) => [name, price]), expected);
  }
  assert.equal(getMembershipPlan('Unknown'), null);
  assert.equal(getMembershipPlan('__proto__'), null);
  assert.equal(getMembershipPlan('plus'), null);
  assert.ok(MEMBERSHIP_PLANS.every((plan) => !('priceId' in plan)));
});

test('Stripe retains its price IDs and rejects unconfigured plans', async () => {
  const variables = [
    'STRIPE_PRICE_PRIVATE', 'STRIPE_PRICE_START', 'STRIPE_PRICE_PLUS',
    'STRIPE_PRICE_PRO', 'STRIPE_PRICE_BUSINESS'
  ];
  const previous = variables.map((key) => process.env[key]);
  try {
    variables.forEach((key, index) => { process.env[key] = `price_test_${index}`; });
    delete process.env.STRIPE_PRICE_BUSINESS;
    const { getStripePlan } = await import('../app/lib/stripePlans.js');
    assert.deepEqual(getStripePlan('Plus'), {
      name: 'Plus', displayPrice: '999 kr', priceId: 'price_test_2'
    });
    assert.equal(getStripePlan('Business'), null);
    assert.equal(getStripePlan('Unknown'), null);
  } finally {
    variables.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
  }
});

test('contact options preserve service IDs, order and API labels', () => {
  assert.deepEqual(serviceOptions.map(({ value }) => value), [
    'programming', 'fullstack', 'data', 'cybersecurity', 'network',
    'embedded', 'ai', 'maintenance', 'games'
  ]);
  for (const { value, label } of serviceOptions) assert.equal(label, SERVICE_LABELS[value]);
  assert.equal(SERVICE_LABELS.maintenance, 'Webbunderhåll & IT-support');
});

test('dashboard tabs and counts handle every customer lifecycle status', () => {
  const customers = [
    'pending_signature', 'pending_payment', 'active',
    'cancel_requested', 'cancelled', 'completed', 'unknown'
  ].map((status, id) => ({ id, status }));
  assert.deepEqual(getStats(customers), { total: 7, active: 1, pending: 2, archive: 3 });
  assert.deepEqual(filterCustomers(customers, 'pending', '').map(({ id }) => id), [0, 1]);
  assert.deepEqual(filterCustomers(customers, 'archive', '').map(({ id }) => id), [3, 4, 5]);
  assert.equal(filterCustomers(customers, 'active', '').length, 1);
  assert.equal(filterCustomers(customers, 'all', '').length, 7);
  assert.deepEqual(filterCustomers(customers, 'requests', ''), []);
  assert.deepEqual(getStats([]), { total: 0, active: 0, pending: 0, archive: 0 });
});

test('dashboard search combines the selected tab with all searchable fields', () => {
  const customer = {
    status: 'active', name: 'Anna', company: 'Example AB', email: 'a@example.test',
    phone: '0701234567', projectTitle: 'Portal', plan: 'Plus'
  };
  for (const query of [' ANNA ', 'example ab', 'a@example.test', '070123', 'portal', 'PLUS']) {
    assert.deepEqual(filterCustomers([customer], 'active', query), [customer]);
    assert.deepEqual(filterCustomers([customer], 'archive', query), []);
  }
  assert.deepEqual(filterCustomers([customer], 'all', 'missing'), []);
  assert.equal(getDraftValue({ request: { title: '' } }, 'request', 'title', 'Fallback'), '');
  assert.equal(getDraftValue({}, 'missing', 'title', 'Fallback'), 'Fallback');
});

test('shared date display keeps empty values and Swedish date/time formatting', () => {
  assert.equal(formatDate(null), '');
  assert.equal(formatDate(''), '');
  const value = '2026-10-13T10:30:00Z';
  assert.equal(formatDate(value), new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium', timeStyle: 'short'
  }).format(new Date(value)));
});
