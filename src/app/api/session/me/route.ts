import { NextResponse } from "next/server";
import { getParticipant, getRounds } from "@/lib/db/queries";
import { getParticipantIdFromCookies } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const id = await getParticipantIdFromCookies();
  if (!id) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const participant = await getParticipant(id);
  if (!participant) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const rounds = await getRounds(id);
  const roundProgress = rounds.map((r) => ({
    roundNumber: r.round_number,
    hasEstimate: r.fair_value_estimate !== null,
    hasFinal: r.final_allocation !== null,
  }));

  return NextResponse.json({
    participantId: participant.id,
    arm: participant.arm,
    status: participant.status,
    consentAt: participant.consent_at,
    attentionCheckPassed: participant.attention_check_passed,
    attentionCheckAttempts: participant.attention_check_attempts,
    literacyScore: participant.literacy_score,
    roundProgress,
  });
}
