import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import nextConfig from '../next.config.js';
import { getProductionConfigErrors } from '../app/lib/runtimeConfig.js';

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
    'RESEND_FROM_EMAIL',
    'OWNER_EMAIL',
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


test('production readiness validates critical secrets and public URL', async () => {
  const readyRoute = await readProjectFile(
    'app/api/ready/route.js'
  );

  const validEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://aegis:aegis@example.invalid/aegis',
    ADMIN_PASSWORD: 'ci-admin-password-only',
    ADMIN_SESSION_SECRET: 'a'.repeat(40),
    CUSTOMER_SESSION_SECRET: 'b'.repeat(40),
    SITE_URL: 'https://www.aegis.dev',
    NEXT_PUBLIC_SITE_URL: 'https://www.aegis.dev',
    RESEND_API_KEY: 're_ci_placeholder',
    RESEND_FROM_EMAIL: 'Aegis <noreply@aegis.dev>',
    OWNER_EMAIL: 'owner@aegis.dev',
    STRIPE_SECRET_KEY: 'sk_test_ci_placeholder',
    STRIPE_WEBHOOK_SECRET: 'whsec_ci_placeholder',
    STRIPE_PRICE_PRIVATE: 'price_ci_private',
    STRIPE_PRICE_START: 'price_ci_start',
    STRIPE_PRICE_PLUS: 'price_ci_plus',
    STRIPE_PRICE_PRO: 'price_ci_pro',
    STRIPE_PRICE_BUSINESS: 'price_ci_business'
  };

  assert.deepEqual(
    getProductionConfigErrors(validEnv),
    []
  );

  assert.ok(
    getProductionConfigErrors({
      ...validEnv,
      SITE_URL: 'http://www.aegis.dev'
    }).some((error) =>
      error.includes('SITE_URL måste använda https')
    )
  );

  assert.ok(
    getProductionConfigErrors({
      ...validEnv,
      NEXT_PUBLIC_SITE_URL: 'https://aegis.dev'
    }).some((error) =>
      error.includes('måste peka på samma origin')
    )
  );

  assert.ok(
    getProductionConfigErrors({
      ...validEnv,
      RESEND_FROM_EMAIL: 'Aegis <onboarding@resend.dev>'
    }).some((error) =>
      error.includes('resend.dev')
    )
  );

  assert.ok(
    getProductionConfigErrors({
      ...validEnv,
      STRIPE_WEBHOOK_SECRET: ''
    }).some((error) =>
      error.includes('STRIPE_WEBHOOK_SECRET saknas')
    )
  );

  assert.match(readyRoute, /getProductionConfigErrors/);
});

test('deployment refuses placeholder domains', async () => {
  const deployment = await readProjectFile(
    '.github/workflows/deploy.yml'
  );

  assert.match(deployment, /vars\.SITE_URL/);
  assert.match(deployment, /vars\.INGRESS_HOST/);
  assert.match(deployment, /placeholder domain/);
});


test('Next.js dependency is pinned above the patched RCE floor', async () => {
  const packageJson = JSON.parse(await readProjectFile('package.json'));
  const packageLock = JSON.parse(await readProjectFile('package-lock.json'));

  assert.equal(packageJson.dependencies.next, '^16.3.6');
  assert.equal(
    packageLock.packages['node_modules/next'].version,
    '16.3.6'
  );
});

test('production headers include a restrictive Content-Security-Policy', async () => {
  const rules = await nextConfig.headers();
  const headers = new Map(
    rules[0].headers.map(({ key, value }) => [key, value])
  );
  const csp = headers.get('Content-Security-Policy') || '';

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /upgrade-insecure-requests/);
});


test('authenticated GET APIs explicitly disable static caching', async () => {
  const paths = [
    'app/api/customer/me/route.js',
    'app/api/admin/me/route.js',
    'app/api/admin/notifications/route.js',
    'app/api/admin/customers/route.js',
    'app/api/admin/requests/route.js',
    'app/api/admin/requests/[id]/route.js'
  ];

  for (const path of paths) {
    const source = await readProjectFile(path);
    assert.match(source, /dynamic = 'force-dynamic'/, path);
    assert.match(source, /revalidate = 0/, path);
  }
});
