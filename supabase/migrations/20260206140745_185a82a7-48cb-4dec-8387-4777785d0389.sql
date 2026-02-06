-- Grant execute permissions to service_role as well for admin queries
GRANT EXECUTE ON FUNCTION public.get_booking_availability() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_blocked_dates() TO service_role;

-- Also revoke from public and re-grant to ensure proper permissions
REVOKE ALL ON FUNCTION public.get_booking_availability() FROM public;
REVOKE ALL ON FUNCTION public.get_blocked_dates() FROM public;
GRANT EXECUTE ON FUNCTION public.get_booking_availability() TO anon;
GRANT EXECUTE ON FUNCTION public.get_blocked_dates() TO anon;
GRANT EXECUTE ON FUNCTION public.get_booking_availability() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_blocked_dates() TO authenticated;