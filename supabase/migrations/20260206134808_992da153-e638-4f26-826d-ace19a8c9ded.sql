-- Harden public availability views to avoid RLS bypass-by-view behavior while preserving public availability data.
-- Recreate views as SECURITY INVOKER and source their rows from tightly-scoped SECURITY DEFINER functions.

BEGIN;

-- booking_availability: expose only room/date ranges needed for public calendar
CREATE OR REPLACE VIEW public.booking_availability
WITH (security_invoker = on)
AS
  SELECT room_id, check_in_date, check_out_date
  FROM public.get_booking_availability();

-- blocked_dates_public: expose only room/date needed for public calendar
CREATE OR REPLACE VIEW public.blocked_dates_public
WITH (security_invoker = on)
AS
  SELECT id, room_id, blocked_date
  FROM public.get_blocked_dates();

-- Ensure only intended access on views
REVOKE ALL ON public.booking_availability FROM PUBLIC;
REVOKE ALL ON public.blocked_dates_public FROM PUBLIC;
GRANT SELECT ON public.booking_availability TO anon, authenticated;
GRANT SELECT ON public.blocked_dates_public TO anon, authenticated;

-- Make function execution explicit (same data surface as the views, but avoids surprises)
REVOKE ALL ON FUNCTION public.get_booking_availability() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_blocked_dates() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_availability() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_blocked_dates() TO anon, authenticated;

COMMIT;