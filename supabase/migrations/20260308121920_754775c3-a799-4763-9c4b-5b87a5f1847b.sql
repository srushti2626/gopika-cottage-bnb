
CREATE OR REPLACE FUNCTION public.create_booking_atomic(p_room_type text, p_check_in date, p_check_out date, p_full_name text, p_mobile text, p_email text, p_adults integer, p_children integer, p_special_requests text, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room RECORD;
  v_conflict_count int;
  v_blocked_count int;
  v_nights int;
  v_subtotal int;
  v_tax int;
  v_total int;
  v_id uuid;
  v_booking_id text;
  v_invoice_id uuid;
  v_invoice_number text;
  v_last_night date;
  v_seq int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('create_booking'));

  v_nights := p_check_out - p_check_in;
  v_last_night := p_check_out - 1;

  FOR v_room IN
    SELECT id, price_per_night
    FROM rooms
    WHERE is_active = true
      AND room_type = p_room_type::room_type
      AND max_guests >= (p_adults + p_children)
    ORDER BY id
  LOOP
    SELECT count(*) INTO v_blocked_count
    FROM blocked_dates
    WHERE blocked_date BETWEEN p_check_in AND v_last_night
      AND (room_id IS NULL OR room_id = v_room.id);

    IF v_blocked_count > 0 THEN CONTINUE; END IF;

    SELECT count(*) INTO v_conflict_count
    FROM bookings
    WHERE room_id = v_room.id
      AND status IN ('pending', 'confirmed')
      AND check_in_date < p_check_out
      AND check_out_date > p_check_in;

    IF v_conflict_count > 0 THEN CONTINUE; END IF;

    v_subtotal := v_room.price_per_night * v_nights;
    v_tax := round(v_subtotal * 0.18);
    v_total := v_subtotal + v_tax;
    v_id := gen_random_uuid();
    
    SELECT COALESCE(MAX(
      CASE 
        WHEN booking_id ~ '^GC[0-9]+$' THEN substring(booking_id from 3)::int
        ELSE 0
      END
    ), 0) + 1 INTO v_seq FROM bookings;
    v_booking_id := 'GC' || lpad(v_seq::text, 2, '0');

    INSERT INTO bookings (id, booking_id, room_id, room_type, check_in_date, check_out_date,
      total_nights, total_amount, status, full_name, mobile_number, email, adults, children,
      special_requests, user_id, payment_status)
    VALUES (v_id, v_booking_id, v_room.id, p_room_type::room_type, p_check_in, p_check_out,
      v_nights, v_total, 'confirmed', p_full_name, p_mobile, p_email, p_adults, p_children,
      p_special_requests, p_user_id, 'pay_at_checkin');

    v_invoice_id := gen_random_uuid();
    v_invoice_number := 'INV-' || lpad(v_seq::text, 2, '0');

    INSERT INTO invoices (id, invoice_number, booking_id, guest_name, guest_email, guest_mobile,
      room_type, check_in_date, check_out_date, total_nights, room_price_per_night,
      subtotal, tax_amount, total_amount)
    VALUES (v_invoice_id, v_invoice_number, v_id, p_full_name, p_email, p_mobile,
      p_room_type::room_type, p_check_in, p_check_out, v_nights, v_room.price_per_night,
      v_subtotal, v_tax, v_total);

    RETURN jsonb_build_object('bookingId', v_booking_id, 'totalAmount', v_total);
  END LOOP;

  RETURN jsonb_build_object('error', 'No rooms available for selected dates');
END;
$function$;
