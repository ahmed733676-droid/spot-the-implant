import type { Outline } from "@/lib/silhouette";
import { VB_W } from "@/lib/silhouette";
import type { SchematicProfile } from "@/lib/types";

/** Warm brass that reads on the film ground. Rust (#8f3d16) stays the paper accent. */
export const FILM_BRASS = "#e6c2a0";
export const BODY_FILL = "#f3eadc";
export const RUST = "#8f3d16";

export type Box = { x: number; y: number; w: number; h: number };

export function annotationFrame(outline: Outline, guides: boolean) {
  const maxX = Math.max(...outline.points.map((point) => point.x));
  const minY = Math.min(...outline.points.map((point) => point.y));
  const tag: Box = { x: 6, y: 5, w: 58, h: 12 };
  const bone: Box = { x: maxX + 10, y: outline.boneY - 4, w: 50, h: 10 };
  const width = guides ? Math.max(VB_W, bone.x + bone.w + 8) : VB_W;
  return { tag, bone, maxX, minY, width, boneY: outline.boneY };
}

export function connectionBox(connection: SchematicProfile["connection"], cx: number, top: number): Box & { internal: boolean } {
  if (connection === "ext-hex") {
    return { x: cx - 6, y: top - 8, w: 12, h: 8, internal: false };
  }
  if (connection === "subcrestal") {
    return { x: cx - 6, y: top + 8, w: 12, h: 28, internal: true };
  }
  if (connection === "tube") {
    return { x: cx - 5, y: top + 8, w: 10, h: 22, internal: true };
  }
  return { x: cx - 6, y: top + 8, w: 12, h: 16, internal: true };
}
