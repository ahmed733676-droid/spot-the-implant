import { libraryTwins } from "@/lib/twins/catalog";
import { correlation, measureSilhouette, normalized, projectedProfile, resample } from "@/lib/twins/project";
import type { ShapeHit, TwinPose, TwinSpec } from "@/lib/twins/types";
import type { Raster } from "@/lib/silhouette";

const SAMPLES = 64;

const MD = [-20, -10, 0, 10, 20];
const BL = [0, 15];
const SPIN = [0, 90];

function posesFor(spec: TwinSpec): TwinPose[] {
  const length = spec.length.value;
  const diameter = spec.coronalDiameter.value;
  const lengths = [length * 0.8, length, length * 1.25];
  const diameters = [diameter * 0.9, diameter];
  const poses: TwinPose[] = [];
  for (const lengthMm of lengths) {
    for (const diameterMm of diameters) {
      for (const mdDeg of MD) {
        for (const blDeg of BL) {
          for (const spinDeg of SPIN) {
            poses.push({
              lengthMm: Math.round(lengthMm * 10) / 10,
              diameterMm: Math.round(diameterMm * 10) / 10,
              mdDeg,
              blDeg,
              spinDeg,
            });
          }
        }
      }
    }
  }
  return poses;
}

function scoreProfile(observed: { widths: number[]; centers: number[] }, spec: TwinSpec, pose: TwinPose): number {
  const projected = projectedProfile(spec, pose, SAMPLES);
  const left = normalized(resample(observed.widths, SAMPLES));
  const right = normalized(projected.widths);
  const highLeft = left.map((value, index) => value - (left[index - 1] ?? value));
  const highRight = right.map((value, index) => value - (right[index - 1] ?? value));
  const shape = correlation(left, right);
  const thread = correlation(normalized(highLeft), normalized(highRight));
  const centerMean = observed.centers.reduce((sum, value) => sum + value, 0) / Math.max(observed.centers.length, 1);
  const centerSd = Math.sqrt(
    observed.centers.reduce((sum, value) => sum + (value - centerMean) ** 2, 0) / Math.max(observed.centers.length, 1),
  );
  let lean = 0;
  if (centerSd > 1.5) {
    lean = correlation(normalized(resample(observed.centers, SAMPLES)), normalized(projected.centers));
  } else {
    const projMean = projected.centers.reduce((sum, value) => sum + value, 0) / projected.centers.length;
    const projSd = Math.sqrt(
      projected.centers.reduce((sum, value) => sum + (value - projMean) ** 2, 0) / projected.centers.length,
    );
    lean = projSd > 0.2 ? -0.35 : 0;
  }
  // A straight pose wins a tie. Bucco-lingual tilt is the least visible of the three angles.
  return shape * 0.58 + thread * 0.27 + lean * 0.15 - Math.abs(pose.blDeg) / 700 - Math.abs(pose.spinDeg) / 5000;
}

export function sentenceFor(spec: TwinSpec, pose: TwinPose, score: number): string {
  const percent = Math.round(clamp01(score) * 100);
  return `Shape match ${percent} for ${spec.name}. Closest pose ${pose.lengthMm} × ${pose.diameterMm} mm, ${pose.mdDeg}° in the film plane, ${pose.blDeg}° toward the beam, spun ${pose.spinDeg}°. ${spec.approximation}`;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, (value + 1) / 2));
}

/**
 * Score every library twin against a crop.
 * The number is a silhouette and thread-profile agreement, not a probability.
 */
export function matchShape(raster: Raster, specs: readonly TwinSpec[] = libraryTwins()): ShapeHit[] {
  const observed = measureSilhouette(raster);
  if (!observed) return [];
  const hits: ShapeHit[] = [];
  for (const spec of specs) {
    let best = -Infinity;
    let pose = posesFor(spec)[0];
    for (const candidate of posesFor(spec)) {
      const score = scoreProfile(observed, spec, candidate);
      if (score > best) {
        best = score;
        pose = candidate;
      }
    }
    const unit = clamp01(best);
    hits.push({
      systemId: spec.id,
      libraryId: spec.libraryId,
      name: spec.name,
      score: unit,
      pose,
      sentence: sentenceFor(spec, pose, best),
    });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits;
}

/**
 * Small rank nudge. A shape agreement cannot outweigh a cue the dentist confirmed.
 * The boost is zero unless this system is the best shape and clearly ahead of the next.
 */
export function shapeRankNudge(systemId: string, hits: readonly ShapeHit[]): number {
  const best = hits[0];
  const next = hits[1];
  if (!best || best.libraryId !== systemId) return 0;
  if (best.score < 0.62) return 0;
  if (next && best.score - next.score < 0.04) return 0;
  return Math.min(0.06, (best.score - 0.62) * 0.2);
}
