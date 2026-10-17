/*
# Government healthcare directory: facilities, schemes, dataset sources, imports

1. Plain-English summary
   Adds the Government Healthcare module's data structures:
   - `gov_facilities` — public healthcare facilities with full provenance:
     source name/URL/record ID, import date, last verified date, verification
     status (VERIFIED / REPORTED / DEMO / STALE / UNKNOWN), facility type
     (PHC/CHC/District Hospital etc.), state, district, city, specialties,
     address, phone, website.
   - `gov_schemes` — official healthcare schemes (e.g. PM-JAY) with
     description, benefits, eligibility notes, official URL and provenance.
   - `dataset_sources` — registry of official datasets the app may import:
     source name, organisation, URL, format, licence note, refresh policy,
     and whether automated refresh is permitted.
   - `import_logs` — an audit trail per ingestion run: dataset, row counts
     (imported/rejected), status, errors, and duration.

2. Security
   - RLS enabled on all four; read-only SELECT for anon + authenticated on the
     public directory/scheme/source tables. `import_logs` is admin-facing but
     readable in this single-tenant demo via the same SELECT grant.

3. Notes
   - All seeded rows are DEMO status fictional facilities, clearly separated
     from any future real import (which would be VERIFIED/REPORTED with real
     source URLs). The UI must never present DEMO rows as official data.
*/

CREATE TABLE IF NOT EXISTS gov_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  facility_type text NOT NULL,
  state text,
  district text,
  city text,
  locality text,
  address text,
  phone text,
  website text,
  specialties text[] NOT NULL DEFAULT '{}',
  source_name text NOT NULL,
  source_url text,
  source_record_id text,
  import_date timestamptz NOT NULL DEFAULT now(),
  last_verified_at timestamptz,
  verification_status text NOT NULL DEFAULT 'UNKNOWN'
    CHECK (verification_status IN ('VERIFIED','REPORTED','ESTIMATED','DEMO','STALE','UNKNOWN')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gov_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  benefits text,
  eligibility_note text NOT NULL DEFAULT 'Check official criteria',
  official_url text,
  source_name text NOT NULL,
  verification_status text NOT NULL DEFAULT 'UNKNOWN'
    CHECK (verification_status IN ('VERIFIED','REPORTED','ESTIMATED','DEMO','STALE','UNKNOWN')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataset_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organisation text NOT NULL,
  url text NOT NULL,
  format text NOT NULL,
  licence_note text,
  refresh_policy text NOT NULL DEFAULT 'manual',
  automated_refresh_permitted boolean NOT NULL DEFAULT false,
  last_import_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset text NOT NULL,
  status text NOT NULL CHECK (status IN ('success','partial','failed')),
  rows_imported integer NOT NULL DEFAULT 0,
  rows_rejected integer NOT NULL DEFAULT 0,
  errors text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_gov_facilities_state ON gov_facilities (state, district);
CREATE INDEX IF NOT EXISTS idx_gov_facilities_status ON gov_facilities (verification_status);

ALTER TABLE gov_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gov_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demo_select_gov_facilities" ON gov_facilities;
CREATE POLICY "demo_select_gov_facilities" ON gov_facilities
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_select_gov_schemes" ON gov_schemes;
CREATE POLICY "demo_select_gov_schemes" ON gov_schemes
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_select_dataset_sources" ON dataset_sources;
CREATE POLICY "demo_select_dataset_sources" ON dataset_sources
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_select_import_logs" ON import_logs;
CREATE POLICY "demo_select_import_logs" ON import_logs
  FOR SELECT TO anon, authenticated USING (true);
