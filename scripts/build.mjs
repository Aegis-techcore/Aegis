import { spawnSync } from 'node:child_process';

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://build:build@example.invalid/aegis?sslmode=require';

const result = spawnSync(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'build'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      DATABASE_DRIVER:
        process.env.DATABASE_DRIVER || 'postgres'
    }
  }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
