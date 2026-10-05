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

  it("reads knife threads on a notched fixture beside a smooth bright tooth", () => {
    const width = 180;
    const height = 320;
    const data = new Uint8ClampedArray(width * height * 4);
    const set = (x: number, y: number, value: number) => {
      const pixel = (y * width + x) * 4;
      data[pixel] = value;
      data[pixel + 1] = value;
      data[pixel + 2] = value;
      data[pixel + 3] = 255;
    };
    for (let y = 40; y < 210; y++) {
      for (let x = 118; x < 170; x++) set(x, y, 236);
    }
    for (let y = 28; y < 292; y++) {
      const phase = (y - 28) % 18;
      const blade = phase < 9 ? phase / 9 : (18 - phase) / 9;
      const half = 6 + blade * 16;
      for (let x = Math.round(46 - half); x <= Math.round(46 + half); x++) set(x, y, 248);
    }
    const report = analyzeRaster({ width, height, data }, "bright");
    expect(report.cues.find((item) => item.feature === "thread")?.value).toBe("knife");
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
