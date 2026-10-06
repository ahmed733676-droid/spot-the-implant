import { describe, expect, it } from "vitest";
import { getTwin, libraryTwins, TWINS } from "@/lib/twins/catalog";
import { matchShape, shapeRankNudge } from "@/lib/twins/match";
import { projectedProfile, radiusAt, renderDrr } from "@/lib/twins/project";

describe("parametric twins", () => {
  it("quotes the tissue-level neck and marks unknown pitch as estimated", () => {
    const tissue = getTwin("straumann-tl");
    expect(tissue?.collarHeight).toMatchObject({ value: 2.8, status: "catalog", unit: "mm" });
    expect(tissue?.pitch.status).toBe("estimated");
    expect(tissue?.pitch.range?.[0]).toBeLessThan(tissue?.pitch.value ?? 0);
    expect(tissue?.pitch.range?.[1]).toBeGreaterThan(tissue?.pitch.value ?? 0);
  });

  it("does not treat NobelReplace as a library system", () => {
    expect(getTwin("nobel-replace")?.libraryId).toBeNull();
    expect(libraryTwins().some((twin) => twin.id === "nobel-replace")).toBe(false);
    expect(TWINS.length).toBeGreaterThanOrEqual(12);
  });

  it("draws a deeper thread on AnyRidge than on a parallel tissue-level body", () => {
    const anyridge = getTwin("megagen-anyridge")!;
    const tissue = getTwin("straumann-tl")!;
    const pose = { lengthMm: 10, diameterMm: 4.5, mdDeg: 0, blDeg: 0, spinDeg: 0 };
    const vary = (spec: NonNullable<typeof anyridge>) => {
      const samples: number[] = [];
      for (let i = 0; i < 40; i++) samples.push(radiusAt(spec, pose, 3 + i * 0.15, 0));
      const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
      const variance = samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / samples.length;
      return variance;
    };
    expect(vary(anyridge)).toBeGreaterThan(vary(tissue) * 2);
  });

  it("matches a tilted knife-thread twin to MegaGen and not to a tulip", () => {
    const spec = getTwin("megagen-anyridge")!;
    const pose = { lengthMm: 10, diameterMm: 5, mdDeg: 20, blDeg: 0, spinDeg: 0 };
    const raster = renderDrr(spec, pose, { width: 140, height: 260 });
    const hits = matchShape(raster);
    expect(hits[0]?.libraryId).toBe("megagen-anyridge");
    expect(hits[0]?.pose.mdDeg).toBe(20);
    expect(hits[0]?.sentence).toMatch(/catalog approximation|Parametric approximation/i);
    expect(hits[0]?.score).toBeGreaterThan(hits.find((hit) => hit.libraryId === "straumann-tl")?.score ?? 1);
  });

  it("matches a tissue-level twin to Straumann Tissue Level", () => {
    const spec = getTwin("straumann-tl")!;
    const raster = renderDrr(spec, { lengthMm: 10, diameterMm: 4.1, mdDeg: 0, blDeg: 10, spinDeg: 0 }, { width: 140, height: 260 });
    const hits = matchShape(raster);
    expect(hits[0]?.libraryId).toBe("straumann-tl");
  });

  it("refuses a shape nudge when the top two silhouettes are tied", () => {
    const hits = matchShape(
      renderDrr(getTwin("nobel-parallel")!, { lengthMm: 10, diameterMm: 4.3, mdDeg: 0, blDeg: 0, spinDeg: 0 }, { width: 120, height: 220 }),
    );
    const tied = hits.map((hit) => ({ ...hit, score: 0.7 }));
    expect(shapeRankNudge("nobel-parallel", tied)).toBe(0);
    expect(projectedProfile(getTwin("ankylos")!, { lengthMm: 11, diameterMm: 4.5, mdDeg: 15, blDeg: 0, spinDeg: 0 }).widths.some((value) => value > 0)).toBe(true);
  });
});
