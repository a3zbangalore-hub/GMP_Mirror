import { NextResponse } from "next/server";
import { getParticipantIdFromCookies } from "@/lib/session";
import { getParticipant, getRound, upsertRoundEstimate, upsertRoundFinal } from "@/lib/db/queries";
import { IPO_STIMULI, ROUND_BUDGET_INR } from "@/config/experiment";
import { toPublicStimulus } from "@/lib/publicView";

export const dynamic = "force-dynamic";

async function resolveRoundNumber(params: Promise<{ n: string }>): Promise<number | null> {
  const { n } = await params;
  const num = Number(n);
  if (!Number.isInteger(num) || num < 1 || num > 12) return null;
  return num;
}

export async function GET(_req: Request, ctx: { params: Promise<{ n: string }> }) {
  const id = await getParticipantIdFromCookies();
  if (!id) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const participant = await getParticipant(id);
  if (!participant) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const roundNumber = await resolveRoundNumber(ctx.params);
  if (roundNumber === null) return NextResponse.json({ error: "invalid_round" }, { status: 400 });

  const round = await getRound(id, roundNumber);
  if (!round) return NextResponse.json({ error: "round_not_found" }, { status: 404 });

  const stimulus = IPO_STIMULI.find((s) => s.id === round.company_id);
  if (!stimulus) return NextResponse.json({ error: "stimulus_missing" }, { status: 500 });

  return NextResponse.json({
    roundNumber,
    arm: participant.arm,
    budget: ROUND_BUDGET_INR,
    stimulus: toPublicStimulus(stimulus),
    assignedGmp: Number(round.assigned_gmp_pct),
    fairValueEstimate: round.fair_value_estimate !== null ? Number(round.fair_value_estimate) : null,
    preliminaryAllocation: round.preliminary_allocation !== null ? Number(round.preliminary_allocation) : null,
    finalAllocation: round.final_allocation !== null ? Number(round.final_allocation) : null,
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ n: string }> }) {
  const id = await getParticipantIdFromCookies();
  if (!id) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const roundNumber = await resolveRoundNumber(ctx.params);
  if (roundNumber === null) return NextResponse.json({ error: "invalid_round" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const step = body?.step;

  if (step === "estimate") {
    const fairValueEstimate = Number(body?.fairValueEstimate);
    const preliminaryAllocation = clampAllocation(Number(body?.preliminaryAllocation));
    const fairValueTimeMs = Number(body?.fairValueTimeMs) || 0;
    if (!Number.isFinite(fairValueEstimate) || !Number.isFinite(preliminaryAllocation)) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    await upsertRoundEstimate(id, roundNumber, { fairValueEstimate, preliminaryAllocation, fairValueTimeMs });
    return NextResponse.json({ ok: true });
  }

  if (step === "final") {
    const finalAllocation = clampAllocation(Number(body?.finalAllocation));
    const decisionTimeMs = Number(body?.decisionTimeMs) || 0;
    const mirrorExpanded = !!body?.mirrorExpanded;
    if (!Number.isFinite(finalAllocation)) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    await upsertRoundFinal(id, roundNumber, { finalAllocation, decisionTimeMs, mirrorExpanded });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invalid_step" }, { status: 400 });
}

function clampAllocation(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(ROUND_BUDGET_INR, Math.max(0, v));
}
