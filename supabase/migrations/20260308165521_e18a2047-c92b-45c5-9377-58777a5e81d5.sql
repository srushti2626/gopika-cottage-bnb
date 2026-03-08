
-- Fix old-format booking IDs to sequential format
UPDATE bookings SET booking_id = 'GC08' WHERE booking_id = 'GC20260308-e756e478';
UPDATE bookings SET booking_id = 'GC09' WHERE booking_id = 'GC20260308-a68ac2ef';

-- Fix corresponding invoice numbers
UPDATE invoices SET invoice_number = 'INV-08' WHERE booking_id = (SELECT id FROM bookings WHERE booking_id = 'GC08');
UPDATE invoices SET invoice_number = 'INV-09' WHERE booking_id = (SELECT id FROM bookings WHERE booking_id = 'GC09');
