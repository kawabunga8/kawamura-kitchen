-- Fix 1: Drop open RLS policies that apply to the anon role (not scoped to authenticated)
DROP POLICY IF EXISTS "Allow all access to dinners" ON "public"."dinners";
DROP POLICY IF EXISTS "Allow all access to family_members" ON "public"."family_members";
DROP POLICY IF EXISTS "Allow all access to pantry_items" ON "public"."pantry_items";
DROP POLICY IF EXISTS "Allow all access to requests" ON "public"."requests";

-- Fix 2: Revoke table and sequence grants from the anon (unauthenticated) role
REVOKE ALL ON TABLE "public"."dinners" FROM "anon";
REVOKE ALL ON TABLE "public"."family_members" FROM "anon";
REVOKE ALL ON TABLE "public"."pantry_items" FROM "anon";
REVOKE ALL ON TABLE "public"."requests" FROM "anon";
REVOKE ALL ON TABLE "public"."votes" FROM "anon";
REVOKE ALL ON SEQUENCE "public"."dinners_id_seq" FROM "anon";
REVOKE ALL ON SEQUENCE "public"."family_members_id_seq" FROM "anon";
REVOKE ALL ON SEQUENCE "public"."pantry_items_id_seq" FROM "anon";
REVOKE ALL ON SEQUENCE "public"."requests_id_seq" FROM "anon";
REVOKE ALL ON SEQUENCE "public"."votes_id_seq" FROM "anon";

-- Fix 4: Add missing sms_notifications column (code was already checking this field)
ALTER TABLE "public"."family_members"
  ADD COLUMN IF NOT EXISTS "sms_notifications" boolean DEFAULT false;

-- Fix 5: Atomic vote increment to prevent race conditions
CREATE OR REPLACE FUNCTION increment_request_votes(p_request_id bigint)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.requests SET votes = votes + 1 WHERE id = p_request_id;
$$;
