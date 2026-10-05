import type { SchematicProfile } from "@/lib/types";

export const VB_W = 160;
export const VB_H = 320;

export type Pt = { x: number; y: number };

export type Outline = {
  points: Pt[];
  boneY: number;
  topY: number;
};

const THREAD = {
  fine: { pitch: 7, depth: 3.1, core: 20 },
  standard: { pitch: 11, depth: 5, core: 18 },
  buttress: { pitch: 12, depth: 5.6, core: 18 },
  coarse: { pitch: 16, depth: 7.6, core: 15.5 },
  knife: { pitch: 18, depth: 13, core: 10.5 },
  progressive: { pitch: 13, depth: 3.4, core: 18 },
} as const;

function halfAt(t: number, body: SchematicProfile["body"], core: number): number {
  const apical =
    body === "parallel" ? core * 0.94 : body === "mild" ? core * 0.68 : core * 0.38;
  return core + (apical - core) * t;
}

export function buildOutline(profile: SchematicProfile): Outline {
  const cx = VB_W / 2;
  const spec = THREAD[profile.thread];
  const bodyTop = profile.collar === "tulip" || profile.collar === "hyperbolic" ? 86 : 78;
  const bodyBot = 268;
  const left: Pt[] = [];

  if (profile.collar === "tulip") {
    left.push({ x: cx - 15, y: 34 });
    left.push({ x: cx - 18, y: 46 });
    left.push({ x: cx - 33, y: 64 });
    left.push({ x: cx - spec.core, y: bodyTop });
  } else if (profile.collar === "hyperbolic") {
    left.push({ x: cx - 11, y: 32 });
    left.push({ x: cx - 13, y: 48 });
    left.push({ x: cx - 18, y: 66 });
    left.push({ x: cx - spec.core - 1, y: bodyTop });
  } else if (profile.collar === "machined") {
    left.push({ x: cx - spec.core + 1, y: 50 });
    left.push({ x: cx - spec.core + 1, y: bodyTop - 4 });
    left.push({ x: cx - spec.core, y: bodyTop });
  } else if (profile.collar === "micro") {
    const microTop = 48;
    const microPitch = 4.2;
    let y = microTop;
    left.push({ x: cx - spec.core + 2, y: microTop });
    while (y < bodyTop - microPitch) {
      left.push({ x: cx - spec.core + 2, y });
      left.push({ x: cx - spec.core - 1.4, y: y + microPitch * 0.5 });
      y += microPitch;
    }
    left.push({ x: cx - spec.core, y: bodyTop });
  } else {
    left.push({ x: cx - spec.core, y: bodyTop - 6 });
  }

  const span = bodyBot - bodyTop;
  const steps = Math.max(4, Math.floor(span / spec.pitch));
  for (let i = 0; i < steps; i++) {
    const y = bodyTop + i * (span / steps);
    const next = bodyTop + (i + 1) * (span / steps);
    const t = (y - bodyTop) / span;
    const core = halfAt(t, profile.body, spec.core);
    const grow = profile.thread === "progressive" ? 0.55 + t * 1.5 : 1;
    const depth = spec.depth * grow;
    if (profile.thread === "buttress") {
      left.push({ x: cx - core, y });
      left.push({ x: cx - core - depth, y: y + (next - y) * 0.22 });
      left.push({ x: cx - core, y: y + (next - y) * 0.92 });
    } else {
      left.push({ x: cx - core, y });
      left.push({ x: cx - core - depth, y: y + (next - y) * 0.5 });
    }
  }

  const endCore = halfAt(1, profile.body, spec.core);
  if (profile.apex === "point") {
    left.push({ x: cx - endCore * 0.55, y: bodyBot });
    left.push({ x: cx - 0.6, y: 304 });
  } else if (profile.apex === "flat") {
    left.push({ x: cx - endCore, y: bodyBot + 2 });
    left.push({ x: cx - endCore + 1, y: 292 });
    left.push({ x: cx - 0.6, y: 292 });
  } else if (profile.apex === "vent") {
    left.push({ x: cx - endCore, y: bodyBot });
    left.push({ x: cx - endCore * 0.72, y: 286 });
    left.push({ x: cx - endCore * 0.95, y: 294 });
    left.push({ x: cx - endCore * 0.28, y: 302 });
    left.push({ x: cx - 0.6, y: 306 });
  } else {
    left.push({ x: cx - endCore, y: bodyBot });
    left.push({ x: cx - endCore * 0.55, y: 290 });
    left.push({ x: cx - endCore * 0.2, y: 302 });
    left.push({ x: cx - 0.6, y: 306 });
  }

  const tip = left[left.length - 1];
  const right = left
    .slice(0, -1)
    .reverse()
    .map((point) => ({ x: cx * 2 - point.x, y: point.y }));

  return {
    points: [...left, tip, ...right],
    boneY: bodyTop,
    topY: left[0]?.y ?? bodyTop,
  };
}

export function outlinePath(points: Pt[]): string {
  return (
    points
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(" ") + " Z"
  );
}

export type Raster = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

function paintBackground(raster: Raster) {
  const { data, width, height } = raster;
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = 12;
    data[i * 4 + 1] = 20;
    data[i * 4 + 2] = 16;
    data[i * 4 + 3] = 255;
  }
}

function fillPolygon(raster: Raster, points: Pt[], color: [number, number, number]) {
  const { data, width, height } = raster;
  for (let y = 0; y < height; y++) {
    const ys = y + 0.5;
    const xs: number[] = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      if ((a.y <= ys && b.y > ys) || (b.y <= ys && a.y > ys)) {
        const t = (ys - a.y) / (b.y - a.y);
        xs.push(a.x + t * (b.x - a.x));
      }
    }
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k]));
      const x1 = Math.min(width - 1, Math.floor(xs[k + 1]));
      for (let x = x0; x <= x1; x++) {
        const p = (y * width + x) * 4;
        data[p] = color[0];
        data[p + 1] = color[1];
        data[p + 2] = color[2];
        data[p + 3] = 255;
      }
    }
  }
}

export function paintSchematic(
  profile: SchematicProfile,
  width = 200,
  height = 400,
): Raster {
  const outline = buildOutline(profile);
  const sx = width / VB_W;
  const sy = height / VB_H;
  const scaled = outline.points.map((point) => ({ x: point.x * sx, y: point.y * sy }));
  const raster: Raster = {
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
  };
  paintBackground(raster);
  fillPolygon(raster, scaled, [232, 218, 190]);

  if (profile.connection === "ext-hex") {
    const cx = (VB_W / 2) * sx;
    const top = outline.topY * sy;
    const hex: Pt[] = [
      { x: cx - 7 * sx, y: top - 14 * sy },
      { x: cx + 7 * sx, y: top - 14 * sy },
      { x: cx + 7 * sx, y: top },
      { x: cx - 7 * sx, y: top },
    ];
    fillPolygon(raster, hex, [232, 218, 190]);
  }

  if (profile.platformSwitch) {
    const cx = (VB_W / 2) * sx;
    const y = outline.topY * sy + 2;
    const step: Pt[] = [
      { x: cx - 8 * sx, y },
      { x: cx + 8 * sx, y },
      { x: cx + 8 * sx, y: y + 7 * sy },
      { x: cx - 8 * sx, y: y + 7 * sy },
    ];
    fillPolygon(raster, step, [18, 28, 24]);
  }

  return raster;
}
