-- Prevent triggers from overriding explicitly supplied booking/invoice IDs
CREATE OR REPLACE FUNCTION public.generate_booking_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_seq int;
BEGIN
  -- Keep provided booking IDs (used by create_booking_atomic)
  IF NEW.booking_id IS NOT NULL AND btrim(NEW.booking_id) <> '' THEN
    RETURN NEW;
  END IF;

  -- Fallback generation for legacy/manual inserts
  SELECT COALESCE(
    MAX(
      CASE
        WHEN booking_id ~ '^GC[0-9]+$' THEN substring(booking_id from 3)::int
        ELSE 0
      END
    ),
    0
  ) + 1
  INTO v_seq
  FROM public.bookings;

  NEW.booking_id := 'GC' || lpad(v_seq::text, 2, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_seq int;
BEGIN
  -- Keep provided invoice numbers (used by create_booking_atomic)
  IF NEW.invoice_number IS NOT NULL AND btrim(NEW.invoice_number) <> '' THEN
    RETURN NEW;
  END IF;

  -- Fallback generation for legacy/manual inserts
  SELECT COALESCE(
    MAX(
      CASE
        WHEN invoice_number ~ '^INV-[0-9]+$' THEN substring(invoice_number from 5)::int
        ELSE 0
      END
    ),
    0
  ) + 1
  INTO v_seq
  FROM public.invoices;

  NEW.invoice_number := 'INV-' || lpad(v_seq::text, 2, '0');
  RETURN NEW;
END;
$$;

-- Normalize any legacy-format booking IDs to sequential GCxx values
WITH id_map AS (
  SELECT
    b.id,
    (
      COALESCE(
        (
          SELECT MAX(
            CASE
              WHEN booking_id ~ '^GC[0-9]+$' THEN substring(booking_id from 3)::int
              ELSE 0
            END
          )
          FROM public.bookings
          WHERE booking_id ~ '^GC[0-9]+$'
        ),
        0
      )
      + ROW_NUMBER() OVER (ORDER BY b.created_at, b.id)
    ) AS seq_num
  FROM public.bookings b
  WHERE b.booking_id !~ '^GC[0-9]+$'
)
UPDATE public.bookings b
SET booking_id = 'GC' || lpad(m.seq_num::text, 2, '0')
FROM id_map m
WHERE b.id = m.id;

-- Keep invoice numbers aligned with booking sequence
UPDATE public.invoices i
SET invoice_number = 'INV-' || substring(b.booking_id from 3)
FROM public.bookings b
WHERE i.booking_id = b.id
  AND (i.invoice_number IS NULL OR i.invoice_number !~ '^INV-[0-9]+$');