
-- Fix profiles SELECT policies
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
