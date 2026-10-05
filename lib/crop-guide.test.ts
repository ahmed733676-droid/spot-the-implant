import { describe, expect, it } from "vitest";
import { cropRead } from "@/lib/crop-guide";

describe("cropRead", () => {
  it("accepts a tall fixture box", () => {
    expect(cropRead({ w: 0.46, h: 0.84 }).tone).toBe("ready");
  });

  it("warns when a third of the fixture is probably outside", () => {
    expect(cropRead({ w: 0.3, h: 0.3 }).tone).toBe("short");
  });

  it("warns when the box is wide enough to include a neighbor", () => {
    expect(cropRead({ w: 0.84, h: 0.92 }).tone).toBe("wide");
  });
});
