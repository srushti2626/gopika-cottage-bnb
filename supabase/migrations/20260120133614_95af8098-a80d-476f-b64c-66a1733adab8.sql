-- Fix security issues: Tighten RLS policies on bookings and invoices tables

-- 1. Drop overly permissive bookings INSERT policy
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- 2. Create secure bookings INSERT policy - require authentication and user_id match
CREATE POLICY "Authenticated users can create their own bookings" 
ON public.bookings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Drop the email-based SELECT policy on bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- 4. Create secure bookings SELECT policy using user_id instead of email
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
TO authenticated
USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- 5. Drop overly permissive invoices INSERT policy
DROP POLICY IF EXISTS "System can create invoices" ON public.invoices;

-- Note: Invoice creation will now only be possible via:
-- 1. Admin users (through existing "Admins can manage invoices" policy)
-- 2. Edge functions using service role key
-- 3. Database triggers

-- 6. Drop the email-based SELECT policy on invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;

-- 7. Create secure invoices SELECT policy using booking relationship
-- Users can view invoices for their own bookings (via user_id on booking)
CREATE POLICY "Users can view their own invoices" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = invoices.booking_id 
    AND bookings.user_id = auth.uid()
  ) 
  OR has_role(auth.uid(), 'admin'::app_role)
);