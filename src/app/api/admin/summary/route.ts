import { NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { getAllParticipants, getAllRounds } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const participants = await getAllParticipants();
  const rounds = await getAllRounds();

  const byArm = { control: 0, mirror: 0 };
  const completedByArm = { control: 0, mirror: 0 };
  for (const p of participants) {
    byArm[p.arm] += 1;
    if (p.status === "completed") completedByArm[p.arm] += 1;
  }

  const attentionFailures = participants.filter((p) => p.attention_check_passed === false).length;

  return NextResponse.json({
    totalParticipants: participants.length,
    completedParticipants: participants.filter((p) => p.status === "completed").length,
    byArm,
    completedByArm,
    attentionFailures,
    totalRoundsLogged: rounds.length,
    roundsWithFinalAllocation: rounds.filter((r) => r.final_allocation !== null).length,
  });
}
