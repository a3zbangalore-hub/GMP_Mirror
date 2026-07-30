import { NextResponse } from "next/server";
import { getParticipantIdFromCookies } from "@/lib/session";
import { updateParticipantFields, insertScreenEvent } from "@/lib/db/queries";
import { LITERACY_ITEMS } from "@/config/experiment";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const id = await getParticipantIdFromCookies();
  if (!id) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const literacyAnswers: number[] = Array.isArray(body?.literacyAnswers) ? body.literacyAnswers : [];
  const ipoExperience: boolean = !!body?.ipoExperience;
  const ageBand: string = typeof body?.ageBand === "string" ? body.ageBand : "";

  const literacyScore = LITERACY_ITEMS.reduce(
    (acc, item, i) => acc + (literacyAnswers[i] === item.correctIndex ? 1 : 0),
    0
  );

  await updateParticipantFields(id, {
    literacy_score: literacyScore,
    ipo_experience: ipoExperience,
    age_band: ageBand,
  });
  await insertScreenEvent(id, "baseline", { literacyAnswers, ipoExperience, ageBand, literacyScore });

  return NextResponse.json({ literacyScore });
}
