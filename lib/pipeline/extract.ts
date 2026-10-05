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
export function extractEvidence(observation: Observation, vision: readonly VisionCue[] = []): EvidenceCue[] {
  const cues: EvidenceCue[] = [];
  const confirmed = new Set<FeatureKey>();

  for (const feature of FEATURE_KEYS) {
    const value = observation[feature];
    if (value === "unknown") continue;
    confirmed.add(feature);
    cues.push({ feature, value, source: "confirmed", strength: 1 });
  }

  for (const cue of vision) {
    if (!VISION_FEATURES.has(cue.feature)) continue;
    if (confirmed.has(cue.feature)) continue;
    if (!cue.value || cue.value === "unknown") continue;
    cues.push({
      feature: cue.feature,
      value: cue.value,
      source: "vision",
      strength: cue.strength === "moderate" ? 0.62 : 0.4,
    });
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

export function hardCount(cues: readonly EvidenceCue[]): number {
  return cues.filter((cue) => cue.source === "confirmed").length;
}

export function hasDistinctive(cues: readonly EvidenceCue[], source?: EvidenceCue["source"]): boolean {
  return cues.some(
    (cue) => DISTINCTIVE.has(cue.value) && (source == null || cue.source === source),
  );
}
