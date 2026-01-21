-- Create a public view for booking availability (exposes only room_id and dates, no guest info)
CREATE OR REPLACE VIEW public.booking_availability AS
SELECT 
  room_id, 
  check_in_date, 
  check_out_date
FROM public.bookings
WHERE status IN ('pending', 'confirmed');

-- Create a public view for blocked dates (hides internal reason field)
CREATE OR REPLACE VIEW public.blocked_dates_public AS
SELECT 
  id,
  room_id, 
  blocked_date
FROM public.blocked_dates;

-- Grant anonymous and authenticated users access to these public views
GRANT SELECT ON public.booking_availability TO anon, authenticated;
GRANT SELECT ON public.blocked_dates_public TO anon, authenticated;

-- Drop the overly permissive public policy on blocked_dates
DROP POLICY IF EXISTS "Blocked dates are viewable by everyone" ON public.blocked_dates;

-- Create a more restrictive policy - only admins can see full blocked_dates with reasons
CREATE POLICY "Only admins can view full blocked dates" 
ON public.blocked_dates 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy allowing service role to insert bookings (for guest booking edge function)
CREATE POLICY "Service role can insert bookings" 
ON public.bookings 
FOR INSERT 
TO service_role 
WITH CHECK (true);