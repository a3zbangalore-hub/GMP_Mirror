"use client";

import { Arm, PRACTICE_GMP, PRACTICE_STIMULUS, ROUND_BUDGET_INR } from "@/config/experiment";
import { toPublicStimulus } from "@/lib/publicView";
import { IpoRoundScreen } from "@/components/screens/IpoRoundScreen";
import { Card, PrimaryButton } from "@/components/ui/Primitives";
import { useState } from "react";

export function Practice({ arm, onDone }: { arm: Arm; onDone: () => void }) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <Card>
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Practice round</h1>
        <p className="mb-6 text-slate-700">
          Let&apos;s walk through one example together. This round doesn&apos;t count — nothing here
          affects your budget or bonus.
        </p>
        <PrimaryButton onClick={() => setStarted(true)}>Start practice</PrimaryButton>
      </Card>
    );
  }

  return (
    <IpoRoundScreen
      stimulus={toPublicStimulus(PRACTICE_STIMULUS)}
      assignedGmp={PRACTICE_GMP}
      budget={ROUND_BUDGET_INR}
      arm={arm}
      roundNumber={0}
      totalRounds={12}
      isPractice
      onSubmitEstimate={() => {}}
      onSubmitFinal={() => {}}
      onAdvance={onDone}
    />
  );
}
