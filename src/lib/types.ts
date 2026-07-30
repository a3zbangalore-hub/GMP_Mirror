import { Arm } from "@/config/experiment";
import { PublicStimulus } from "@/lib/publicView";

export interface RoundApiResponse {
  roundNumber: number;
  arm: Arm;
  budget: number;
  stimulus: PublicStimulus;
  assignedGmp: number;
  fairValueEstimate: number | null;
  preliminaryAllocation: number | null;
  finalAllocation: number | null;
}

export interface LedgerEntry {
  roundNumber: number;
  company: string;
  issuePrice: number;
  listingPrice: number;
  terminalPrice: number;
  finalAllocation: number;
  earnings: number;
}

export interface CompleteResponse {
  ledger: LedgerEntry[];
  totalEarnings: number;
}
