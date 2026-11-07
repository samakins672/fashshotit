-- The Paystack processing fee folded into the deposit (and the total). Refunds give back deposit_paid minus this.
ALTER TABLE bookings ADD COLUMN fee INTEGER NOT NULL DEFAULT 0;
