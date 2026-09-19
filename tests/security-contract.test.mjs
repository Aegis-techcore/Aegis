import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readProjectFile = (name) =>
  readFile(new URL(`../${name}`, import.meta.url), 'utf8');

test('customer access codes use a one-way scrypt hash', async () => {
  const auth = await readProjectFile('app/lib/customerAuth.js');

  assert.match(auth, /scrypt/);
  assert.match(auth, /hashAccessCode/);
  assert.match(auth, /verifyAccessCode/);
});

test('admin sessions require a dedicated production secret', async () => {
  const auth = await readProjectFile('app/lib/adminAuth.js');

  assert.doesNotMatch(
    auth,
    /ADMIN_SESSION_SECRET\s*\|\|\s*process\.env\.ADMIN_PASSWORD/
  );
  assert.match(
    auth,
    /ADMIN_SESSION_SECRET måste vara konfigurerad i produktion/
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
});

test('Stripe payment completion is verified server-side', async () => {
  const session = await readProjectFile(
    'app/api/stripe/session/route.js'
  );
  const webhook = await readProjectFile(
    'app/api/stripe/webhook/route.js'
  );

  assert.match(session, /checkout\.sessions\.retrieve/);
  assert.match(session, /payment_status/);
  assert.match(webhook, /stripe-signature/);
  assert.match(webhook, /constructEvent/);
  assert.match(webhook, /checkout\.session\.completed/);
});

test('public abuse-prone endpoints use rate limiting', async () => {
  const paths = [
    'app/api/admin/login/route.js',
    'app/api/customer/login/route.js',
    'app/api/contact/route.js',
    'app/api/chat/route.js',
    'app/api/stripe/checkout/route.js',
    'app/api/agreements/[token]/route.js'
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
