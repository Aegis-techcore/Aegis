const baseUrl = (process.argv[2] || process.env.SMOKE_TEST_URL || 'http://127.0.0.1:3000')
  .replace(/\/$/, '');
const attempts = Number(process.env.SMOKE_TEST_ATTEMPTS || 30);
const delayMs = Number(process.env.SMOKE_TEST_DELAY_MS || 2000);

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

let lastError;

const checks = [
  {
    path: '/',
    validate: async (response) => {
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        throw new Error(`unexpected content type for /: ${contentType}`);
      }
    }
  },
  {
    path: '/api/health',
    validate: async (response) => {
      const payload = await response.json();
      if (payload.status !== 'ok') {
        throw new Error(`unexpected health status: ${payload.status}`);
      }
    }
  }
];

if (process.env.SMOKE_TEST_READINESS === 'true') {
  checks.push({
    path: '/api/ready',
    validate: async (response) => {
      const payload = await response.json();
      if (payload.status !== 'ready') {
        throw new Error(`unexpected readiness status: ${payload.status}`);
      }
    }
  });
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    for (const check of checks) {
      const response = await fetch(`${baseUrl}${check.path}`, {
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`${check.path} returned HTTP ${response.status}`);
      }

      await check.validate(response);
    }

    console.log(`Smoke test passed: ${checks.map(({ path }) => path).join(', ')}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.log(`Smoke test attempt ${attempt}/${attempts} failed: ${error.message}`);
    await delay(delayMs);
  }
}

console.error(`Smoke test failed: ${lastError?.message || 'unknown error'}`);
process.exit(1);
