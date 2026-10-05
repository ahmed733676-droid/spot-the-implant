import { differentiate, scoreCatalog } from "@/lib/pipeline/differential";
import { extractEvidence, observationForNotes } from "@/lib/pipeline/extract";
import { WEIGHTS } from "@/lib/pipeline/graph";
import type { RankResult } from "@/lib/pipeline/types";
import { notesFor } from "@/lib/literature";
import { getSystem, SYSTEMS } from "@/lib/systems";
import type { ImplantSystem, Observation } from "@/lib/types";
import type { VisionCue } from "@/lib/vision";

export type { FeatureNote, RankedBrand, RankedSystem, RankResult } from "@/lib/pipeline/types";
export { WEIGHTS };

export const CONFIDENCE_CAP = 0.92;

/**
 * Public entry to the identify pipeline.
 *
 * 1. `extractEvidence` merges confirmed marks with image cues.
 * 2. `scoreEvidence` builds the feature graph.
 * 3. `differentiate` rolls companies, applies twin and refusal rules, and names a
 *    line only when that company's own lines actually separate.
 * Image cues are not a second opinion. They are soft evidence in the same graph.
 */
export function rankSystems(
  observation: Observation,
  systems: ImplantSystem[] = SYSTEMS,
  limit = 2,
  vision: readonly VisionCue[] = [],
): RankResult {
  const cues = extractEvidence(observation, vision);
  if (cues.length === 0) {
    return {
      brands: [],
      ranked: [],
      answered: 0,
      noEvidence: true,
      evidence: "none",
      flat: false,
      clusterNote: "Mark at least one radiographic cue. With nothing marked, every system is equally possible.",
      literature: [],
    };
  }

  const differential = differentiate({
    scored: scoreCatalog(systems, cues),
    cues,
    observation,
    limit,
  });

  const literature = notesFor({
    observation: observationForNotes(observation, cues),
    leaderCompany: differential.brands[0]?.company ?? null,
    companySettled: differential.brands[0]?.companySettled ?? false,
    runnerUp: differential.brands[1]?.company ?? null,
    runnerClose: Boolean(
      differential.brands[0] &&
        differential.brands[1] &&
        differential.brands[0].affinity - differential.brands[1].affinity < 0.08,
    ),
  });

  return { ...differential, literature };
}

export function canonicalObservation(system: ImplantSystem): Observation {
  return {
    collar: system.accepts.collar[0],
    connection: system.accepts.connection[0],
    body: system.accepts.body[0],
    thread: system.accepts.thread[0],
    apex: system.accepts.apex[0],
    platformSwitch: system.accepts.platformSwitch[0],
    lead: system.accepts.lead[0],
    microgap: system.accepts.microgap[0],
    geometry: "unknown",
  };
}

export function agreementPercent(confidence: number): number {
  return Math.min(92, Math.max(4, Math.round(confidence * 100)));
}

export function systemOrNull(id: string | null | undefined) {
  if (!id) return null;
  return getSystem(id) ?? null;
}
