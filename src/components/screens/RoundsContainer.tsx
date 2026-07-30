"use client";

import { useCallback, useEffect, useState } from "react";
import { Arm, N_ROUNDS } from "@/config/experiment";
import { RoundApiResponse } from "@/lib/types";
import { IpoRoundScreen } from "@/components/screens/IpoRoundScreen";
import { Card } from "@/components/ui/Primitives";

export function RoundsContainer({
  arm,
  onAllDone,
  startRound = 1,
}: {
  arm: Arm;
  onAllDone: () => void;
  startRound?: number;
}) {
  const [roundNumber, setRoundNumber] = useState(startRound);
  const [data, setData] = useState<RoundApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (n: number) => {
    setLoading(true);
    const res = await fetch(`/api/session/rounds/${n}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(roundNumber);
  }, [roundNumber, load]);

  async function submitEstimate(fairValue: number, prelim: number, timeMs: number) {
    await fetch(`/api/session/rounds/${roundNumber}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "estimate", fairValueEstimate: fairValue, preliminaryAllocation: prelim, fairValueTimeMs: timeMs }),
    });
  }

  async function submitFinal(final: number, mirrorExpanded: boolean, timeMs: number) {
    await fetch(`/api/session/rounds/${roundNumber}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "final", finalAllocation: final, mirrorExpanded, decisionTimeMs: timeMs }),
    });
  }

  function advance() {
    if (roundNumber >= N_ROUNDS) {
      onAllDone();
    } else {
      setRoundNumber((n) => n + 1);
    }
  }

  if (loading || !data) {
    return (
      <Card>
        <p className="text-slate-500">Loading next round…</p>
      </Card>
    );
  }

  return (
    <IpoRoundScreen
      key={roundNumber}
      stimulus={data.stimulus}
      assignedGmp={data.assignedGmp}
      budget={data.budget}
      arm={arm}
      roundNumber={roundNumber}
      totalRounds={N_ROUNDS}
      onSubmitEstimate={submitEstimate}
      onSubmitFinal={submitFinal}
      onAdvance={advance}
    />
  );
}
