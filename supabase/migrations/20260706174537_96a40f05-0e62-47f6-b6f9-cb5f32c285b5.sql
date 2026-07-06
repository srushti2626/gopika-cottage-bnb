
-- 1. Bookings: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING ((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Profiles: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Blocked dates: expose limited columns publicly for availability checks
GRANT SELECT (id, room_id, blocked_date) ON public.blocked_dates TO anon, authenticated;
CREATE POLICY "Public can view blocked date availability"
ON public.blocked_dates
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Bookings: restrict non-admin UPDATEs to cancellation_requested only via trigger
CREATE OR REPLACE FUNCTION public.enforce_booking_update_column_restrictions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Admins and service role bypass restrictions
  IF public.has_role(auth.uid(), 'admin'::app_role) OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only allow cancellation_requested to change; force all other columns back to OLD
  NEW.id := OLD.id;
  NEW.booking_id := OLD.booking_id;
  NEW.room_id := OLD.room_id;
  NEW.room_type := OLD.room_type;
  NEW.check_in_date := OLD.check_in_date;
  NEW.check_out_date := OLD.check_out_date;
  NEW.total_nights := OLD.total_nights;
  NEW.total_amount := OLD.total_amount;
  NEW.status := OLD.status;
  NEW.full_name := OLD.full_name;
  NEW.mobile_number := OLD.mobile_number;
  NEW.email := OLD.email;
  NEW.adults := OLD.adults;
  NEW.children := OLD.children;
  NEW.special_requests := OLD.special_requests;
  NEW.user_id := OLD.user_id;
  NEW.payment_status := OLD.payment_status;
  NEW.stripe_payment_id := OLD.stripe_payment_id;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_booking_update_columns ON public.bookings;
CREATE TRIGGER trg_enforce_booking_update_columns
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_update_column_restrictions();

-- 5. Lock down internal SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_booking_atomic(text, date, date, text, text, text, integer, integer, text, uuid) FROM anon, authenticated, public;

-- 6. Convert public availability functions to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.get_booking_availability()
RETURNS TABLE(room_id uuid, check_in_date date, check_out_date date)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT b.room_id, b.check_in_date, b.check_out_date
  FROM public.bookings b
  WHERE b.status IN ('pending', 'confirmed')
$$;

CREATE OR REPLACE FUNCTION public.get_blocked_dates()
RETURNS TABLE(id uuid, room_id uuid, blocked_date date)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT bd.id, bd.room_id, bd.blocked_date
  FROM public.blocked_dates bd
$$;

-- Allow anon to read the availability-only columns from bookings via the invoker function
GRANT SELECT (room_id, check_in_date, check_out_date, status) ON public.bookings TO anon;
CREATE POLICY "Public can view booking availability windows"
ON public.bookings
FOR SELECT
TO anon
USING (status IN ('pending'::booking_status, 'confirmed'::booking_status));

-- 7. Storage: remove broad SELECT policies that allow listing public buckets.
-- Public URLs (storage/v1/object/public/...) continue to work without these policies.
DROP POLICY IF EXISTS "Room images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Gallery images are publicly accessible" ON storage.objects;
