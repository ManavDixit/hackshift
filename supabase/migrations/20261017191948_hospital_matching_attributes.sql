/*
# Hospital matching: facility attributes + services (needs-first matching, Phase 2)

1. Plain-English summary
   Extends the existing hospital tables so the app can match hospitals to a
   patient's actual requirements instead of a generic ranking. Each hospital
   now records whether it is government or private, its address and phone,
   its sample travel distance, whether insurance-network status is verified,
   whether wheelchair access is verified, and which medical services it offers
   with an honest verification status for each service.

2. Modified tables
   - `hospitals` — new columns:
     `facility_status` ('government' | 'private'),
     `address`, `phone` (display/contact info),
     `distance_km` (sample travel distance),
     `network_status` ('verified_in_network' | 'reported' | 'unknown'),
     `network_verified_hours_ago`,
     `wheelchair_status` ('verified' | 'reported' | 'unknown').
   - New table `hospital_services` — one row per hospital per service
     (e.g. cardiology, emergency) with `status`
     ('verified' | 'reported' | 'unknown') and `updated_hours_ago`.
     Unique index on (hospital_id, service) prevents duplicates.

3. Security
   - Row Level Security enabled on `hospital_services` with a read-only
     SELECT policy for anon + authenticated (intentionally public reference
     data, same as the existing hospital tables). No write policies.

4. Notes
   - Matching rules encoded in the app: a required service with status
     'unknown' NEVER counts as a match; 'reported' matches with a visible
     warning; only 'verified' counts as confirmed. All rows remain explicitly
     sample data (hospitals.data_status = 'sample').
*/

ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS facility_status text NOT NULL DEFAULT 'private';
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS distance_km numeric;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS network_status text NOT NULL DEFAULT 'unknown';
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS network_verified_hours_ago integer;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS wheelchair_status text NOT NULL DEFAULT 'unknown';

CREATE TABLE IF NOT EXISTS hospital_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  service text NOT NULL,
  status text NOT NULL DEFAULT 'unknown'
    CHECK (status IN ('verified', 'reported', 'unknown')),
  updated_hours_ago integer NOT NULL DEFAULT 72,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_hospital_services_unique
  ON hospital_services (hospital_id, service);

ALTER TABLE hospital_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_hospital_services" ON hospital_services;
CREATE POLICY "anon_select_hospital_services" ON hospital_services
  FOR SELECT TO anon, authenticated USING (true);

UPDATE hospitals SET
  facility_status = 'private',
  address = '12 Central Avenue (sample address)',
  phone = '+91 00000 00101',
  distance_km = 3.2,
  network_status = 'verified_in_network',
  network_verified_hours_ago = 24,
  wheelchair_status = 'verified'
WHERE slug = 'city-care';

UPDATE hospitals SET
  facility_status = 'private',
  address = '45 North Ring Road (sample address)',
  phone = '+91 00000 00102',
  distance_km = 7.8,
  network_status = 'reported',
  network_verified_hours_ago = 168,
  wheelchair_status = 'reported'
WHERE slug = 'sunrise-health';

UPDATE hospitals SET
  facility_status = 'private',
  address = '8 Lakefront Promenade (sample address)',
  phone = '+91 00000 00103',
  distance_km = 11.5,
  network_status = 'unknown',
  network_verified_hours_ago = NULL,
  wheelchair_status = 'unknown'
WHERE slug = 'lakeview-medical';

INSERT INTO hospital_services (hospital_id, service, status, updated_hours_ago)
SELECT h.id, v.service, v.status, v.updated_hours_ago
FROM (VALUES
  ('city-care', 'cardiology', 'verified', 48),
  ('city-care', 'general-medicine', 'verified', 48),
  ('city-care', 'emergency', 'verified', 20),
  ('city-care', 'diagnostics', 'verified', 48),
  ('city-care', 'pediatrics', 'reported', 240),
  ('city-care', 'orthopedics', 'reported', 240),

  ('sunrise-health', 'cardiology', 'verified', 72),
  ('sunrise-health', 'diagnostics', 'reported', 168),
  ('sunrise-health', 'emergency', 'unknown', 168),
  ('sunrise-health', 'orthopedics', 'reported', 336),

  ('lakeview-medical', 'cardiology', 'verified', 120),
  ('lakeview-medical', 'general-medicine', 'verified', 120),
  ('lakeview-medical', 'pediatrics', 'verified', 96),
  ('lakeview-medical', 'diagnostics', 'reported', 120),
  ('lakeview-medical', 'orthopedics', 'reported', 240),
  ('lakeview-medical', 'emergency', 'reported', 96)
) AS v(hospital_slug, service, status, updated_hours_ago)
JOIN hospitals h ON h.slug = v.hospital_slug
WHERE NOT EXISTS (
  SELECT 1 FROM hospital_services s
  WHERE s.hospital_id = h.id AND s.service = v.service
);
