import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import nextConfig from '../next.config.js';

const readProjectFile = (name) =>
  readFile(new URL(`../${name}`, import.meta.url), 'utf8');

test('Next.js creates a hardened standalone production build', async () => {
  assert.equal(nextConfig.output, 'standalone');
  assert.equal(nextConfig.poweredByHeader, false);

  const rules = await nextConfig.headers();
  const headers = new Map(
    rules[0].headers.map(({ key, value }) => [key, value])
  );

  assert.equal(headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(headers.get('X-Frame-Options'), 'DENY');
  assert.equal(
    headers.get('Referrer-Policy'),
    'strict-origin-when-cross-origin'
  );
  assert.match(headers.get('Permissions-Policy'), /camera=\(\)/);
});

test('the environment template documents required production settings', async () => {
  const example = await readProjectFile('.env.example');
  const productionExample = await readProjectFile('.env.production.example');
  const requiredVariables = [
    'DATABASE_URL',
    'ADMIN_PASSWORD',
    'ADMIN_SESSION_SECRET',
    'CUSTOMER_SESSION_SECRET',
    'NEXT_PUBLIC_SITE_URL',
    'SITE_URL',
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  for (const variable of requiredVariables) {
    assert.match(example, new RegExp(`^${variable}=`, 'm'));
    assert.match(productionExample, new RegExp(`^${variable}=`, 'm'));
  }
});

test('Kubernetes secret template includes Stripe webhook configuration', async () => {
  const secretTemplate = await readProjectFile(
    'helm/aegis/secret.example.yaml'
  );

  assert.match(secretTemplate, /STRIPE_WEBHOOK_SECRET:/);
  assert.match(secretTemplate, /ADMIN_SESSION_SECRET:/);
  assert.match(secretTemplate, /CUSTOMER_SESSION_SECRET:/);
});

test('real environment files are ignored while the template is tracked', async () => {
  const gitignore = await readProjectFile('.gitignore');

  assert.match(gitignore, /^\.env\.\*$/m);
  assert.match(gitignore, /^!\.env\.example$/m);
});

test('local build has a safe database fallback without weakening runtime checks', async () => {
  const buildScript = await readProjectFile('scripts/build.mjs');
  const dbModule = await readProjectFile('app/lib/db/index.js');

  assert.match(
    buildScript,
    /example\.invalid/
  );
  assert.match(
    buildScript,
    /process\.env\.DATABASE_URL/
  );
  assert.match(
    dbModule,
    /DATABASE_URL saknas/
  );
});
