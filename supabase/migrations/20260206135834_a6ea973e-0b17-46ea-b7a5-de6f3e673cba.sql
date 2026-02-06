-- Fix permissions for SECURITY DEFINER functions
-- Grant execute permissions to anon and authenticated roles

GRANT EXECUTE ON FUNCTION public.get_booking_availability() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_blocked_dates() TO anon, authenticated;