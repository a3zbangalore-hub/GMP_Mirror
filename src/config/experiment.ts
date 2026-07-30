/**
 * LOCKED experimental parameters — Personal GMP-Premium Mirror study.
 * Frozen per pre-registration (spec Parts 3, 6, 7, 8). Do not edit production
 * values after launch; any change invalidates the pre-registered design.
 */

export const ROUND_BUDGET_INR = 10_000;
export const HOLD_DAYS = 60;
export const N_ROUNDS = 12;

/** GMP levels (spec Part 3/6): assigned 3-per-level, randomized per participant, independent of fundamentals. */
export const GMP_LEVELS = [0, 0.2, 0.45, 0.7] as const;
export type GmpLevel = (typeof GMP_LEVELS)[number];

/** DGP noise std dev as a fraction of issue price (spec Part 7). */
export const NOISE_SD_FRACTION = 0.05;

/** Fair value function: V = P0 * (0.7 + 0.6 * F/100) (spec Part 7). */
export function fairValue(issuePrice: number, fundamentalScore: number): number {
  return issuePrice * (0.7 + 0.6 * (fundamentalScore / 100));
}

/** Listing (pop) price: L = P0 * (1+g) + noise (spec Part 7). Display-only, never drives payoff. */
export function listingPrice(issuePrice: number, gmp: number, noise: number): number {
  return issuePrice * (1 + gmp) + noise;
}

/** Terminal 60-day price: T = V + noise. GMP structurally never enters this. */
export function terminalPrice(v: number, noise: number): number {
  return v + noise;
}

export interface IpoStimulus {
  id: string;
  company: string;
  sector: string;
  issuePrice: number;
  issueSizeCr: number;
  revenueGrowthPct: number;
  ebitdaMarginPct: number;
  roePct: number;
  peRatio: number | null;
  industryPe: number;
  fundamentalScore: number;
}

/** The 12 locked IPO stimuli (spec Part 6). Order here is canonical; presentation order is randomized per participant. */
export const IPO_STIMULI: readonly IpoStimulus[] = [
  { id: "meghdoot", company: "Meghdoot Pharma", sector: "Pharma", issuePrice: 430, issueSizeCr: 1900, revenueGrowthPct: 22, ebitdaMarginPct: 26, roePct: 20, peRatio: 34, industryPe: 38, fundamentalScore: 80 },
  { id: "rudra", company: "Rudra Power", sector: "Renewables", issuePrice: 165, issueSizeCr: 1300, revenueGrowthPct: 28, ebitdaMarginPct: 24, roePct: 16, peRatio: 32, industryPe: 30, fundamentalScore: 72 },
  { id: "ananta", company: "Ananta Chemicals", sector: "Chemicals", issuePrice: 210, issueSizeCr: 950, revenueGrowthPct: 14, ebitdaMarginPct: 21, roePct: 18, peRatio: 26, industryPe: 28, fundamentalScore: 70 },
  { id: "kaveri", company: "Kaveri Consumer", sector: "FMCG", issuePrice: 255, issueSizeCr: 1200, revenueGrowthPct: 12, ebitdaMarginPct: 18, roePct: 22, peRatio: 55, industryPe: 45, fundamentalScore: 58 },
  { id: "suryodaya", company: "Suryodaya Logistics", sector: "Logistics", issuePrice: 110, issueSizeCr: 850, revenueGrowthPct: 16, ebitdaMarginPct: 12, roePct: 14, peRatio: 28, industryPe: 26, fundamentalScore: 55 },
  { id: "prayag", company: "Prayag Retail", sector: "Retail", issuePrice: 320, issueSizeCr: 1600, revenueGrowthPct: 20, ebitdaMarginPct: 9, roePct: 13, peRatio: 48, industryPe: 40, fundamentalScore: 52 },
  { id: "sahyadri", company: "Sahyadri Steel", sector: "Steel", issuePrice: 95, issueSizeCr: 700, revenueGrowthPct: 6, ebitdaMarginPct: 11, roePct: 9, peRatio: 12, industryPe: 15, fundamentalScore: 50 },
  { id: "bharat", company: "Bharat AgriTech", sector: "Agritech", issuePrice: 240, issueSizeCr: 1100, revenueGrowthPct: 30, ebitdaMarginPct: 14, roePct: 12, peRatio: 42, industryPe: 33, fundamentalScore: 48 },
  { id: "trinetra", company: "Trinetra Cements", sector: "Cement", issuePrice: 185, issueSizeCr: 1050, revenueGrowthPct: 8, ebitdaMarginPct: 15, roePct: 11, peRatio: 24, industryPe: 22, fundamentalScore: 45 },
  { id: "nimbus", company: "Nimbus Fintech", sector: "Fintech", issuePrice: 540, issueSizeCr: 2400, revenueGrowthPct: 38, ebitdaMarginPct: -5, roePct: -8, peRatio: null, industryPe: 40, fundamentalScore: 40 },
  { id: "indus", company: "Indus Textiles", sector: "Textiles", issuePrice: 88, issueSizeCr: 500, revenueGrowthPct: 5, ebitdaMarginPct: 8, roePct: 7, peRatio: 18, industryPe: 16, fundamentalScore: 35 },
  { id: "vahan", company: "Vahan Mobility", sector: "EV / Auto", issuePrice: 75, issueSizeCr: 600, revenueGrowthPct: 45, ebitdaMarginPct: -12, roePct: -15, peRatio: null, industryPe: 35, fundamentalScore: 30 },
] as const;

if (IPO_STIMULI.length !== N_ROUNDS) {
  throw new Error(`IPO_STIMULI must have exactly ${N_ROUNDS} entries, found ${IPO_STIMULI.length}`);
}

/** Unpaid practice round (Screen 5) — a fictitious company, never in the 12 scored stimuli. */
export const PRACTICE_STIMULUS: IpoStimulus = {
  id: "practice",
  company: "Ganga Foods (Practice)",
  sector: "Food & Beverage",
  issuePrice: 150,
  issueSizeCr: 800,
  revenueGrowthPct: 15,
  ebitdaMarginPct: 16,
  roePct: 15,
  peRatio: 25,
  industryPe: 24,
  fundamentalScore: 60,
};
export const PRACTICE_GMP = 0.25;

export const ARMS = ["control", "mirror"] as const;
export type Arm = (typeof ARMS)[number];

/** Financial literacy quiz (Screen 4), 3 items per spec. Correct index is 0-based. */
export const LITERACY_ITEMS = [
  {
    id: "interest",
    prompt:
      "Suppose you had ₹100 in a savings account earning 2% interest per year. After 5 years, how much would you have, assuming you left the money to grow?",
    options: ["More than ₹110", "Exactly ₹110", "Less than ₹110", "Not sure"],
    correctIndex: 0,
  },
  {
    id: "inflation",
    prompt:
      "Imagine the interest rate on your savings account is 1% per year and inflation is 2% per year. After 1 year, would you be able to buy more, less, or the same as today with the money in this account?",
    options: ["More", "Same", "Less", "Not sure"],
    correctIndex: 2,
  },
  {
    id: "diversification",
    prompt: "Buying a single company's stock usually provides a safer return than a stock mutual fund. True or false?",
    options: ["True", "False", "Not sure"],
    correctIndex: 1,
  },
] as const;

/** Screen 3 comprehension/attention checks. */
export const ATTENTION_ITEMS = [
  {
    id: "hold_period",
    prompt: "You hold each IPO allotment for how long before it is paid out?",
    options: ["Listing day only", "30 days", "60 days", "1 year"],
    correctIndex: 2,
  },
  {
    id: "payout_basis",
    prompt: "Your payout is based on the price on listing day, or the price after 60 days?",
    options: ["Listing day price", "Price after 60 days"],
    correctIndex: 1,
  },
] as const;
