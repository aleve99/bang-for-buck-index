-- Admin moderation policies for crowdsourced price entries.
-- The Next.js admin UI uses the local Postgres role (bypasses RLS).
-- These policies cover PostgREST / anon+authenticated clients.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

CREATE INDEX IF NOT EXISTS idx_price_entries_verified_created
  ON public.price_entries (verified, created_at DESC);

-- UPDATE needs a SELECT policy on the same rows (Postgres RLS).
CREATE POLICY "Admins can read all price entries"
  ON public.price_entries
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update price entries"
  ON public.price_entries
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete unverified price entries"
  ON public.price_entries
  FOR DELETE
  USING (verified = false AND public.is_admin());

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
