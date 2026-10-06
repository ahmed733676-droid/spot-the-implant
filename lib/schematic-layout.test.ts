import { describe, expect, it } from "vitest";
import { buildOutline, VB_H } from "@/lib/silhouette";
import { annotationFrame, connectionBox } from "@/lib/schematic-layout";
import { SYSTEMS } from "@/lib/systems";

function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

describe("schematic callouts stay off the silhouette", () => {
  it.each(SYSTEMS.map((system) => [system.id, system] as const))("%s", (_id, system) => {
    const outline = buildOutline(system.schematic);
    const frame = annotationFrame(outline, true);
    const cx = 80;
    const seat = connectionBox(system.schematic.connection, cx, outline.topY);

    expect(frame.tag.y + frame.tag.h).toBeLessThan(frame.minY - 2);
    expect(frame.bone.x).toBeGreaterThan(frame.maxX + 4);
    expect(frame.bone.x + frame.bone.w).toBeLessThanOrEqual(frame.width - 4);
    expect(frame.tag.y).toBeGreaterThanOrEqual(0);
    expect(frame.bone.y + frame.bone.h).toBeLessThan(VB_H);
    expect(overlaps(frame.tag, frame.bone)).toBe(false);
    expect(overlaps(frame.tag, seat)).toBe(false);

    if (seat.internal) {
      expect(seat.y).toBeGreaterThanOrEqual(outline.topY);
      expect(seat.x).toBeGreaterThan(cx - 20);
      expect(seat.x + seat.w).toBeLessThan(cx + 20);
    } else {
      expect(seat.y + seat.h).toBe(outline.topY);
      expect(seat.y).toBeGreaterThan(frame.tag.y + frame.tag.h);
    }
  });
});
