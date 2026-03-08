
-- Cancel all test bookings to free up dates for new testing
UPDATE bookings SET status = 'cancelled' WHERE status IN ('pending', 'confirmed');
