import { NextResponse } from "next/server";
import { getParticipantIdFromCookies } from "@/lib/session";
import { updateParticipantFields, insertScreenEvent } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const id = await getParticipantIdFromCookies();
  if (!id) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const gmpRecallAnswer = typeof body?.gmpRecallAnswer === "string" ? body.gmpRecallAnswer : "";
  const demandGuessText = typeof body?.demandGuessText === "string" ? body.demandGuessText : "";

  await updateParticipantFields(id, {
    gmp_recall_answer: gmpRecallAnswer,
    demand_guess_text: demandGuessText,
  });
  await insertScreenEvent(id, "exit_survey", { gmpRecallAnswer, demandGuessText });

  return NextResponse.json({ ok: true });
}
