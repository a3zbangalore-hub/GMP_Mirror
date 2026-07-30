import { NextResponse } from "next/server";
import { getParticipantIdFromCookies } from "@/lib/session";
import { getParticipant, getRounds, setRoundEarnings, updateParticipantFields } from "@/lib/db/queries";
import { IPO_STIMULI } from "@/config/experiment";

export const dynamic = "force-dynamic";

export async function POST() {
  const id = await getParticipantIdFromCookies();
  if (!id) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const participant = await getParticipant(id);
  if (!participant) return NextResponse.json({ error: "no_session" }, { status: 401 });

  const rounds = await getRounds(id);
  const incomplete = rounds.some((r) => r.final_allocation === null);
  if (incomplete) {
    return NextResponse.json({ error: "rounds_incomplete" }, { status: 400 });
  }

  const ledger = [];
  let totalEarnings = 0;

  for (const r of rounds) {
    const stimulus = IPO_STIMULI.find((s) => s.id === r.company_id)!;
    const allocation = Number(r.final_allocation);
    const terminal = Number(r.terminal_price);
    const earnings = allocation * ((terminal - stimulus.issuePrice) / stimulus.issuePrice);
    await setRoundEarnings(id, r.round_number, earnings);
    totalEarnings += earnings;

    ledger.push({
      roundNumber: r.round_number,
      company: stimulus.company,
      issuePrice: stimulus.issuePrice,
      listingPrice: Number(r.listing_price),
      terminalPrice: terminal,
      finalAllocation: allocation,
      earnings,
    });
  }

  if (participant.status !== "completed") {
    await updateParticipantFields(id, { status: "completed", completed_at: new Date() });
  }

  return NextResponse.json({ ledger, totalEarnings });
}
