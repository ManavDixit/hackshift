/*
# Seed hospital cost & availability reference data

1. Plain-English summary
   Fills the three tables created earlier with the demo hospitals MediLink
   already shows, now as real database rows: three hospitals, itemized charge
   lines (consultation, diagnostics, procedure, room & nursing, consumables,
   follow-up for both Angioplasty and General Admission), and room categories
   with honest availability statuses.

2. Tables modified (INSERT only)
   - `hospitals` — 3 rows, all explicitly `data_status = 'sample'`.
   - `hospital_charge_items` — itemized billable lines per hospital per procedure.
   - `hospital_rooms` — 3–4 room categories per hospital. Every room row carries
     a daily rate range; where bed counts are not known, availability_status is
     'unknown' and beds_reported stays empty (the UI then shows "not reported").

3. Security
   - No changes; the RLS read-only policies from the previous migration apply.

4. Notes
   - Idempotent: each INSERT is guarded so re-running never duplicates rows.
   - All numbers are illustrative sample ranges for the hackathon demo; the
     app displays them labeled as sample data and computes totals only by
     summing these line items.
*/

INSERT INTO hospitals (slug, name, location, type, source, data_status, updated_hours_ago)
SELECT * FROM (VALUES
  ('city-care', 'City Care Multispecialty Hospital', 'Central District', 'Multispecialty', 'Illustrative listing', 'sample', 72),
  ('sunrise-health', 'Sunrise Health Institute', 'North Ring Road', 'Cardiac specialty', 'Illustrative listing', 'sample', 168),
  ('lakeview-medical', 'Lakeview Medical Center', 'Lakefront Area', 'Multispecialty', 'Illustrative listing', 'sample', 120)
) AS v(slug, name, location, type, source, data_status, updated_hours_ago)
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE slug = v.slug);

INSERT INTO hospital_charge_items (hospital_id, applies_to, category, item, price_low, price_high)
SELECT h.id, v.applies_to, v.category, v.item, v.price_low, v.price_high
FROM (VALUES
  ('city-care', 'angioplasty', 'Consultation', 'Cardiologist consultation (pre-procedure)', 700, 1200),
  ('city-care', 'angioplasty', 'Diagnostics', 'ECG + Echocardiogram', 3200, 4500),
  ('city-care', 'angioplasty', 'Diagnostics', 'Pre-procedure blood panel', 1500, 2200),
  ('city-care', 'angioplasty', 'Procedure', 'Angioplasty with one stent', 42000, 68000),
  ('city-care', 'angioplasty', 'Room & nursing (3 days)', 'General ward room + nursing charges', 9000, 13500),
  ('city-care', 'angioplasty', 'Consumables & pharmacy', 'Stent consumables, IV meds, disposables', 8000, 12000),
  ('city-care', 'angioplasty', 'Follow-up', 'Discharge summary + 1 review visit', 1000, 1600),

  ('city-care', 'general-admission', 'Consultation', 'Physician consultation', 500, 900),
  ('city-care', 'general-admission', 'Diagnostics', 'Basic blood panel', 1200, 1800),
  ('city-care', 'general-admission', 'Room & nursing (2 days)', 'General ward room + nursing charges', 6000, 9000),
  ('city-care', 'general-admission', 'Consumables & pharmacy', 'IV meds, disposables', 2500, 4000),
  ('city-care', 'general-admission', 'Follow-up', 'Discharge summary', 500, 800),

  ('sunrise-health', 'angioplasty', 'Consultation', 'Cardiologist consultation (pre-procedure)', 900, 1500),
  ('sunrise-health', 'angioplasty', 'Diagnostics', 'ECG + Echocardiogram', 4200, 5800),
  ('sunrise-health', 'angioplasty', 'Procedure', 'Angioplasty with one stent', 52000, 84000),
  ('sunrise-health', 'angioplasty', 'Room & nursing (3 days)', 'Semi-private room + nursing charges', 15000, 22500),
  ('sunrise-health', 'angioplasty', 'Consumables & pharmacy', 'Stent consumables, IV meds, disposables', 9500, 14000),
  ('sunrise-health', 'angioplasty', 'Follow-up', 'Discharge summary + 1 review visit', 1400, 2000),

  ('sunrise-health', 'general-admission', 'Consultation', 'Physician consultation', 700, 1100),
  ('sunrise-health', 'general-admission', 'Diagnostics', 'Basic blood panel', 1500, 2200),
  ('sunrise-health', 'general-admission', 'Room & nursing (2 days)', 'Semi-private room + nursing charges', 10000, 15000),
  ('sunrise-health', 'general-admission', 'Consumables & pharmacy', 'IV meds, disposables', 3000, 4500),
  ('sunrise-health', 'general-admission', 'Follow-up', 'Discharge summary', 800, 1200),

  ('lakeview-medical', 'angioplasty', 'Consultation', 'Cardiologist consultation (pre-procedure)', 600, 1000),
  ('lakeview-medical', 'angioplasty', 'Diagnostics', 'ECG + Echocardiogram', 2800, 4000),
  ('lakeview-medical', 'angioplasty', 'Diagnostics', 'Pre-procedure blood panel', 1300, 1900),
  ('lakeview-medical', 'angioplasty', 'Procedure', 'Angioplasty with one stent', 38000, 62000),
  ('lakeview-medical', 'angioplasty', 'Room & nursing (3 days)', 'General ward room + nursing charges', 8400, 12600),
  ('lakeview-medical', 'angioplasty', 'Consumables & pharmacy', 'Stent consumables, IV meds, disposables', 7500, 11000),
  ('lakeview-medical', 'angioplasty', 'Follow-up', 'Discharge summary + 1 review visit', 900, 1400),

  ('lakeview-medical', 'general-admission', 'Consultation', 'Physician consultation', 450, 750),
  ('lakeview-medical', 'general-admission', 'Diagnostics', 'Basic blood panel', 1000, 1500),
  ('lakeview-medical', 'general-admission', 'Room & nursing (2 days)', 'General ward room + nursing charges', 5400, 8100),
  ('lakeview-medical', 'general-admission', 'Consumables & pharmacy', 'IV meds, disposables', 2200, 3500),
  ('lakeview-medical', 'general-admission', 'Follow-up', 'Discharge summary', 400, 650)
) AS v(hospital_slug, applies_to, category, item, price_low, price_high)
JOIN hospitals h ON h.slug = v.hospital_slug
WHERE NOT EXISTS (
  SELECT 1 FROM hospital_charge_items c
  WHERE c.hospital_id = h.id
    AND c.applies_to = v.applies_to
    AND c.category = v.category
    AND c.item = v.item
);

INSERT INTO hospital_rooms (hospital_id, category, rate_low, rate_high, availability_status, beds_reported, updated_hours_ago)
SELECT h.id, v.category, v.rate_low, v.rate_high, v.availability_status, v.beds_reported, v.updated_hours_ago
FROM (VALUES
  ('city-care', 'General ward', 1800, 2500, 'verified', 4, 20),
  ('city-care', 'Semi-private', 3000, 4200, 'reported', NULL, 20),
  ('city-care', 'Private room', 5500, 7500, 'reported', NULL, 20),
  ('city-care', 'ICU', 8500, 12000, 'unknown', NULL, 96),

  ('sunrise-health', 'General ward', 2200, 3000, 'reported', NULL, 48),
  ('sunrise-health', 'Semi-private', 3800, 5000, 'verified', 6, 48),
  ('sunrise-health', 'Private room', 6500, 9000, 'reported', NULL, 48),

  ('lakeview-medical', 'General ward', 1500, 2200, 'verified', 7, 30),
  ('lakeview-medical', 'Semi-private', 2800, 3800, 'reported', NULL, 30),
  ('lakeview-medical', 'Private room', 5000, 7000, 'unknown', NULL, 240)
) AS v(hospital_slug, category, rate_low, rate_high, availability_status, beds_reported, updated_hours_ago)
JOIN hospitals h ON h.slug = v.hospital_slug
WHERE NOT EXISTS (
  SELECT 1 FROM hospital_rooms r
  WHERE r.hospital_id = h.id AND r.category = v.category
);
