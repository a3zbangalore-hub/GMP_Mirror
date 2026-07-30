"use client";

import { Card } from "@/components/ui/Primitives";

export function Debrief() {
  return (
    <Card>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Thank you</h1>
      <p className="mb-4 text-slate-700">
        In this game, the 60-day settlement price tracked each company&apos;s underlying fundamentals —
        the grey-market premium moved the listing-day pop, but not the 60-day price. Real-market
        evidence on Indian IPOs points the same way: GMP predicts the pop, not the longer-run outcome.
      </p>
      <p className="mb-4 text-slate-700">
        If you were selected for a cash bonus, you&apos;ll be contacted separately with details.
      </p>
      <p className="text-slate-700">Thank you for taking part in this study.</p>
    </Card>
  );
}
