"use client";

import { useMemo, useState } from "react";
import { Arm } from "@/config/experiment";
import { PublicStimulus } from "@/lib/publicView";
import { Card, PrimaryButton, ProgressBar, RupeeInput } from "@/components/ui/Primitives";

type Step = "fundamentals" | "estimate" | "reveal" | "final";

export function IpoRoundScreen({
  stimulus,
  assignedGmp,
  budget,
  arm,
  roundNumber,
  totalRounds,
  isPractice = false,
  onSubmitEstimate,
  onSubmitFinal,
  onAdvance,
}: {
  stimulus: PublicStimulus;
  assignedGmp: number;
  budget: number;
  arm: Arm;
  roundNumber: number;
  totalRounds: number;
  isPractice?: boolean;
  onSubmitEstimate: (fairValue: number, prelim: number, timeMs: number) => Promise<void> | void;
  onSubmitFinal: (final: number, mirrorExpanded: boolean, timeMs: number) => Promise<void> | void;
  onAdvance: () => void;
}) {
  const [step, setStep] = useState<Step>("fundamentals");
  const [estimateEnteredAt, setEstimateEnteredAt] = useState<number | null>(null);
  const [revealEnteredAt, setRevealEnteredAt] = useState<number | null>(null);

  const [fairValue, setFairValue] = useState(stimulus.issuePrice);
  const [preliminary, setPreliminary] = useState(Math.round(budget / 2));
  const [finalAllocation, setFinalAllocation] = useState(Math.round(budget / 2));
  const [mirrorExpanded, setMirrorExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const listingImplied = useMemo(() => stimulus.issuePrice * (1 + assignedGmp), [stimulus.issuePrice, assignedGmp]);
  const gap = useMemo(() => listingImplied - fairValue, [listingImplied, fairValue]);
  const gapPct = fairValue > 0 ? (gap / fairValue) * 100 : 0;

  async function goToEstimate() {
    setEstimateEnteredAt(Date.now());
    setStep("estimate");
  }

  async function submitEstimate() {
    setSubmitting(true);
    await onSubmitEstimate(fairValue, preliminary, Date.now() - (estimateEnteredAt ?? Date.now()));
    setFinalAllocation(preliminary);
    setSubmitting(false);
    setRevealEnteredAt(Date.now());
    setStep("reveal");
  }

  async function goToFinal() {
    setStep("final");
  }

  async function submitFinal() {
    setSubmitting(true);
    await onSubmitFinal(finalAllocation, mirrorExpanded, Date.now() - (revealEnteredAt ?? Date.now()));
    setSubmitting(false);
    onAdvance();
  }

  return (
    <div>
      {!isPractice ? (
        <ProgressBar current={roundNumber} total={totalRounds} />
      ) : (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-600">
          Practice round — not scored
        </p>
      )}

      <Card>
        {step === "fundamentals" && (
          <div>
            <h2 className="mb-1 text-xl font-bold text-slate-900">{stimulus.company}</h2>
            <p className="mb-5 text-sm text-slate-500">{stimulus.sector}</p>
            <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Fact label="Issue price" value={`₹${stimulus.issuePrice}`} />
              <Fact label="Issue size" value={`₹${stimulus.issueSizeCr.toLocaleString("en-IN")} cr`} />
              <Fact label="Revenue growth" value={`${stimulus.revenueGrowthPct}%`} />
              <Fact label="EBITDA margin" value={`${stimulus.ebitdaMarginPct}%`} />
              <Fact label="ROE" value={`${stimulus.roePct}%`} />
              <Fact
                label="P/E vs industry"
                value={stimulus.peRatio === null ? `n/a vs ${stimulus.industryPe}` : `${stimulus.peRatio} vs ${stimulus.industryPe}`}
              />
            </dl>
            <PrimaryButton onClick={goToEstimate}>Next</PrimaryButton>
          </div>
        )}

        {step === "estimate" && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Your read</h2>
            <label className="mb-2 block font-medium text-slate-800" htmlFor="fv">
              What do you think one share of {stimulus.company} is really worth?
            </label>
            <div className="mb-6">
              <RupeeInput id="fv" value={fairValue} onChange={setFairValue} max={stimulus.issuePrice * 3} />
            </div>
            <label className="mb-2 block font-medium text-slate-800">
              How much of your ₹{budget.toLocaleString("en-IN")} would you apply for?
            </label>
            <div className="mb-6">
              <RupeeInput value={preliminary} onChange={setPreliminary} max={budget} />
            </div>
            <PrimaryButton onClick={submitEstimate} disabled={submitting}>
              Continue
            </PrimaryButton>
          </div>
        )}

        {step === "reveal" && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Grey-market premium</h2>
            <p className="mb-4 text-lg text-slate-800">
              Grey-market premium: <strong>+{Math.round(assignedGmp * 100)}%</strong> (indicative listing ≈ ₹
              {listingImplied.toFixed(0)}).
            </p>
            {arm === "mirror" && (
              <div className="mb-4 rounded-xl bg-emerald-50 p-4 text-slate-800">
                <p>
                  You valued this share at <strong>₹{fairValue.toFixed(0)}</strong>.
                </p>
                <p>
                  At ₹{listingImplied.toFixed(0)}, that&apos;s{" "}
                  <strong>
                    ₹{Math.abs(gap).toFixed(0)} ({Math.abs(gapPct).toFixed(0)}%) {gap >= 0 ? "above" : "below"} the value you
                    just set.
                  </strong>
                </p>
              </div>
            )}
            <PrimaryButton
              onClick={() => {
                if (arm === "mirror") setMirrorExpanded(true);
                goToFinal();
              }}
            >
              Continue
            </PrimaryButton>
          </div>
        )}

        {step === "final" && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Confirm your decision</h2>
            <label className="mb-2 block font-medium text-slate-800">
              How much of your ₹{budget.toLocaleString("en-IN")} would you like to apply for?
            </label>
            <div className="mb-6">
              <RupeeInput value={finalAllocation} onChange={setFinalAllocation} max={budget} />
            </div>
            <PrimaryButton onClick={submitFinal} disabled={submitting}>
              Confirm
            </PrimaryButton>
          </div>
        )}
      </Card>

      {!isPractice && (
        <p className="mt-4 text-center text-xs text-slate-400">Fundamentals shown come from the issue prospectus.</p>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
