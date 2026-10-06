import type { FeatureKey } from "@/lib/types";
import type { ImplantSystem } from "@/lib/types";
import type { LiteratureNote } from "@/lib/literature";

export type EvidenceSource = "confirmed" | "vision" | "accepted";

/** One radiographic cue after the dentist's marks and the image measurement have been merged. */
export type EvidenceCue = {
  feature: FeatureKey;
  value: string;
  source: EvidenceSource;
  /** 1 for a clinician cue. An untouched image cue is about 0.4 or 0.62. An accepted image cue stays soft at 0.8. */
  strength: number;
};

export type FeatureNote = {
  feature: FeatureKey;
  value: string;
  label: string;
  phrase: string;
  kind: "match" | "weak" | "miss";
  source: EvidenceSource;
};

export type RankedSystem = {
  system: ImplantSystem;
  affinity: number;
  confidence: number;
  signature: number;
  matches: FeatureNote[];
  contradictions: FeatureNote[];
  why: string;
  whyNot: string[];
};

export type RankedBrand = {
  company: string;
  manufacturer: string | null;
  affinity: number;
  confidence: number;
  companySettled: boolean;
  lineSettled: boolean;
  systems: RankedSystem[];
  why: string;
  whyNot: string[];
};

export type RankResult = {
  brands: RankedBrand[];
  ranked: RankedSystem[];
  answered: number;
  noEvidence: boolean;
  evidence: "none" | "thin" | "partial" | "supported";
  /** True when the cues are generic and several companies tie. The list is not a winner. */
  flat: boolean;
  clusterNote: string | null;
  /**
   * Shown beside the top two when the library fit is weak or the closest names
   * both contradict cues the dentist confirmed. The short list stays on screen.
   */
  libraryUnsure: { reason: string } | null;
  literature: LiteratureNote[];
};
