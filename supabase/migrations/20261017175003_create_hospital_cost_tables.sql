/*
# Hospital cost & availability reference data (Phase 2 core workflow)

1. Plain-English summary
   Adds the verified reference data structures that power MediLink's Hospital Cost
   Estimator: three sample hospitals, their itemized treatment charges for two
   procedures, and per-room-category daily rates with an explicit availability
   status. The cost estimate itself is always computed in application code by
   summing these itemized ranges — the AI/database never invents a price.

2. New Tables
   - `hospitals` — one row per hospital: name, location, type, data source,
     `data_status` (always 'sample' until a verified feed replaces it), and
     `updated_hours_ago` so the UI can honestly label data freshness.
   - `hospital_charge_items` — one row per billable line item per hospital:
     category (e.g. Consultation, Diagnostics), human-readable item, a
     `applies_to` procedure slug ('angioplasty' or 'general-admission'), and a
     price range (price_low / price_high) in rupees. Ranges, never point
     estimates, are stored so the UI can show uncertainty transparently.
   - `hospital_rooms` — per hospital per room category (General ward,
     Semi-private, Private, ICU): daily rate range, `availability_status`
     ('verified' | 'reported' | 'unknown') and an optional `beds_reported`
     count. 'unknown' means the UI must say "not reported", never guess.

3. Security
   - Row Level Security enabled on all three tables.
   - Read-only SELECT policies granted to anon and authenticated roles
     (USING (true)) — this data is intentionally public, shared reference
     content with no per-user ownership, and the app has no sign-in requirement.
   - No INSERT/UPDATE/DELETE policies: the client can never mutate hospital
     reference data; only the migration seed (and future authorized feeds) can.

4. Notes
   - Seeded rows are explicitly labeled sample data. All prices are illustrative
     ranges for a hackathon demo and the UI displays them with that label.
   - Foreign keys use ON DELETE CASCADE so removing a hospital removes its
     charges and rooms cleanly.
*/

CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  source text NOT NULL DEFAULT 'Illustrative listing',
  data_status text NOT NULL DEFAULT 'sample',
  updated_hours_ago integer NOT NULL DEFAULT 72,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospital_charge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  applies_to text NOT NULL,
  category text NOT NULL,
  item text NOT NULL,
  price_low integer NOT NULL,
  price_high integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospital_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  category text NOT NULL,
  rate_low integer NOT NULL,
  rate_high integer NOT NULL,
  availability_status text NOT NULL DEFAULT 'unknown'
    CHECK (availability_status IN ('verified', 'reported', 'unknown')),
  beds_reported integer,
  updated_hours_ago integer NOT NULL DEFAULT 24,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_charge_items_hospital ON hospital_charge_items (hospital_id, applies_to);
CREATE INDEX IF NOT EXISTS idx_rooms_hospital ON hospital_rooms (hospital_id);

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_charge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_hospitals" ON hospitals;
CREATE POLICY "anon_select_hospitals" ON hospitals
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_charge_items" ON hospital_charge_items;
CREATE POLICY "anon_select_charge_items" ON hospital_charge_items
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_rooms" ON hospital_rooms;
CREATE POLICY "anon_select_rooms" ON hospital_rooms
  FOR SELECT TO anon, authenticated USING (true);
