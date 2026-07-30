"use client";

import { useState } from "react";
import { Card, PrimaryButton } from "@/components/ui/Primitives";

export function Welcome({ onConsent }: { onConsent: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <Card>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Welcome to the IPO Investing Study</h1>
      <p className="mb-4 text-slate-700">
        You&apos;re going to apply to a series of upcoming IPOs using a virtual budget. Some will do
        well, some won&apos;t. How much you earn depends on the calls you make — and a few
        participants, chosen at random, will be paid a real cash bonus based on their results.
      </p>
      <p className="mb-6 text-slate-700">
        Participation is voluntary, takes about 15&ndash;20 minutes, and no personally identifying
        information is collected. You may stop at any time.
      </p>
      <label className="mb-6 flex cursor-pointer items-start gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <span>I am 18 years or older, understand the above, and agree to participate.</span>
      </label>
      <PrimaryButton disabled={!checked} onClick={onConsent}>
        Begin
      </PrimaryButton>
    </Card>
  );
}
