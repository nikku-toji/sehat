-- Sehat — Postgres / Aurora Serverless v2 schema (Phase 1)
-- Health data is "sensitive personal data" under India's DPDP Act 2023.
-- Encrypt at rest (KMS), restrict access (least-privilege IAM), audit (CloudTrail).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id            TEXT PRIMARY KEY,              -- Cognito sub in prod
  email         TEXT UNIQUE NOT NULL,
  tier          TEXT NOT NULL DEFAULT 'free',  -- free | plus
  age           INT,
  sex           TEXT CHECK (sex IN ('male','female','other')),
  weight_kg     NUMERIC(5,1),
  goals         JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Family members, including deceased, for hereditary-risk reasoning.
CREATE TABLE family_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relation      TEXT NOT NULL,                 -- mother | father | sibling ...
  living        BOOLEAN NOT NULL DEFAULT true,
  cause_of_death TEXT,
  conditions    JSONB DEFAULT '[]',            -- ["type 2 diabetes","hypertension"]
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject       TEXT NOT NULL DEFAULT 'self',  -- self | family_member uuid
  storage_key   TEXT NOT NULL,                 -- S3 key (KMS-encrypted object)
  health_score  INT,
  score_band    TEXT,
  markers       JSONB NOT NULL DEFAULT '[]',   -- classified markers snapshot
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id     UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan          JSONB NOT NULL,                -- diet/activity/sleep/hydration/retest
  insights      JSONB NOT NULL DEFAULT '[]',
  hereditary    JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Free-trial accounting: 3 full analyses within a 7-day window.
CREATE TABLE trial_usage (
  user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  analyses_used INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_reports_user ON reports(user_id, created_at DESC);
CREATE INDEX idx_plans_user ON plans(user_id, created_at DESC);
