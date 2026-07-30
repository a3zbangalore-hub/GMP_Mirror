"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="mb-6 w-full">
      <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
        <span>Round {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function RupeeInput({
  value,
  onChange,
  max,
  min = 0,
  id,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  min?: number;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 focus-within:border-emerald-600">
      <span className="text-lg font-semibold text-slate-500">₹</span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={50}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(Number.isFinite(v) ? v : 0);
        }}
        className="w-full bg-transparent text-lg font-semibold text-slate-900 outline-none"
      />
    </div>
  );
}

export function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}
