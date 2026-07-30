/**
 * Kept in sync with db/schema.sql. Inlined (rather than read from disk at
 * runtime) so the migration endpoint doesn't depend on Vercel's file tracing
 * bundling a non-imported file into the serverless function.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  arm TEXT NOT NULL CHECK (arm IN ('control', 'mirror')),
  rng_seed TEXT NOT NULL,
  consent_at TIMESTAMPTZ,
  attention_check_attempts INT NOT NULL DEFAULT 0,
  attention_check_passed BOOLEAN,
  literacy_score INT,
  ipo_experience BOOLEAN,
  age_band TEXT,
  gmp_recall_answer TEXT,
  demand_guess_text TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  paid_bonus BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS participant_rounds (
  id UUID PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  company_id TEXT NOT NULL,
  fundamental_score INT NOT NULL,
  assigned_gmp_pct NUMERIC NOT NULL,
  fair_value_estimate NUMERIC,
  fair_value_time_ms INT,
  preliminary_allocation NUMERIC,
  mirror_expanded BOOLEAN,
  final_allocation NUMERIC,
  decision_time_ms INT,
  listing_price NUMERIC NOT NULL,
  terminal_price NUMERIC NOT NULL,
  round_earnings NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (participant_id, round_number)
);

CREATE TABLE IF NOT EXISTS screen_events (
  id UUID PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  screen_name TEXT NOT NULL,
  entered_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participant_rounds_participant ON participant_rounds(participant_id);
CREATE INDEX IF NOT EXISTS idx_screen_events_participant ON screen_events(participant_id);
`;
