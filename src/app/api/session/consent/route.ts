import { NextResponse } from "next/server";
import { getParticipantIdFromCookies } from "@/lib/session";
import { updateParticipantFields, insertScreenEvent } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const id = await getParticipantIdFromCookies();
  if (!id) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const now = new Date();
  await updateParticipantFields(id, { consent_at: now });
  await insertScreenEvent(id, "consent", { consented: true }, body.enteredAt, now.toISOString());

  return NextResponse.json({ ok: true });
}
