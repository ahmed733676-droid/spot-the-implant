import { phraseFor } from "@/lib/labels";
import { DISTINCTIVE } from "@/lib/pipeline/extract";
import type { EvidenceCue, FeatureNote } from "@/lib/pipeline/types";
import type { FeatureKey, ImplantSystem } from "@/lib/types";

export const WEIGHTS: Record<FeatureKey, number> = {
  collar: 3.4,
  connection: 2.6,
  thread: 2.5,
  body: 1.7,
  apex: 1.6,
  platformSwitch: 1.2,
  lead: 1.1,
  microgap: 1.8,
};

const INTERNAL_FAMILY = new Set([
  "internal-hex",
  "internal-conical",
  "internal-octagon",
  "tube-in-tube",
]);

export type Scored = {
  system: ImplantSystem;
  /** Clamped 0–1. Confidence uses this so the 92 / 34 / 60 bands stay put. */
  affinity: number;
  /** Unclamped. Company order, twin gaps, and line separation use this so a clamp cannot hide a real split. */
  rankScore: number;
  signature: number;
  matches: FeatureNote[];
  contradictions: FeatureNote[];
  signatureNotes: string[];
};

function judge(
  feature: FeatureKey,
  observed: string,
  accepts: readonly string[],
): "match" | "weak" | "miss" {
  if (feature === "connection" && observed === "internal-unspecified") {
    return accepts.some((value) => INTERNAL_FAMILY.has(value)) ? "weak" : "miss";
  }
  return accepts.includes(observed) ? "match" : "miss";
}

function noteFor(cue: EvidenceCue, kind: FeatureNote["kind"]): FeatureNote {
  const value = cue.value as Parameters<typeof phraseFor>[1];
  return {
    feature: cue.feature,
    value: cue.value,
    label: phraseFor(cue.feature, value),
    phrase: phraseFor(cue.feature, value),
    kind,
    source: cue.source,
  };
}

/**
 * Layer 2 — feature evidence graph.
 * A confirmed match earns its full weight. A confirmed miss is a real contradiction.
 * A vision match on a distinctive value counts more than a generic vision match.
 * A vision miss is a small penalty, and it is named only when the cue is a
 * moderate distinctive reading (knife, tulip, and the rest of that set).
 */
export function scoreEvidence(system: ImplantSystem, cues: readonly EvidenceCue[]): Scored {
  let earned = 0;
  let possible = 0;
  const matches: FeatureNote[] = [];
  const contradictions: FeatureNote[] = [];

  for (const cue of cues) {
    const verdict = judge(cue.feature, cue.value, system.accepts[cue.feature]);
    const weight = WEIGHTS[cue.feature];
    const distinctive = DISTINCTIVE.has(cue.value);

    if (cue.source === "confirmed") {
      possible += weight;
      if (verdict === "match") {
        earned += weight;
        matches.push(noteFor(cue, "match"));
      } else if (verdict === "weak") {
        earned += weight * 0.42;
        matches.push(noteFor(cue, "weak"));
      } else {
        contradictions.push(noteFor(cue, "miss"));
      }
      continue;
    }

    const share = weight * cue.strength;
    if (verdict === "match" || verdict === "weak") {
      const power = verdict === "weak" ? 0.42 : distinctive ? 1 : 0.75;
      possible += share;
      earned += share * power;
      matches.push(noteFor(cue, verdict === "weak" ? "weak" : "match"));
    } else if (distinctive && cue.strength >= 0.62) {
      possible += share * 0.45;
      contradictions.push(noteFor(cue, "miss"));
    } else {
      possible += share * 0.15;
    }
  }

  let signature = 0;
  const signatureNotes: string[] = [];
  for (const rule of system.signatures) {
    const hit = rule.all.every((part) =>
      cues.some((cue) => cue.feature === part.feature && cue.value === part.value),
    );
    if (!hit) continue;
    signature += rule.boost;
    signatureNotes.push(rule.note);
  }

  const base = possible === 0 ? 0 : earned / possible;
  const rankScore = Math.max(0, base + signature / (possible + 6));
  const affinity = Math.min(1, rankScore);

  return { system, affinity, rankScore, signature, matches, contradictions, signatureNotes };
}
