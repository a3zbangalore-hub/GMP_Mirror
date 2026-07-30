import { IpoStimulus } from "@/config/experiment";

/**
 * The fundamental score F is an internal DGP/analysis construct
 * (spec Part 6) and must never be shown to participants — only the raw
 * fundamentals it was derived from.
 */
export type PublicStimulus = Omit<IpoStimulus, "fundamentalScore">;

export function toPublicStimulus(s: IpoStimulus): PublicStimulus {
  const { fundamentalScore: _fundamentalScore, ...rest } = s;
  return rest;
}
