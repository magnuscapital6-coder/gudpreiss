import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const upsertResult: { error: any } = { error: null };

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => {
    const selectChain: any = {
      eq: () => selectChain,
      single: async () => ({ data: { value_json: {} }, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      // ensureSeeded awaits this to read `{ count }`; >0 means "already seeded".
      then: (resolve: any) => resolve({ count: 1, data: [], error: null }),
    };
    return {
      from: () => ({
        select: () => selectChain,
        upsert: async () => upsertResult,
      }),
    };
  },
}));

describe('updateStoreSettings must not swallow a rejected write', () => {
  let updateStoreSettings: typeof import('@/lib/db/db-provider').updateStoreSettings;

  beforeEach(async () => {
    upsertResult.error = null;
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://unit-test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJunit-test-anon-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'eyJunit-test-service-role');
    vi.resetModules();
    ({ updateStoreSettings } = await import('@/lib/db/db-provider'));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // The regression: PostgREST answers a RLS/permission rejection with `{ error }`
  // rather than throwing. The old code awaited the upsert without inspecting the
  // result, so an admin-set IBAN looked saved and then silently reverted.
  it('rejects when the upsert returns an error instead of resolving successfully', async () => {
    upsertResult.error = {
      message: 'new row violates row-level security policy for table "settings"',
      code: '42501',
    };

    await expect(
      updateStoreSettings({ iban: 'DE89 3704 0044 0532 0130 00' })
    ).rejects.toThrow(/Failed to persist store settings/);
  });

  it('includes the RLS hint when the write fell back to the anon key', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    vi.resetModules();
    const mod = await import('@/lib/db/db-provider');

    upsertResult.error = { message: 'permission denied', code: '42501' };

    await expect(mod.updateStoreSettings({ iban: 'DE89 3704 0044 0532 0130 00' })).rejects.toThrow(
      /SUPABASE_SERVICE_ROLE_KEY/
    );
  });

  it('resolves when the upsert succeeds', async () => {
    upsertResult.error = null;

    const updated = await updateStoreSettings({
      iban: 'DE89 3704 0044 0532 0130 00',
      bic: 'DEUTDEDBXXX',
    });

    expect(updated.iban).toBe('DE89 3704 0044 0532 0130 00');
    expect(updated.bic).toBe('DEUTDEDBXXX');
  });
});