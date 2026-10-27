-- Initial schema for Fash Shot It bookings and waitlist

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'cancelled'
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  faculty TEXT,
  department TEXT,
  members TEXT, -- JSON array of group member names: ["Friend 1", "Friend 2"]
  ambassador_code TEXT,
  package_size INTEGER NOT NULL,
  total INTEGER NOT NULL,
  deposit_paid INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  marketing_opt_in INTEGER NOT NULL DEFAULT 0,
  finz_opt_in INTEGER NOT NULL DEFAULT 0,
  shoot_period TEXT NOT NULL,
  paystack_reference TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
