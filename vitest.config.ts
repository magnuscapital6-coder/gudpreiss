import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';

// Load .env.local for test environment
try {
  const envPath = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {}

// Block credentials so tests never hit the production Supabase / mailer.
// All services below fall back to their in-memory stores when unconfigured.
for (const key of [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'POSTGRES_URL',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_ENCRYPTION',
  'SMTP_SECURE',
  'RESEND_API_KEY',
]) {
  const value = process.env[key];
  if (value) {
    process.env[key] = 'test-blocked';
  }
}
// Empty SMTP_HOST so the mailer falls back to 'none' transport
// instead of attempting a real (blocked) hostname lookup.
const smtpHost = process.env.SMTP_HOST;
if (smtpHost) {
  process.env.SMTP_HOST = '';
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/db/**', 'src/lib/design-system/**'],
    },
  },
});
