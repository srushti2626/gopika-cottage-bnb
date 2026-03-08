
-- Table for available add-on services
CREATE TABLE public.addon_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  price_type text NOT NULL DEFAULT 'flat' CHECK (price_type IN ('per_person', 'flat')),
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addon_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Addon services viewable by everyone" ON public.addon_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage addon services" ON public.addon_services
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Junction table for selected add-ons per booking
CREATE TABLE public.booking_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  addon_service_id uuid NOT NULL REFERENCES public.addon_services(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL,
  total_price integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(booking_id, addon_service_id)
);

ALTER TABLE public.booking_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own booking addons" ON public.booking_addons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_addons.booking_id AND bookings.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can manage booking addons" ON public.booking_addons
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed the initial add-on services
INSERT INTO public.addon_services (name, description, price, price_type, display_order) VALUES
  ('Breakfast', 'Delicious homemade breakfast served fresh', 200, 'per_person', 1),
  ('City Tour', 'Guided city sightseeing tour', 1500, 'flat', 2);
