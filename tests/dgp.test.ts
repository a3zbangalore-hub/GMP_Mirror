import { describe, it, expect } from "vitest";
import { fairValue, terminalPrice, listingPrice, IPO_STIMULI, GMP_LEVELS, N_ROUNDS } from "@/config/experiment";
import { planSession } from "@/lib/randomization";

describe("DGP math (spec Part 7)", () => {
  it("fair value formula matches spec worked examples", () => {
    // Meghdoot (F=80): V = 430*(0.7+0.6*0.8) = 430*1.18 = 507.4
    expect(fairValue(430, 80)).toBeCloseTo(507.4, 4);
    // Bharat AgriTech (F=48): V = 240*(0.7+0.6*0.48) = 240*0.988 = 237.12
    expect(fairValue(240, 48)).toBeCloseTo(237.12, 4);
    // Vahan (F=30): V = 75*(0.7+0.6*0.3) = 75*0.88 = 66
    expect(fairValue(75, 30)).toBeCloseTo(66, 4);
  });

  it("terminal price never depends on GMP", () => {
    // T = V + noise; g is not a parameter of terminalPrice at all.
    const v = fairValue(430, 80);
    expect(terminalPrice(v, 0)).toBe(v);
    expect(terminalPrice.length).toBe(2); // (v, noise) only — no gmp param
  });

  it("listing price scales with GMP as the pop, independent of F beyond issue price", () => {
    expect(listingPrice(430, 0.2, 0)).toBeCloseTo(516, 4);
    expect(listingPrice(75, 0.45, 0)).toBeCloseTo(108.75, 4);
  });
});

describe("Randomization (spec Part 3)", () => {
  it("is fully reproducible given the same seed", () => {
    const a = planSession("fixed-seed-123");
    const b = planSession("fixed-seed-123");
    expect(a.arm).toBe(b.arm);
    expect(a.rounds.map((r) => r.stimulus.id)).toEqual(b.rounds.map((r) => r.stimulus.id));
    expect(a.rounds.map((r) => r.assignedGmp)).toEqual(b.rounds.map((r) => r.assignedGmp));
    expect(a.rounds.map((r) => r.terminalPrice)).toEqual(b.rounds.map((r) => r.terminalPrice));
  });

  it("assigns exactly the 12 locked stimuli, each exactly once", () => {
    const plan = planSession("seed-a");
    const ids = plan.rounds.map((r) => r.stimulus.id).sort();
    const expected = IPO_STIMULI.map((s) => s.id).sort();
    expect(ids).toEqual(expected);
    expect(plan.rounds.length).toBe(N_ROUNDS);
  });

  it("assigns each GMP level exactly 3 times, independent of fundamentals", () => {
    const plan = planSession("seed-b");
    const counts: Record<string, number> = {};
    for (const level of GMP_LEVELS) counts[level] = 0;
    for (const r of plan.rounds) counts[r.assignedGmp] += 1;
    for (const level of GMP_LEVELS) expect(counts[level]).toBe(3);
  });

  it("GMP assignment is independent of fundamentals across many seeds (orthogonality)", () => {
    // Correlate assigned GMP with fundamental score across many simulated participants;
    // by construction (independent shuffles) this should be ~0.
    const n = 300;
    const gmps: number[] = [];
    const funds: number[] = [];
    for (let i = 0; i < n; i++) {
      const plan = planSession(`orthogonality-seed-${i}`);
      for (const r of plan.rounds) {
        gmps.push(r.assignedGmp);
        funds.push(r.stimulus.fundamentalScore);
      }
    }
    expect(Math.abs(correlation(gmps, funds))).toBeLessThan(0.05);
  });

  it("produces a plausible 50/50 arm split across many seeds", () => {
    const n = 500;
    let mirror = 0;
    for (let i = 0; i < n; i++) {
      const plan = planSession(`arm-seed-${i}`);
      if (plan.arm === "mirror") mirror++;
    }
    const frac = mirror / n;
    expect(frac).toBeGreaterThan(0.4);
    expect(frac).toBeLessThan(0.6);
  });
});

function correlation(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return num / Math.sqrt(dx * dy);
}
