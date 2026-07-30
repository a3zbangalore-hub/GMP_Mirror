"use client";

import { Card, PrimaryButton } from "@/components/ui/Primitives";

export function HowItWorks({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">How it works</h1>
      <p className="mb-4 text-slate-700">
        Each IPO opens at an <strong>issue price</strong>. You decide how much of your ₹10,000 for
        that IPO to apply for — the rest stays as cash.
      </p>
      <p className="mb-4 text-slate-700">
        You&apos;ll hold each allotment for <strong>60 days</strong> — your return is based on the
        price then, not the listing-day price. You&apos;ll see all results at the end.
      </p>
      <p className="mb-6 text-slate-700">There are 12 IPO rounds in total, each independent of the others.</p>
      <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
    </Card>
  );
}
