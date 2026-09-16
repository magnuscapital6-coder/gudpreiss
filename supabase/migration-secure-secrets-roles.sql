-- ============================================================================
-- Secure secrets & roles — GudPreiss
--
-- 1) Mailer credentials (SMTP password, Resend key) were stored in the
--    `settings` row 'store', which is publicly readable (RLS). They move to
--    a 'store_secrets' row that only the service role can read.
-- 2) Admin role must live in auth.users.raw_app_meta_data (app_metadata),
--    which users cannot modify. user_metadata and profiles.role are
--    user-writable and no longer grant anything.
--
-- Apply via: Supabase Dashboard → SQL Editor (role: postgres / owner).
-- Run AFTER editing the admin e-mail in step 4, BEFORE deploying the code.
-- ============================================================================

-- --------------------------------------------------------------
-- 1) Move secrets out of the public 'store' row
--    (existing 'store_secrets' values take precedence)
-- --------------------------------------------------------------
INSERT INTO public.settings (key, value_json, updated_at)
SELECT
  'store_secrets',
  jsonb_strip_nulls(jsonb_build_object(
    'smtp_host',       value_json->'smtp_host',
    'smtp_port',       value_json->'smtp_port',
    'smtp_user',       value_json->'smtp_user',
    'smtp_password',   value_json->'smtp_password',
    'smtp_encryption', value_json->'smtp_encryption',
    'smtp_secure',     value_json->'smtp_secure',
    'resend_api_key',  value_json->'resend_api_key'
  )),
  NOW()
FROM public.settings
WHERE key = 'store'
ON CONFLICT (key) DO UPDATE
  SET value_json = EXCLUDED.value_json || public.settings.value_json,
      updated_at = NOW();

UPDATE public.settings
SET value_json = value_json
  - 'smtp_host' - 'smtp_port' - 'smtp_user' - 'smtp_password'
  - 'smtp_encryption' - 'smtp_secure' - 'resend_api_key',
    updated_at = NOW()
WHERE key = 'store';

-- --------------------------------------------------------------
-- 2) Public read of settings, except the secrets row
-- --------------------------------------------------------------
DROP POLICY IF EXISTS "settings: public read" ON public.settings;
CREATE POLICY "settings: public read"
  ON public.settings
  FOR SELECT
  USING (key <> 'store_secrets');

-- --------------------------------------------------------------
-- 3) Profiles — owners may update their own profile, but not `role`
-- --------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
    GRANT UPDATE (full_name, avatar_url, phone, updated_at) ON public.profiles TO authenticated;
  END IF;
END $$;

-- --------------------------------------------------------------
-- 4) Promote the real admin account(s) via app_metadata.
--    ⚠️ Replace the e-mail below with your admin e-mail.
-- --------------------------------------------------------------
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'REPLACE_WITH_ADMIN_EMAIL';

-- --------------------------------------------------------------
-- 5) Audit — accounts that claimed a privileged role via user_metadata.
--    Anyone listed here that is not a legitimate admin may have abused
--    the old login flow: check their activity, and rotate AUTH_COOKIE_SECRET
--    to invalidate all existing sessions.
-- --------------------------------------------------------------
SELECT
  email,
  raw_user_meta_data->>'role' AS user_metadata_role,
  raw_app_meta_data->>'role'  AS app_metadata_role,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE raw_user_meta_data->>'role' IN ('admin', 'manager', 'support')
   OR raw_app_meta_data->>'role'  IN ('admin', 'manager', 'support')
ORDER BY created_at;
