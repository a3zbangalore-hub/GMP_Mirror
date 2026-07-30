import { NextResponse } from "next/server";
import { getParticipantIdFromCookies } from "@/lib/session";
import { insertScreenEvent } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

/** Generic timing/audit logger for non-scored screens (how-it-works, practice, etc). */
export async function POST(req: Request) {
  const id = await getParticipantIdFromCookies();
  if (!id) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { screenName, enteredAt, leftAt, payload } = body ?? {};
  if (!screenName || typeof screenName !== "string") {
    return NextResponse.json({ error: "screenName required" }, { status: 400 });
  }

  await insertScreenEvent(id, screenName, payload ?? {}, enteredAt, leftAt);
  return NextResponse.json({ ok: true });
}
