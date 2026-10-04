import assert from 'node:assert/strict';
import test from 'node:test';
import { createAdminToken, verifyAdminToken } from '../app/lib/adminAuth.js';
import {
  createCustomerToken,
  verifyCustomerToken,
  hashAccessCode,
  verifyAccessCode
} from '../app/lib/customerAuth.js';

test('access codes use salted hashes and reject the wrong code', async () => {
  const code = 'LOCAL-TEST-CODE';
  const first = await hashAccessCode(code);
  const second = await hashAccessCode(code);
  assert.notEqual(first, second);
  assert.ok(!first.includes(code));
  assert.deepEqual(await verifyAccessCode(code, first), {
    valid: true, needsUpgrade: false
  });
  assert.equal((await verifyAccessCode('WRONG-TEST-CODE', first)).valid, false);
  assert.equal((await verifyAccessCode(code, 'scrypt$invalid$00')).valid, false);
});

test('production sessions reject tampering, cross-role tokens and weak secrets', () => {
  const keys = ['NODE_ENV', 'ADMIN_SESSION_SECRET', 'CUSTOMER_SESSION_SECRET'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_SESSION_SECRET = 'a'.repeat(40);
    process.env.CUSTOMER_SESSION_SECRET = 'b'.repeat(40);
    const admin = createAdminToken();
    const customer = createCustomerToken('customer-test');
    assert.equal(verifyAdminToken(admin), true);
    assert.equal(verifyCustomerToken(customer), 'customer-test');
    assert.equal(verifyAdminToken(customer), false);
    assert.equal(verifyCustomerToken(admin), null);
    assert.equal(verifyAdminToken(`${admin.slice(0, -1)}z`), false);
    assert.equal(verifyCustomerToken(customer.replace('customer-test', 'other')), null);
    process.env.ADMIN_SESSION_SECRET = 'short';
    process.env.CUSTOMER_SESSION_SECRET = 'short';
    assert.throws(() => createAdminToken(), /32/);
    assert.throws(() => createCustomerToken('customer-test'), /32/);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
