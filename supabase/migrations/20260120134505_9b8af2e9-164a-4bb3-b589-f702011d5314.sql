-- Add explicit policies to block anonymous SELECT access on sensitive tables

-- Block anonymous access to profiles table
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (false);

-- Block anonymous access to bookings table
CREATE POLICY "Block anonymous access to bookings" 
ON public.bookings 
FOR SELECT 
TO anon 
USING (false);