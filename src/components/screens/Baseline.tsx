"use client";

import { useState } from "react";
import { LITERACY_ITEMS } from "@/config/experiment";
import { Card, PrimaryButton } from "@/components/ui/Primitives";

const AGE_BANDS = ["18-24", "25-34", "35-44", "45-54", "55+"];

export function Baseline({ onDone }: { onDone: () => Promise<void> | void }) {
  const [literacyAnswers, setLiteracyAnswers] = useState<number[]>(Array(LITERACY_ITEMS.length).fill(-1));
  const [ipoExperience, setIpoExperience] = useState<boolean | null>(null);
  const [ageBand, setAgeBand] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (literacyAnswers.some((a) => a === -1) || ipoExperience === null || !ageBand) {
      setError("Please answer every question.");
      return;
    }
    setError(null);
    setSubmitting(true);
    await fetch("/api/session/baseline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ literacyAnswers, ipoExperience, ageBand }),
    });
    setSubmitting(false);
    await onDone();
  }

  return (
    <Card>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">A few quick questions</h1>
      <p className="mb-6 text-sm text-slate-500">This helps us understand our participant group. It won&apos;t affect your budget.</p>
      <div className="space-y-6">
        {LITERACY_ITEMS.map((item, qi) => (
          <div key={item.id}>
            <p className="mb-2 font-medium text-slate-800">{item.prompt}</p>
            <div className="space-y-2">
              {item.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2 text-sm ${
                    literacyAnswers[qi] === oi ? "border-emerald-600 bg-emerald-50" : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`lit-${qi}`}
                    checked={literacyAnswers[qi] === oi}
                    onChange={() => setLiteracyAnswers((prev) => prev.map((v, i) => (i === qi ? oi : v)))}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 font-medium text-slate-800">Have you applied to an IPO before?</p>
          <div className="flex gap-3">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((o) => (
              <label
                key={o.label}
                className={`flex-1 cursor-pointer rounded-lg border px-4 py-2 text-center text-sm ${
                  ipoExperience === o.value ? "border-emerald-600 bg-emerald-50" : "border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="experience"
                  className="hidden"
                  checked={ipoExperience === o.value}
                  onChange={() => setIpoExperience(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-slate-800">Your age band</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {AGE_BANDS.map((band) => (
              <label
                key={band}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${
                  ageBand === band ? "border-emerald-600 bg-emerald-50" : "border-slate-200"
                }`}
              >
                <input type="radio" name="age" className="hidden" checked={ageBand === band} onChange={() => setAgeBand(band)} />
                {band}
              </label>
            ))}
          </div>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-amber-700">{error}</p>}
      <PrimaryButton className="mt-6" onClick={submit} disabled={submitting}>
        Continue
      </PrimaryButton>
    </Card>
  );
}
