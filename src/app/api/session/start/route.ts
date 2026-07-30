import { NextResponse } from "next/server";
import { planSession } from "@/lib/randomization";
import { createParticipantFromPlan, getParticipant } from "@/lib/db/queries";
import { getParticipantIdFromCookies, setParticipantCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  // Resume: if a valid, unfinished session cookie already exists, reuse it.
  const existingId = await getParticipantIdFromCookies();
  if (existingId) {
    const existing = await getParticipant(existingId);
    if (existing) {
      return NextResponse.json({ participantId: existing.id, arm: existing.arm, resumed: true });
    }
  }

  const plan = planSession();
  await createParticipantFromPlan(plan);
  await setParticipantCookie(plan.participantId);

  return NextResponse.json({ participantId: plan.participantId, arm: plan.arm, resumed: false });
}
