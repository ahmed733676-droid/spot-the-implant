import type { VisionCue } from "@/lib/vision";
import { FEATURE_KEYS, type FeatureKey, type Observation } from "@/lib/types";
import type { EvidenceCue } from "@/lib/pipeline/types";

export type { EvidenceCue };

/**
 * Values that can separate a company on a periapical.
 * A generic value (mild taper, parallel body, bone-level collar) must not crown one.
 */
export const DISTINCTIVE = new Set([
  "tulip",
  "hyperbolic",
  "knife",
  "progressive",
  "microthread",
  "subcrestal",
  "subcrestal-conical",
  "tube-in-tube",
  "external-hex",
  "buttress",
]);

const VISION_FEATURES = new Set<FeatureKey>(["collar", "body", "thread", "apex"]);

/**
 * Layer 1 — radiographic cue extraction.
 * A confirmed mark is hard evidence and blocks the image cue for that feature.
 * An unmarked feature keeps the image cue as soft evidence. Vision never supplies
 * a connection or a junction line.
 */
/**
 * Features the dentist accepted from the image. They stay image evidence.
 * They are not clinician-confirmed and do not count toward the 3-cue rule.
 */
export function extractEvidence(
  observation: Observation,
  vision: readonly VisionCue[] = [],
  acceptedFromImage: Iterable<FeatureKey> = [],
): EvidenceCue[] {
  const cues: EvidenceCue[] = [];
  const confirmed = new Set<FeatureKey>();
  const accepted = new Set(acceptedFromImage);

  for (const feature of FEATURE_KEYS) {
    const value = observation[feature];
    if (value === "unknown") continue;
    if (accepted.has(feature)) continue;
    confirmed.add(feature);
    cues.push({ feature, value, source: "confirmed", strength: 1 });
  }

  for (const cue of vision) {
    if (!VISION_FEATURES.has(cue.feature)) continue;
    if (confirmed.has(cue.feature)) continue;
    if (!cue.value || cue.value === "unknown") continue;
    const used = accepted.has(cue.feature) && observation[cue.feature] === cue.value;
    cues.push({
      feature: cue.feature,
      value: used ? observation[cue.feature] : cue.value,
      source: used ? "accepted" : "vision",
      strength: used ? 0.8 : cue.strength === "moderate" ? 0.62 : 0.4,
    });
  }

  for (const feature of accepted) {
    if (!VISION_FEATURES.has(feature)) continue;
    if (cues.some((cue) => cue.feature === feature)) continue;
    const value = observation[feature];
    if (value === "unknown") continue;
    cues.push({ feature, value, source: "accepted", strength: 0.8 });
  }

  return cues;
}

/** Literature notes see the same cues the graph scored, including a soft image reading. */
export function observationForNotes(observation: Observation, cues: readonly EvidenceCue[]): Observation {
  const next: Observation = { ...observation };
  for (const cue of cues) {
    if (observation[cue.feature] !== "unknown") continue;
    (next as Record<FeatureKey, string>)[cue.feature] = cue.value;
  }
  return next;
}

/** Clinician-confirmed cues only. Accepted image readings do not count. */
export function hardCount(cues: readonly EvidenceCue[]): number {
  return cues.filter((cue) => cue.source === "confirmed").length;
}

export function hasDistinctive(cues: readonly EvidenceCue[], source?: EvidenceCue["source"]): boolean {
  return cues.some(
    (cue) => DISTINCTIVE.has(cue.value) && (source == null || cue.source === source),
  );
}
