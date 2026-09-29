import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readProjectFile = (name) =>
  readFile(new URL(`../${name}`, import.meta.url), 'utf8');

test('customer access codes use a bounded one-way scrypt hash', async () => {
  const auth = await readProjectFile('app/lib/customerAuth.js');

  assert.match(auth, /scrypt/);
  assert.match(auth, /hashAccessCode/);
  assert.match(auth, /verifyAccessCode/);
  assert.match(auth, /isValidAccessCode/);
  assert.match(auth, /slice\(0, 64\)/);
});

test('admin and customer sessions require separate strong production secrets', async () => {
  const adminAuth = await readProjectFile('app/lib/adminAuth.js');
  const customerAuth = await readProjectFile('app/lib/customerAuth.js');

  assert.doesNotMatch(
    adminAuth,
    /ADMIN_SESSION_SECRET\s*\|\|\s*process\.env\.ADMIN_PASSWORD/
  );
  assert.match(
    adminAuth,
    /ADMIN_SESSION_SECRET måste vara minst 32 tecken i produktion/
  );

  assert.doesNotMatch(
    customerAuth,
    /CUSTOMER_SESSION_SECRET\s*\|\|\s*process\.env\.ADMIN_SESSION_SECRET/
  );
  assert.match(
    customerAuth,
    /CUSTOMER_SESSION_SECRET måste vara minst 32 tecken i produktion/
  );
});

test('Stripe checkout never sends the customer access code as metadata', async () => {
  const checkout = await readProjectFile(
    'app/api/stripe/checkout/route.js'
  );

  const metadataBlock =
    checkout.match(/metadata:\s*\{([\s\S]*?)\}/)?.[1] || '';

  assert.doesNotMatch(metadataBlock, /accessCode/);
  assert.match(checkout, /createPendingMembershipCustomer/);
  assert.match(checkout, /acceptedTerms !== true/);
});

test('Stripe completion is verified and a session id is never an auth token', async () => {
  const session = await readProjectFile(
    'app/api/stripe/session/route.js'
  );
  const webhook = await readProjectFile(
    'app/api/stripe/webhook/route.js'
  );

  assert.match(session, /checkout\.sessions\.retrieve/);
  assert.match(session, /payment_status/);
  assert.match(session, /active.*trialing|trialing.*active/s);
  assert.doesNotMatch(session, /createCustomerToken/);
  assert.doesNotMatch(session, /CUSTOMER_COOKIE_NAME/);
  assert.doesNotMatch(session, /cookies\.set/);

  assert.match(webhook, /stripe-signature/);
  assert.match(webhook, /constructEvent/);
  assert.match(webhook, /checkout\.session\.completed/);
  assert.match(webhook, /checkout\.session\.async_payment_succeeded/);
  assert.match(webhook, /checkout\.session\.async_payment_failed/);
});

test('agreement links expire, are bounded and do not echo access codes', async () => {
  const store = await readProjectFile('app/lib/customerStore.js');
  const route = await readProjectFile(
    'app/api/agreements/[token]/route.js'
  );

  assert.match(store, /AGREEMENT_TOKEN_TTL_MS/);
  assert.match(store, /AGREEMENT_TOKEN_PATTERN/);
  assert.match(store, /isAgreementTokenExpired/);
  assert.match(store, /signToken:\s*null/);
  assert.doesNotMatch(
    route.match(/login:\s*\{([\s\S]*?)\}/)?.[1] || '',
    /accessCode/
  );
});

test('generated public links use configured site URLs instead of Host headers', async () => {
  const publicUrl = await readProjectFile('app/lib/publicUrl.js');
  const adminCustomers = await readProjectFile(
    'app/api/admin/customers/route.js'
  );
  const agreementAdmin = await readProjectFile(
    'app/api/admin/requests/[id]/agreement/route.js'
  );

  assert.match(publicUrl, /process\.env\.SITE_URL/);
  assert.match(publicUrl, /NEXT_PUBLIC_SITE_URL/);
  assert.match(publicUrl, /NODE_ENV !== 'production'/);
  assert.doesNotMatch(adminCustomers, /x-forwarded-proto|headers\.get\('host'\)/);
  assert.doesNotMatch(agreementAdmin, /x-forwarded-proto|headers\.get\('host'\)/);
});

test('admin cannot manually drift Stripe-managed membership state', async () => {
  const adminRoute = await readProjectFile(
    'app/api/admin/customers/[id]/route.js'
  );

  assert.match(adminRoute, /source === 'stripe-checkout'/);
  assert.match(adminRoute, /subscriptionAllowsActivation/);
  assert.match(adminRoute, /billingFieldsChanged/);
  assert.match(adminRoute, /Stripe-planflöde/);
  assert.match(adminRoute, /synkas från Stripe/);
  assert.match(adminRoute, /status:\s*409/);
  assert.match(adminRoute, /subscriptions\.cancel/);
});

test('public abuse-prone endpoints use rate limiting', async () => {
  const paths = [
    'app/api/admin/login/route.js',
    'app/api/customer/login/route.js',
    'app/api/contact/route.js',
    'app/api/chat/route.js',
    'app/api/stripe/checkout/route.js',
    'app/api/stripe/session/route.js',
    'app/api/agreements/[token]/route.js',
    'app/api/customer/messages/route.js'
  ];

  for (const path of paths) {
    const source = await readProjectFile(path);
    assert.match(
      source,
      /checkRateLimit/,
      `${path} should use rate limiting`
    );
  }
});


test('membership cancellation cannot cancel project orders and is idempotent', async () => {
  const cancelRoute = await readProjectFile(
    'app/api/customer/cancel/route.js'
  );

  assert.match(cancelRoute, /current\.type !== 'membership'/);
  assert.match(cancelRoute, /current\.status === 'cancelled'/);
  assert.match(cancelRoute, /subscriptions\.cancel/);
});

test('Stripe payment failure retries do not duplicate system messages', async () => {
  const store = await readProjectFile('app/lib/customerStore.js');

  assert.match(store, /alreadyRecorded/);
  assert.match(store, /if \(!alreadyRecorded\)/);
});


test('pending Stripe membership retries require the original access code', async () => {
  const store = await readProjectFile('app/lib/customerStore.js');
  const checkout = await readProjectFile(
    'app/api/stripe/checkout/route.js'
  );

  assert.match(store, /existing\?\.status === 'pending_payment'/);
  assert.match(store, /verifyAccessCode/);
  assert.match(store, /PENDING_MEMBERSHIP_EXISTS/);
  assert.match(checkout, /PENDING_MEMBERSHIP_EXISTS/);
  assert.match(checkout, /status:\s*409/);
});


test('Stripe membership terms are server-authoritative and versioned', async () => {
  const checkout = await readProjectFile(
    'app/api/stripe/checkout/route.js'
  );
  const store = await readProjectFile('app/lib/customerStore.js');

  assert.match(checkout, /MEMBERSHIP_TERMS_VERSION/);
  assert.match(checkout, /buildMembershipRequirements/);
  assert.doesNotMatch(checkout, /body\?\.requirements/);
  assert.match(checkout, /termsVersion: MEMBERSHIP_TERMS_VERSION/);
  assert.match(checkout, /startServiceImmediately/);
  assert.match(store, /signedAt:\s*now/);
});
