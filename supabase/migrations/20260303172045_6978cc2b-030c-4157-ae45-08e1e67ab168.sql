
-- Add user_id and booking_id to testimonials so reviews are tied to users/bookings
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE;

-- Allow authenticated users to insert their own reviews
CREATE POLICY "Users can insert their own reviews"
ON public.testimonials
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to view their own reviews (even inactive ones)
CREATE POLICY "Users can view their own reviews"
ON public.testimonials
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
