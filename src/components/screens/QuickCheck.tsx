"use client";

import { useState } from "react";
import { ATTENTION_ITEMS } from "@/config/experiment";
import { Card, PrimaryButton } from "@/components/ui/Primitives";

export function QuickCheck({ onDone }: { onDone: (result: { passed: boolean }) => Promise<void> | void }) {
  const [answers, setAnswers] = useState<number[]>(Array(ATTENTION_ITEMS.length).fill(-1));
  const [attempt, setAttempt] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (answers.some((a) => a === -1)) {
      setError("Please answer both questions.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/session/attention-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (data.finalized) {
      await onDone({ passed: data.passed });
    } else {
      setAttempt(2);
      setError("One of your answers wasn't right — take another look and try again.");
      setAnswers(Array(ATTENTION_ITEMS.length).fill(-1));
    }
  }

  return (
    <Card>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Quick check</h1>
      <p className="mb-6 text-sm text-slate-500">
        {attempt === 1 ? "Just to confirm you've got the rules." : "Let's try that again."}
      </p>
      <div className="space-y-6">
        {ATTENTION_ITEMS.map((item, qi) => (
          <div key={item.id}>
            <p className="mb-2 font-medium text-slate-800">{item.prompt}</p>
            <div className="space-y-2">
              {item.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2 text-sm text-slate-800 ${
                    answers[qi] === oi ? "border-emerald-600 bg-emerald-50" : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${qi}`}
                    checked={answers[qi] === oi}
                    onChange={() => setAnswers((prev) => prev.map((v, i) => (i === qi ? oi : v)))}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-amber-700">{error}</p>}
      <PrimaryButton className="mt-6" onClick={submit} disabled={submitting}>
        Submit
      </PrimaryButton>
    </Card>
  );
}
