
-- Fix bookings SELECT policies: drop the conflicting restrictive ones, add proper permissive policies
DROP POLICY IF EXISTS "Block anonymous access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
