/*
# Personal health data: documents, timeline, insurance profile, care tasks

1. Plain-English summary
   Adds the four personal-data tables the new patient modules need:
   - Health History: uploaded-document records and a structured medical
     timeline where extracted entries must be approved by the patient before
     they count as part of their history.
   - Insurance: a single insurance profile holding confirmed policy terms used
     by the deterministic out-of-pocket estimator.
   - Care plan: trackable tasks with due dates, priority and status.

2. New Tables
   - `health_documents` — one row per uploaded record: title, category
     (Prescription, Lab Report, Discharge Summary, Other), file name/type,
     page count, and `extraction_status` ('pending' | 'extracted' |
     'reviewed' | 'failed'). Metadata only — no file bytes are stored in this
     demo.
   - `timeline_entries` — structured history entries linked to a document
     (nullable): type (condition/medication/allergy/procedure/test/visit),
     title, detail, date, `origin` ('patient-reported' |
     'document-extracted' | 'clinician-confirmed'), `approval`
     ('pending_review' | 'approved'), and per-entry consent flag
     `share_with_provider`.
   - `insurance_profile` — one row: insurer, policy name/type, coverage
     amount, remaining limit, deductible, co-pay %, room-rent limit,
     exclusions (text[]), network status, preauthorization requirement,
     validity date, and a `confirmed` flag that must be true before the
     estimator uses it.
   - `care_tasks` — title, category, due date, priority
     ('low'|'medium'|'high'), status ('todo'|'done'), notes.

3. Security
   - RLS enabled on all four tables. This app has no sign-in (demo profile),
     so policies are granted TO anon, authenticated. Timeline and documents
     are personal demo data in a single-tenant demo; full policies are granted
     so the module works end to end, and all seeded rows are fictional.

4. Notes
   - The estimator in application code only uses `insurance_profile` rows with
     `confirmed = true`; extracted-then-unconfirmed values never drive math.
   - No destructive operations; idempotent creates only.
*/

CREATE TABLE IF NOT EXISTS health_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('Prescription','Lab Report','Discharge Summary','Other')),
  file_name text,
  file_type text,
  pages integer NOT NULL DEFAULT 1,
  extraction_status text NOT NULL DEFAULT 'pending'
    CHECK (extraction_status IN ('pending','extracted','reviewed','failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timeline_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES health_documents(id) ON DELETE SET NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('condition','medication','allergy','procedure','test','visit')),
  title text NOT NULL,
  detail text,
  entry_date date,
  origin text NOT NULL DEFAULT 'patient-reported'
    CHECK (origin IN ('patient-reported','document-extracted','clinician-confirmed')),
  approval text NOT NULL DEFAULT 'pending_review'
    CHECK (approval IN ('pending_review','approved')),
  share_with_provider boolean NOT NULL DEFAULT false,
  source_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insurer text NOT NULL DEFAULT '',
  policy_name text NOT NULL DEFAULT '',
  policy_type text NOT NULL DEFAULT '',
  coverage_amount numeric,
  remaining_limit numeric,
  deductible numeric NOT NULL DEFAULT 0,
  copay_percent numeric NOT NULL DEFAULT 0,
  room_rent_limit numeric,
  exclusions text[] NOT NULL DEFAULT '{}',
  network_status text NOT NULL DEFAULT 'unknown',
  preauth_required boolean NOT NULL DEFAULT false,
  valid_until date,
  confirmed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS care_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  due_date date,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','done')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE health_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demo_select_health_documents" ON health_documents;
CREATE POLICY "demo_select_health_documents" ON health_documents
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_health_documents" ON health_documents;
CREATE POLICY "demo_insert_health_documents" ON health_documents
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_health_documents" ON health_documents;
CREATE POLICY "demo_update_health_documents" ON health_documents
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_health_documents" ON health_documents;
CREATE POLICY "demo_delete_health_documents" ON health_documents
  FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_select_timeline_entries" ON timeline_entries;
CREATE POLICY "demo_select_timeline_entries" ON timeline_entries
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_timeline_entries" ON timeline_entries;
CREATE POLICY "demo_insert_timeline_entries" ON timeline_entries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_timeline_entries" ON timeline_entries;
CREATE POLICY "demo_update_timeline_entries" ON timeline_entries
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_timeline_entries" ON timeline_entries;
CREATE POLICY "demo_delete_timeline_entries" ON timeline_entries
  FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_select_insurance_profile" ON insurance_profile;
CREATE POLICY "demo_select_insurance_profile" ON insurance_profile
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_insurance_profile" ON insurance_profile;
CREATE POLICY "demo_insert_insurance_profile" ON insurance_profile
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_insurance_profile" ON insurance_profile;
CREATE POLICY "demo_update_insurance_profile" ON insurance_profile
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_insurance_profile" ON insurance_profile;
CREATE POLICY "demo_delete_insurance_profile" ON insurance_profile
  FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_select_care_tasks" ON care_tasks;
CREATE POLICY "demo_select_care_tasks" ON care_tasks
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_care_tasks" ON care_tasks;
CREATE POLICY "demo_insert_care_tasks" ON care_tasks
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_care_tasks" ON care_tasks;
CREATE POLICY "demo_update_care_tasks" ON care_tasks
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_care_tasks" ON care_tasks;
CREATE POLICY "demo_delete_care_tasks" ON care_tasks
  FOR DELETE TO anon, authenticated USING (true);
