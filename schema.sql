-- ============================================================
-- EVOLMENTRA DATABASE SCHEMA
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── CLINICS ──────────────────────────────────────────────────
CREATE TABLE clinics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address     TEXT,
  phone       TEXT,
  email       TEXT,
  npi         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── STAFF ────────────────────────────────────────────────────
CREATE TABLE staff (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  title       TEXT NOT NULL DEFAULT 'BCBA',
  role        TEXT NOT NULL DEFAULT 'bcba' CHECK (role IN ('owner','bcba','rbt','admin')),
  email       TEXT NOT NULL,
  npi         TEXT,
  bacb_number TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PATIENTS ─────────────────────────────────────────────────
CREATE TABLE patients (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id             UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  date_of_birth         DATE NOT NULL,
  diagnosis             TEXT NOT NULL DEFAULT 'ASD Level 2',
  diagnosis_code        TEXT DEFAULT 'F84.0',
  insurance_carrier     TEXT,
  insurance_member_id   TEXT,
  auth_hours_per_week   INTEGER,
  auth_expiry_date      DATE,
  assigned_bcba_id      UUID REFERENCES staff(id),
  parent_name           TEXT,
  parent_email          TEXT,
  parent_phone          TEXT,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','waitlist','discharged')),
  notes                 TEXT,
  avatar_color          TEXT DEFAULT '#00d4c8',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── GOALS ────────────────────────────────────────────────────
CREATE TABLE goals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  domain              TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  mastery_criterion   TEXT NOT NULL DEFAULT '80% across 3 consecutive sessions',
  current_percentage  INTEGER DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','mastered','discontinued','on_hold')),
  created_by          UUID REFERENCES staff(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── SESSIONS ─────────────────────────────────────────────────
CREATE TABLE sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  therapist_id        UUID NOT NULL REFERENCES staff(id),
  scheduled_start     TIMESTAMPTZ NOT NULL,
  scheduled_end       TIMESTAMPTZ NOT NULL,
  actual_start        TIMESTAMPTZ,
  actual_end          TIMESTAMPTZ,
  session_type        TEXT NOT NULL DEFAULT 'dtt' CHECK (session_type IN ('dtt','net','group','telehealth','parent_training')),
  location            TEXT NOT NULL DEFAULT 'clinic' CHECK (location IN ('clinic','home','school','community','telehealth')),
  status              TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','cancelled','no_show')),
  cpt_code            TEXT DEFAULT '97153',
  units               INTEGER,
  evv_checkin_time    TIMESTAMPTZ,
  evv_checkout_time   TIMESTAMPTZ,
  evv_gps_verified    BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── SESSION NOTES (SOAP) ─────────────────────────────────────
CREATE TABLE session_notes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id         UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  author_id         UUID NOT NULL REFERENCES staff(id),
  subjective        TEXT,
  objective         TEXT,
  assessment        TEXT,
  plan              TEXT,
  raw_observations  TEXT,
  ai_generated      BOOLEAN DEFAULT FALSE,
  signed            BOOLEAN DEFAULT FALSE,
  signed_at         TIMESTAMPTZ,
  signed_by         UUID REFERENCES staff(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── AUDIT LOG (HIPAA) ────────────────────────────────────────
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID REFERENCES clinics(id),
  user_id         UUID REFERENCES auth.users(id),
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     TEXT,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY (HIPAA compliance) ────────────────────

ALTER TABLE clinics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff        ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log    ENABLE ROW LEVEL SECURITY;

-- Staff can only see their own clinic's data
CREATE POLICY "clinic_isolation" ON clinics
  FOR ALL USING (owner_id = auth.uid() OR id IN (
    SELECT clinic_id FROM staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "clinic_isolation" ON staff
  FOR ALL USING (clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
    UNION SELECT clinic_id FROM staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "clinic_isolation" ON patients
  FOR ALL USING (clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
    UNION SELECT clinic_id FROM staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "clinic_isolation" ON goals
  FOR ALL USING (clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
    UNION SELECT clinic_id FROM staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "clinic_isolation" ON sessions
  FOR ALL USING (clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
    UNION SELECT clinic_id FROM staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "clinic_isolation" ON session_notes
  FOR ALL USING (clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
    UNION SELECT clinic_id FROM staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "audit_insert_own" ON audit_log
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "audit_read_own"   ON audit_log
  FOR SELECT USING (user_id = auth.uid());

-- ── UPDATED_AT TRIGGERS ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clinics_updated_at   BEFORE UPDATE ON clinics        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patients_updated_at  BEFORE UPDATE ON patients       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_goals_updated_at     BEFORE UPDATE ON goals          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sessions_updated_at  BEFORE UPDATE ON sessions       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_notes_updated_at     BEFORE UPDATE ON session_notes  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── INDEXES (performance) ────────────────────────────────────
CREATE INDEX idx_patients_clinic    ON patients(clinic_id);
CREATE INDEX idx_patients_status    ON patients(status);
CREATE INDEX idx_sessions_clinic    ON sessions(clinic_id);
CREATE INDEX idx_sessions_patient   ON sessions(patient_id);
CREATE INDEX idx_sessions_scheduled ON sessions(scheduled_start);
CREATE INDEX idx_goals_patient      ON goals(patient_id);
CREATE INDEX idx_notes_session      ON session_notes(session_id);
CREATE INDEX idx_audit_clinic       ON audit_log(clinic_id);
CREATE INDEX idx_audit_created      ON audit_log(created_at);
