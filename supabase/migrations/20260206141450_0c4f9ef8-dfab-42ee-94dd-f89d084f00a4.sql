-- Create the missing SECURITY DEFINER functions that the views depend on

-- Function to get booking availability for public calendar
CREATE OR REPLACE FUNCTION public.get_booking_availability()
RETURNS TABLE (room_id uuid, check_in_date date, check_out_date date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    b.room_id, 
    b.check_in_date, 
    b.check_out_date
  FROM public.bookings b
  WHERE b.status IN ('pending', 'confirmed')
$$;

-- Function to get blocked dates for public calendar
CREATE OR REPLACE FUNCTION public.get_blocked_dates()
RETURNS TABLE (id uuid, room_id uuid, blocked_date date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bd.id,
    bd.room_id, 
    bd.blocked_date
  FROM public.blocked_dates bd
$$;

-- Grant execute permissions to allow public access to calendar data
GRANT EXECUTE ON FUNCTION public.get_booking_availability() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_blocked_dates() TO anon, authenticated, service_role;