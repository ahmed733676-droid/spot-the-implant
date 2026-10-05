import { describe, expect, it } from "vitest";
import { getSystem } from "@/lib/systems";
import { paintSchematic } from "@/lib/silhouette";
import { analyzeRaster } from "@/lib/vision";

function cue(profileId: string, feature: "collar" | "body" | "thread" | "apex") {
  const system = getSystem(profileId);
  if (!system) throw new Error(profileId);
  const report = analyzeRaster(paintSchematic(system.schematic, 220, 440));
  return report.cues.find((item) => item.feature === feature);
}

describe("analyzeRaster", () => {
  it("reads a tulip flare and a parallel body from the tissue-level schematic", () => {
    expect(cue("straumann-tl", "collar")?.value).toBe("tulip");
    expect(cue("straumann-tl", "body")?.value).toBe("parallel");
  });

  it("reads a convergent neck from the Prama schematic", () => {
    expect(cue("prama", "collar")?.value).toBe("hyperbolic");
  });

  it("reads a strong taper and a knife thread from AnyRidge", () => {
    expect(cue("megagen-anyridge", "body")?.value).toBe("strong-taper");
    expect(cue("megagen-anyridge", "thread")?.value).toBe("knife");
  });

  it("reads a fine thread from the Brånemark schematic", () => {
    expect(cue("nobel-branemark", "thread")?.value).toBe("fine");
    expect(cue("nobel-branemark", "collar")?.value).not.toBe("hyperbolic");
  });

  it("does not invent a connection", () => {
    const system = getSystem("ankylos");
    const report = analyzeRaster(paintSchematic(system!.schematic, 220, 440));
    expect(report.cues.some((item) => item.feature === ("connection" as "collar"))).toBe(false);
    expect(report.notes.join(" ")).toMatch(/Connection geometry is not inferred/);
  });

  it("asks for a polarity check when the crop is empty", () => {
    const raster = {
      width: 40,
      height: 40,
      data: new Uint8ClampedArray(40 * 40 * 4),
    };
    const report = analyzeRaster(raster, "bright");
    expect(report.cues).toHaveLength(0);
    expect(report.notes[0]).toMatch(/polarity|bright fixture/i);
  });
});
