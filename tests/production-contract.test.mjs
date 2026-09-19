import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import nextConfig from '../next.config.js';

const readProjectFile = (name) =>
  readFile(new URL(`../${name}`, import.meta.url), 'utf8');

test('Next.js creates a standalone production build', () => {
  assert.equal(nextConfig.output, 'standalone');
  assert.equal(nextConfig.poweredByHeader, false);
});

test('the environment template documents required production settings', async () => {
  const example = await readProjectFile('.env.example');
  const requiredVariables = [
    'DATABASE_URL',
    'ADMIN_PASSWORD',
    'ADMIN_SESSION_SECRET',
    'CUSTOMER_SESSION_SECRET',
    'NEXT_PUBLIC_SITE_URL',
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  for (const variable of requiredVariables) {
    assert.match(example, new RegExp(`^${variable}=`, 'm'));
  }
});

test('real environment files are ignored while the template is tracked', async () => {
  const gitignore = await readProjectFile('.gitignore');

  assert.match(gitignore, /^\.env\.\*$/m);
  assert.match(gitignore, /^!\.env\.example$/m);
});
