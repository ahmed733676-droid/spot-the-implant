import type { Raster } from "@/lib/silhouette";
import type { TwinPose, TwinSpec } from "@/lib/twins/types";

function fract(value: number) {
  return value - Math.floor(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Outer radius in millimetres at a station along the implant. z = 0 is the platform, z = length is the apex. */
export function radiusAt(spec: TwinSpec, pose: TwinPose, z: number, phase: number): number {
  const length = Math.max(pose.lengthMm, 1);
  const scale = pose.diameterMm / Math.max(spec.coronalDiameter.value, 0.1);
  const coronal = (spec.coronalDiameter.value * scale) / 2;
  const apical = (spec.apicalDiameter.value * scale) / 2;
  const collar = spec.collarHeight.value;
  const depth0 = spec.threadDepth.value * scale;
  const zBody = clamp(z, 0, length);
  const bodyT = collar >= length ? 1 : clamp((zBody - collar) / Math.max(length - collar, 0.1), 0, 1);
  const core = coronal + (apical - coronal) * bodyT;
  let depth = depth0 * (spec.progressive ? 0.35 + 0.9 * bodyT : 1);
  const pitch = Math.max(spec.pitch.value, 0.2);
  const turns = (zBody / pitch) * spec.leads.value + phase;
  const u = fract(turns);
  let tooth = 0;
  if (zBody > collar) {
    if (spec.threadProfile === "knife") {
      const x = fract(u);
      tooth = Math.exp(-((x - 0.2) ** 2) / 0.018);
    } else if (spec.threadProfile === "buttress") {
      tooth = u < 0.72 ? u / 0.72 : (1 - u) / 0.28;
    } else if (spec.threadProfile === "reverse-buttress") {
      tooth = u < 0.28 ? u / 0.28 : (1 - u) / 0.72;
    } else {
      tooth = 1 - Math.abs(u * 2 - 1);
    }
  }
  if (spec.collar === "microthread" && zBody <= Math.max(collar, 1.2)) {
    const micro = 1 - Math.abs(fract(zBody / 0.25) * 2 - 1);
    tooth = Math.max(tooth, micro * 0.35);
    depth = Math.max(depth, depth0 * 0.45);
  }
  let radius = core - depth * 0.35 + depth * tooth;
  if (spec.collar === "tulip" && collar > 0 && zBody <= collar) {
    const flare = 1 - zBody / collar;
    radius = Math.max(radius, core * (1 + 0.42 * flare));
  }
  if (spec.collar === "machined" && collar > 0 && zBody <= collar) {
    radius = core * 0.92;
  }
  const inset = spec.platformInset.value * scale;
  if (inset > 0 && zBody < 0.45) {
    radius = Math.min(radius, Math.max(0.4, coronal - inset / 2));
  }
  const apexRun = spec.apex === "point" ? 2.4 : spec.apex === "flat" ? 0.35 : 1.4;
  const apexStart = length - apexRun;
  if (zBody > apexStart) {
    const t = clamp((zBody - apexStart) / apexRun, 0, 1);
    const tip = spec.apex === "point" ? 0.08 : spec.apex === "flat" ? 0.92 : spec.apex === "cutting" ? 0.35 : 0.28;
    radius *= 1 - t * (1 - tip);
  }
  return Math.max(0.15, radius);
}

export type Profile = {
  /** Horizontal width of the silhouette, arbitrary units, one sample per row. */
  widths: number[];
  /** Midline position in the same units. The sign is the film-plane lean. */
  centers: number[];
};

/**
 * Silhouette width along image rows.
 * Mesio-distal tilt is a rotation in the film. Bucco-lingual tilt shortens the body and softens thread contrast.
 */
export function projectedProfile(spec: TwinSpec, pose: TwinPose, rows = 96): Profile {
  const length = Math.max(pose.lengthMm, 1);
  const md = (pose.mdDeg * Math.PI) / 180;
  const bl = (pose.blDeg * Math.PI) / 180;
  const spin = pose.spinDeg / 360;
  const contrast = clamp(Math.cos(bl), 0.35, 1);
  const samples = 180;
  let minY = Infinity;
  let maxY = -Infinity;
  const points: { x: number; y: number; core: number }[] = [];
  for (let i = 0; i <= samples; i++) {
    const z = (length * i) / samples;
    const outer = radiusAt(spec, pose, z, spin);
    const inner = radiusAt(spec, pose, z, spin + 0.5);
    const core = (outer + inner) / 2;
    const radius = core + (outer - core) * contrast;
    const y = z * Math.cos(md) + 0 * Math.sin(md);
    const shift = z * Math.sin(md);
    points.push({ x: shift - radius, y, core: radius });
    points.push({ x: shift + radius, y, core: radius });
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const widths = new Array<number>(rows).fill(0);
  const centers = new Array<number>(rows).fill(0);
  const span = Math.max(maxY - minY, 0.001);
  for (let i = 0; i < points.length; i += 2) {
    const left = points[i];
    const right = points[i + 1];
    const row = clamp(Math.round(((left.y - minY) / span) * (rows - 1)), 0, rows - 1);
    const width = right.x - left.x;
    if (width >= widths[row]) {
      widths[row] = width;
      centers[row] = (left.x + right.x) / 2;
    }
  }
  let previous = 0;
  let previousCenter = 0;
  for (let row = 0; row < rows; row++) {
    if (widths[row] > 0) {
      previous = widths[row];
      previousCenter = centers[row];
    } else if (previous > 0) {
      widths[row] = previous;
      centers[row] = previousCenter;
    }
  }
  return { widths, centers };
}

function luminanceOf(raster: Raster, index: number) {
  const pixel = index * 4;
  return raster.data[pixel] * 0.2126 + raster.data[pixel + 1] * 0.7152 + raster.data[pixel + 2] * 0.0722;
}

export type MeasuredSilhouette = {
  widths: number[];
  centers: number[];
};

/** Width and midline of the brightest tall object, trimmed to the object. */
export function measureSilhouette(raster: Raster): MeasuredSilhouette | null {
  const { width, height, data } = raster;
  if (width < 8 || height < 16) return null;
  const hist = new Array<number>(256).fill(0);
  const lum = new Float32Array(width * height);
  for (let i = 0; i < lum.length; i++) {
    const value = luminanceOf({ width, height, data }, i);
    lum[i] = value;
    hist[Math.min(255, Math.round(value))]++;
  }
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  const mean = sum / lum.length;
  let threshold = 128;
  if (mean > 140) {
    let acc = 0;
    const need = lum.length * 0.9;
    for (let i = 0; i < 256; i++) {
      acc += hist[i];
      if (acc >= need) {
        threshold = i;
        break;
      }
    }
  } else {
    let sumB = 0;
    let weightB = 0;
    let max = 0;
    for (let i = 0; i < 256; i++) {
      weightB += hist[i];
      if (weightB === 0) continue;
      const weightF = lum.length - weightB;
      if (weightF === 0) break;
      sumB += i * hist[i];
      const between = weightB * weightF * (sumB / weightB - (sum - sumB) / weightF) ** 2;
      if (between > max) {
        max = between;
        threshold = i;
      }
    }
  }
  const mass = new Array<number>(width).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (lum[y * width + x] >= threshold) mass[x]++;
    }
  }
  let bestStart = 0;
  let bestEnd = width - 1;
  let best = 0;
  let start = -1;
  for (let x = 0; x <= width; x++) {
    const on = x < width && mass[x] > height * 0.05;
    if (on && start < 0) start = x;
    if ((!on || x === width) && start >= 0) {
      const end = x - 1;
      let total = 0;
      for (let col = start; col <= end; col++) total += mass[col];
      if (total > best) {
        best = total;
        bestStart = start;
        bestEnd = end;
      }
      start = -1;
    }
  }
  const widths: number[] = [];
  const centers: number[] = [];
  const mid = (bestStart + bestEnd) / 2;
  for (let y = 0; y < height; y++) {
    let minX = bestEnd;
    let maxX = bestStart;
    let count = 0;
    for (let x = bestStart; x <= bestEnd; x++) {
      if (lum[y * width + x] < threshold) continue;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
    widths.push(count > 2 ? maxX - minX + 1 : 0);
    centers.push(count > 2 ? (minX + maxX) / 2 - mid : 0);
  }
  const first = widths.findIndex((value) => value > 0);
  let last = widths.length - 1;
  while (last > first && widths[last] === 0) last--;
  if (first < 0 || last - first < 12) return null;
  return { widths: widths.slice(first, last + 1), centers: centers.slice(first, last + 1) };
}

/** Width of the brightest tall object, one value per row, trimmed to the object. */
export function measureWidthProfile(raster: Raster): number[] | null {
  return measureSilhouette(raster)?.widths ?? null;
}

export function resample(values: number[], count: number): number[] {
  if (values.length === 0) return new Array<number>(count).fill(0);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const position = (i / Math.max(count - 1, 1)) * (values.length - 1);
    const index = Math.floor(position);
    const next = Math.min(values.length - 1, index + 1);
    const t = position - index;
    out.push(values[index] * (1 - t) + values[next] * t);
  }
  return out;
}

export function normalized(values: number[]): number[] {
  const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(values.length, 1);
  const sd = Math.sqrt(variance) || 1;
  return values.map((value) => (value - mean) / sd);
}

export function correlation(left: number[], right: number[]): number {
  const n = Math.min(left.length, right.length);
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += left[i] * right[i];
  return sum / n;
}

function blur(data: Uint8ClampedArray, width: number, height: number) {
  const next = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
          const pixel = (yy * width + xx) * 4;
          r += data[pixel];
          g += data[pixel + 1];
          b += data[pixel + 2];
          count++;
        }
      }
      const pixel = (y * width + x) * 4;
      next[pixel] = r / count;
      next[pixel + 1] = g / count;
      next[pixel + 2] = b / count;
      next[pixel + 3] = 255;
    }
  }
  data.set(next);
}

export type DrrOptions = {
  width?: number;
  height?: number;
  /** Photo of a bright screen: glare, a faint grid, and less contrast. */
  screen?: boolean;
};

/**
 * Digitally reconstructed radiograph of one parametric twin.
 * Metal is bright, the field is dark, unless `screen` is set.
 * This is a drawing from catalog numbers, not a patient film and not manufacturer CAD.
 */
export function renderDrr(spec: TwinSpec, pose: TwinPose, options: DrrOptions = {}): Raster {
  const width = options.width ?? 180;
  const height = options.height ?? 340;
  const data = new Uint8ClampedArray(width * height * 4);
  if (options.screen) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const grid = 0.5 + 0.5 * Math.sin(x * 0.9) * Math.sin(y * 0.5);
        const value = clamp(Math.round(168 + grid * 22 + (y / height) * 16), 0, 255);
        const pixel = (y * width + x) * 4;
        data[pixel] = value;
        data[pixel + 1] = value;
        data[pixel + 2] = value;
        data[pixel + 3] = 255;
      }
    }
  }
  const md = (pose.mdDeg * Math.PI) / 180;
  const bl = (pose.blDeg * Math.PI) / 180;
  const spin = pose.spinDeg / 360;
  const length = pose.lengthMm;
  const margin = 2.4;
  const fieldH = length * Math.cos(bl) + pose.diameterMm * Math.abs(Math.sin(md)) + margin * 2;
  const fieldW = pose.diameterMm + length * Math.abs(Math.sin(md)) + margin * 2;
  const cosMd = Math.cos(md);
  const sinMd = Math.sin(md);
  const cosBl = Math.cos(bl);
  const slices: { y: number; half: number; shift: number }[] = [];
  const step = 0.04;
  for (let z = 0; z <= length; z += step) {
    const radius = radiusAt(spec, pose, z, spin);
    const along = z - length / 2;
    slices.push({
      y: along * cosBl * cosMd,
      shift: along * sinMd,
      half: radius * Math.max(cosBl, 0.55),
    });
  }

  for (let y = 0; y < height; y++) {
    const cameraY = (y / (height - 1) - 0.5) * fieldH;
    let best = slices[0];
    let bestDist = Infinity;
    for (const slice of slices) {
      const dist = Math.abs(slice.y - cameraY);
      if (dist < bestDist) {
        bestDist = dist;
        best = slice;
      }
    }
    if (!best || bestDist > step * 2) continue;
    for (let x = 0; x < width; x++) {
      const cameraX = (x / (width - 1) - 0.5) * fieldW;
      const lateral = cameraX - best.shift;
      const half = best.half;
      if (Math.abs(lateral) > half) continue;
      const chord = Math.sqrt(Math.max(0, 1 - (lateral / half) ** 2));
      const shade = clamp(0.25 + 0.75 * chord, 0, 1);
      let value = Math.round(16 + shade * 232);
      if (options.screen) {
        const grid = 0.5 + 0.5 * Math.sin(x * 0.9) * Math.sin(y * 0.5);
        value = Math.round(128 + shade * 100 + grid * 16 + (y / height) * 12);
      }
      const noise = ((x * 13 + y * 29) % 7) - 3;
      value = clamp(value + noise, 0, 255);
      const pixel = (y * width + x) * 4;
      data[pixel] = value;
      data[pixel + 1] = value;
      data[pixel + 2] = value;
      data[pixel + 3] = 255;
    }
  }
  blur(data, width, height);
  return { width, height, data };
}
