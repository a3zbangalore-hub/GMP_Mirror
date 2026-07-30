import { randomUUID } from "crypto";
import { query } from "@/lib/db/client";
import { Arm } from "@/config/experiment";
import { SessionPlan } from "@/lib/randomization";

export interface ParticipantRow {
  id: string;
  created_at: string;
  arm: Arm;
  rng_seed: string;
  consent_at: string | null;
  attention_check_attempts: number;
  attention_check_passed: boolean | null;
  literacy_score: number | null;
  ipo_experience: boolean | null;
  age_band: string | null;
  gmp_recall_answer: string | null;
  demand_guess_text: string | null;
  status: "in_progress" | "completed" | "abandoned";
  paid_bonus: boolean;
  completed_at: string | null;
}

export interface ParticipantRoundRow {
  id: string;
  participant_id: string;
  round_number: number;
  company_id: string;
  fundamental_score: number;
  assigned_gmp_pct: string;
  fair_value_estimate: string | null;
  fair_value_time_ms: number | null;
  preliminary_allocation: string | null;
  mirror_expanded: boolean | null;
  final_allocation: string | null;
  decision_time_ms: number | null;
  listing_price: string;
  terminal_price: string;
  round_earnings: string | null;
}

export async function createParticipantFromPlan(plan: SessionPlan): Promise<void> {
  const pool = (await import("@/lib/db/client")).getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO participants (id, arm, rng_seed) VALUES ($1, $2, $3)`,
      [plan.participantId, plan.arm, plan.seed]
    );
    for (const r of plan.rounds) {
      await client.query(
        `INSERT INTO participant_rounds
          (id, participant_id, round_number, company_id, fundamental_score, assigned_gmp_pct, listing_price, terminal_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          randomUUID(),
          plan.participantId,
          r.roundNumber,
          r.stimulus.id,
          r.stimulus.fundamentalScore,
          r.assignedGmp,
          r.listingPrice,
          r.terminalPrice,
        ]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function getParticipant(id: string): Promise<ParticipantRow | null> {
  const rows = await query<ParticipantRow>(`SELECT * FROM participants WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function getRounds(participantId: string): Promise<ParticipantRoundRow[]> {
  return query<ParticipantRoundRow>(
    `SELECT * FROM participant_rounds WHERE participant_id = $1 ORDER BY round_number ASC`,
    [participantId]
  );
}

export async function getRound(participantId: string, roundNumber: number): Promise<ParticipantRoundRow | null> {
  const rows = await query<ParticipantRoundRow>(
    `SELECT * FROM participant_rounds WHERE participant_id = $1 AND round_number = $2`,
    [participantId, roundNumber]
  );
  return rows[0] ?? null;
}

export async function updateParticipantFields(
  id: string,
  fields: Partial<{
    consent_at: Date;
    attention_check_attempts: number;
    attention_check_passed: boolean;
    literacy_score: number;
    ipo_experience: boolean;
    age_band: string;
    gmp_recall_answer: string;
    demand_guess_text: string;
    status: string;
    completed_at: Date;
  }>
): Promise<void> {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;
  const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values = keys.map((k) => (fields as Record<string, unknown>)[k]);
  await query(`UPDATE participants SET ${setClauses} WHERE id = $1`, [id, ...values]);
}

export async function upsertRoundEstimate(
  participantId: string,
  roundNumber: number,
  data: { fairValueEstimate: number; preliminaryAllocation: number; fairValueTimeMs: number }
): Promise<void> {
  await query(
    `UPDATE participant_rounds
     SET fair_value_estimate = $3, preliminary_allocation = $4, fair_value_time_ms = $5, updated_at = now()
     WHERE participant_id = $1 AND round_number = $2`,
    [participantId, roundNumber, data.fairValueEstimate, data.preliminaryAllocation, data.fairValueTimeMs]
  );
}

export async function upsertRoundFinal(
  participantId: string,
  roundNumber: number,
  data: { finalAllocation: number; decisionTimeMs: number; mirrorExpanded: boolean }
): Promise<void> {
  await query(
    `UPDATE participant_rounds
     SET final_allocation = $3, decision_time_ms = $4, mirror_expanded = $5, updated_at = now()
     WHERE participant_id = $1 AND round_number = $2`,
    [participantId, roundNumber, data.finalAllocation, data.decisionTimeMs, data.mirrorExpanded]
  );
}

export async function setRoundEarnings(participantId: string, roundNumber: number, earnings: number): Promise<void> {
  await query(
    `UPDATE participant_rounds SET round_earnings = $3, updated_at = now() WHERE participant_id = $1 AND round_number = $2`,
    [participantId, roundNumber, earnings]
  );
}

export async function insertScreenEvent(
  participantId: string,
  screenName: string,
  payload: unknown,
  enteredAt?: string,
  leftAt?: string
): Promise<void> {
  await query(
    `INSERT INTO screen_events (id, participant_id, screen_name, entered_at, left_at, payload)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [randomUUID(), participantId, screenName, enteredAt ?? null, leftAt ?? null, JSON.stringify(payload ?? {})]
  );
}

export async function getAllParticipants(): Promise<ParticipantRow[]> {
  return query<ParticipantRow>(`SELECT * FROM participants ORDER BY created_at ASC`);
}

export async function getAllRounds(): Promise<ParticipantRoundRow[]> {
  return query<ParticipantRoundRow>(`SELECT * FROM participant_rounds ORDER BY participant_id, round_number ASC`);
}
