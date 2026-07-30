import { randomUUID } from "crypto";
import {
  ARMS,
  Arm,
  GMP_LEVELS,
  IPO_STIMULI,
  IpoStimulus,
  N_ROUNDS,
  NOISE_SD_FRACTION,
  fairValue,
  listingPrice,
  terminalPrice,
} from "@/config/experiment";
import { makeRng, randNormal, shuffle } from "@/lib/rng";

export interface PlannedRound {
  roundNumber: number; // 1..12, presentation order
  stimulus: IpoStimulus;
  assignedGmp: number;
  fairValueTrue: number; // V, ground truth used to build listing/terminal prices
  listingPrice: number; // L, revealed only at end
  terminalPrice: number; // T, revealed only at end (payoff basis)
}

export interface SessionPlan {
  participantId: string;
  seed: string;
  arm: Arm;
  rounds: PlannedRound[];
}

/**
 * Builds the full, reproducible session plan at session-start time:
 * arm assignment, GMP-level shuffle (3 per level, independent of fundamentals),
 * round order shuffle, and DGP outcomes (L, T). Everything derives from one
 * logged seed so the session can be replayed/audited exactly.
 */
export function planSession(seed?: string): SessionPlan {
  const participantId = randomUUID();
  const usedSeed = seed ?? randomUUID();
  const rng = makeRng(usedSeed);

  // Arm assignment: simple 50/50 coin flip off the seeded stream.
  const arm: Arm = rng() < 0.5 ? ARMS[0] : ARMS[1];

  // GMP assignment: 4 levels x 3 replicates = 12, shuffled independently of
  // fundamentals, then mapped 1:1 onto the (separately shuffled) stimulus order.
  const gmpAssignment = shuffle(
    GMP_LEVELS.flatMap((level) => [level, level, level]),
    rng
  );
  const stimulusOrder = shuffle(IPO_STIMULI, rng);

  const rounds: PlannedRound[] = stimulusOrder.map((stimulus, idx) => {
    const g = gmpAssignment[idx];
    const v = fairValue(stimulus.issuePrice, stimulus.fundamentalScore);
    const noiseL = randNormal(rng, 0, NOISE_SD_FRACTION * stimulus.issuePrice);
    const noiseT = randNormal(rng, 0, NOISE_SD_FRACTION * stimulus.issuePrice);
    return {
      roundNumber: idx + 1,
      stimulus,
      assignedGmp: g,
      fairValueTrue: v,
      listingPrice: listingPrice(stimulus.issuePrice, g, noiseL),
      terminalPrice: terminalPrice(v, noiseT),
    };
  });

  if (rounds.length !== N_ROUNDS) {
    throw new Error("Session plan round count mismatch");
  }

  return { participantId, seed: usedSeed, arm, rounds };
}
