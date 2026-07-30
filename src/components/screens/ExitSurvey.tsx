"use client";

import { useEffect, useState } from "react";
import { RoundApiResponse } from "@/lib/types";
import { Card, PrimaryButton } from "@/components/ui/Primitives";

export function ExitSurvey({ onDone }: { onDone: () => Promise<void> | void }) {
  const [probe, setProbe] = useState<RoundApiResponse | null>(null);
  const [recall, setRecall] = useState(0);
  const [demandGuess, setDemandGuess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/session/rounds/1")
      .then((r) => r.json())
      .then(setProbe);
  }, []);

  async function submit() {
    setSubmitting(true);
    await fetch("/api/session/exit-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gmpRecallAnswer: String(recall), demandGuessText: demandGuess }),
    });
    setSubmitting(false);
    await onDone();
  }

  return (
    <Card>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Two quick questions</h1>
      <p className="mb-2 font-medium text-slate-800">
        Roughly, what was the grey-market premium on {probe?.stimulus.company ?? "the first IPO you saw"}?
      </p>
      <div className="mb-6 max-w-xs">
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 focus-within:border-emerald-600">
          <input
            type="number"
            inputMode="numeric"
            value={recall}
            min={0}
            max={100}
            onChange={(e) => setRecall(Number(e.target.value) || 0)}
            className="w-full bg-transparent text-lg font-semibold text-slate-900 outline-none"
          />
          <span className="text-lg font-semibold text-slate-500">%</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">Enter your best guess as a percent, e.g. 33</p>
      </div>
      <p className="mb-2 font-medium text-slate-800">In a sentence, what do you think this study was about?</p>
      <textarea
        className="mb-6 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-emerald-600"
        rows={3}
        value={demandGuess}
        onChange={(e) => setDemandGuess(e.target.value)}
      />
      <PrimaryButton onClick={submit} disabled={submitting}>
        Continue
      </PrimaryButton>
    </Card>
  );
}
