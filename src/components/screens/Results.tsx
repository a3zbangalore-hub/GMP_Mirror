"use client";

import { useEffect, useState } from "react";
import { CompleteResponse } from "@/lib/types";
import { Card, PrimaryButton } from "@/components/ui/Primitives";

export function Results({ onNext }: { onNext: () => void }) {
  const [data, setData] = useState<CompleteResponse | null>(null);

  useEffect(() => {
    fetch("/api/session/complete", { method: "POST" })
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <Card>
        <p className="text-slate-500">Tallying your results…</p>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Your results</h1>
      <div className="mb-6 max-h-[420px] overflow-y-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2">Listed at</th>
              <th className="px-3 py-2">Settled (60d)</th>
              <th className="px-3 py-2">Applied</th>
              <th className="px-3 py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {data.ledger.map((row) => (
              <tr key={row.roundNumber} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-800">{row.company}</td>
                <td className="px-3 py-2">₹{row.listingPrice.toFixed(0)}</td>
                <td className="px-3 py-2">₹{row.terminalPrice.toFixed(0)}</td>
                <td className="px-3 py-2">₹{row.finalAllocation.toFixed(0)}</td>
                <td className={`px-3 py-2 font-semibold ${row.earnings >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {row.earnings >= 0 ? "+" : ""}₹{row.earnings.toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mb-6 text-lg font-semibold text-slate-900">
        Total: <span className={data.totalEarnings >= 0 ? "text-emerald-700" : "text-red-600"}>
          {data.totalEarnings >= 0 ? "+" : ""}₹{data.totalEarnings.toFixed(0)}
        </span>
      </p>
      <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
    </Card>
  );
}
