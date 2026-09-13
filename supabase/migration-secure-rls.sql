-- ============================================================================
-- Secure RLS policies — GudPreiss
-- Fix: anonymous users could READ all orders (PII leak) and INSERT into
-- orders/products/coupons/blog_posts (data pollution). All app writes are
-- server-side via the service-role key, which bypasses RLS.
--
-- Apply via: Supabase Dashboard → SQL Editor  (role: postgres / owner)
-- ============================================================================

-- --------------------------------------------------------------
-- 1) Drop ALL existing policies on the public schema (start clean)
-- --------------------------------------------------------------
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', rec.policyname, rec.tablename);
  END LOOP;
END $$;

-- --------------------------------------------------------------
-- 2) Public catalog — everyone may read
-- --------------------------------------------------------------
ALTER TABLE public.products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog: public read"  ON public.products  FOR SELECT USING (true);
CREATE POLICY "catalog: public read"  ON public.categories FOR SELECT USING (true);
CREATE POLICY "catalog: public read"  ON public.brands     FOR SELECT USING (true);
CREATE POLICY "catalog: public read"  ON public.banners    FOR SELECT USING (true);
CREATE POLICY "blog: public read"     ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "settings: public read" ON public.settings   FOR SELECT USING (true);

-- --------------------------------------------------------------
-- 3) Reviews — only approved ones are shown publicly.
--    (New reviews are created memory-side; admins manage status
--    through server actions with the service-role key.)
-- --------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews: approved visible"
  ON public.reviews
  FOR SELECT
  USING (status = 'approved');

-- --------------------------------------------------------------
-- 4) Orders — NO public read / write / update / delete.
--    Reads (tracking, account page) go through server actions with
--    the service-role key (bypasses RLS).
-- --------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- No policies at all: anon key gets zero access.
-- Service-role key (used by server actions / API routes) bypasses RLS.

-- --------------------------------------------------------------
-- 5) Order items — same treatment.
-- --------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- --------------------------------------------------------------
-- 6) Coupons — NOT publicly readable (codes + values are sensitive).
--    Validation happens server-side (validateCouponServerAction).
-- --------------------------------------------------------------
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- No public policies at all.

-- --------------------------------------------------------------
-- 7) Email logs — admin only (service-role key).
-- --------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_logs') THEN
    ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- --------------------------------------------------------------
-- 8) Profiles — owner may read/update own profile.
-- --------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "profiles: owner read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "profiles: owner update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- --------------------------------------------------------------
-- 9) Legacy table names used by older schema versions (safety).
--    9a. store_settings (old name for settings)
--    9b. carts / wishlists (localStorage-backed in the app, lock all)
-- --------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'store_settings') THEN
    ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "store_settings: public read" ON public.store_settings FOR SELECT USING (true);
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'carts') THEN
    ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wishlists') THEN
    ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- Optional verification queries (run afterwards to confirm)
--   SELECT tablename, count(*) FROM pg_policies WHERE schemaname='public'
--     GROUP BY tablename ORDER BY tablename;
--   SELECT * FROM pg_policies WHERE schemaname='public' AND tablename IN
--     ('orders','coupons','email_logs');  -- expect 0 rows
-- ============================================================================