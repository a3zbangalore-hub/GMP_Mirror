import { NextResponse } from "next/server";
import { getParticipantIdFromCookies } from "@/lib/session";
import { getParticipant, updateParticipantFields, insertScreenEvent } from "@/lib/db/queries";
import { ATTENTION_ITEMS } from "@/config/experiment";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 2;

export async function POST(req: Request) {
  const id = await getParticipantIdFromCookies();
  if (!id) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const participant = await getParticipant(id);
  if (!participant) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const answers: number[] = Array.isArray(body?.answers) ? body.answers : [];

  const allCorrect =
    answers.length === ATTENTION_ITEMS.length &&
    ATTENTION_ITEMS.every((item, i) => answers[i] === item.correctIndex);

  const attempts = participant.attention_check_attempts + 1;
  const finalized = allCorrect || attempts >= MAX_ATTEMPTS;

  await updateParticipantFields(id, {
    attention_check_attempts: attempts,
    ...(finalized ? { attention_check_passed: allCorrect } : {}),
  });
  await insertScreenEvent(id, "attention_check", { answers, allCorrect, attempts });

  return NextResponse.json({
    passed: allCorrect,
    finalized,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - attempts),
  });
}
