import type { Raster } from "@/lib/silhouette";

export type Polarity = "bright" | "dark";

export type VisionCue = {
  feature: "collar" | "body" | "thread" | "apex";
  value: string;
  strength: "low" | "moderate";
  note: string;
};

export type VisionReport = {
  cues: VisionCue[];
  notes: string[];
};

function luminance(data: Uint8ClampedArray, index: number) {
  return data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
}

function otsu(hist: number[], total: number) {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0;
  let weightB = 0;
  let max = 0;
  let threshold = 128;
  for (let i = 0; i < 256; i++) {
    weightB += hist[i];
    if (weightB === 0) continue;
    const weightF = total - weightB;
    if (weightF === 0) break;
    sumB += i * hist[i];
    const meanB = sumB / weightB;
    const meanF = (sum - sumB) / weightF;
    const between = weightB * weightF * (meanB - meanF) ** 2;
    if (between > max) {
      max = between;
      threshold = i;
    }
  }
  return threshold;
}

function percentileThreshold(hist: number[], total: number, fraction: number) {
  const need = total * fraction;
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc >= need) return i;
  }
  return 255;
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stddev(values: number[]) {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function detrendLinear(values: number[]) {
  const n = values.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX || 1;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return values.map((value, index) => value - (intercept + slope * index));
}

function lowerEnvelope(values: number[]) {
  const win = Math.max(4, Math.round(values.length * 0.045));
  return values.map((_, index) => {
    let min = Infinity;
    for (let k = -win; k <= win; k++) {
      const value = values[index + k];
      if (value && value < min) min = value;
    }
    return Number.isFinite(min) ? min : 0;
  });
}

function smooth(values: number[], radius: number) {
  return values.map((_, index) => {
    let sum = 0;
    let count = 0;
    for (let offset = -radius; offset <= radius; offset++) {
      const value = values[index + offset];
      if (value == null) continue;
      sum += value;
      count++;
    }
    return count ? sum / count : 0;
  });
}

/** Bands of columns that actually contain fixture pixels, split by a dark gap. */
function fixtureBands(
  lum: Float32Array,
  width: number,
  height: number,
  threshold: number,
): { start: number; end: number; mass: number }[] {
  const y0 = Math.floor(height * 0.05);
  const y1 = Math.ceil(height * 0.96);
  const mass = new Array<number>(width).fill(0);
  for (let x = 0; x < width; x++) {
    for (let y = y0; y < y1; y++) {
      if (lum[y * width + x] >= threshold) mass[x] += 1;
    }
  }
  const bands: { start: number; end: number; mass: number }[] = [];
  let start = -1;
  let gap = 0;
  for (let x = 0; x <= width; x++) {
    const on = x < width && mass[x] > 0;
    if (on) {
      if (start < 0) start = x;
      gap = 0;
      continue;
    }
    gap += 1;
    if (start >= 0 && (gap >= 3 || x === width)) {
      const end = x - gap;
      let sum = 0;
      for (let col = start; col <= end; col++) sum += mass[col] ?? 0;
      if (end >= start && sum >= height * 0.08) bands.push({ start, end, mass: sum });
      start = -1;
    }
  }
  return bands;
}

function widthsInBand(
  lum: Float32Array,
  width: number,
  height: number,
  threshold: number,
  band: { start: number; end: number },
) {
  const widths: number[] = [];
  const counts: number[] = [];
  for (let y = 0; y < height; y++) {
    let minX = band.end;
    let maxX = band.start;
    let count = 0;
    for (let x = band.start; x <= band.end; x++) {
      if (lum[y * width + x] >= threshold) {
        if (count === 0 || x < minX) minX = x;
        if (count === 0 || x > maxX) maxX = x;
        count++;
      }
    }
    widths.push(count > 0 ? maxX - minX + 1 : 0);
    counts.push(count);
  }
  return { widths, counts };
}

/**
 * Knife blades leave a narrow core between deep notches.
 * Peak width is the outer blade. Trough width is the core.
 * Standard and fine threads stay well above this ratio, so they are not relabeled.
 */
function knifeNotches(widths: number[]): { knife: boolean; peaks: number; ratio: number } {
  const smoothed = smooth(widths, 1);
  const usable = smoothed.filter((value) => value > 2);
  if (usable.length < 16) return { knife: false, peaks: 0, ratio: 1 };
  const med = median(usable);
  const peaks: number[] = [];
  const troughs: number[] = [];
  for (let index = 2; index < smoothed.length - 2; index++) {
    const value = smoothed[index];
    if (value <= 2) continue;
    const peak =
      value >= smoothed[index - 1] &&
      value > smoothed[index - 2] &&
      value >= smoothed[index + 1] &&
      value > smoothed[index + 2];
    const trough =
      value <= smoothed[index - 1] &&
      value < smoothed[index - 2] &&
      value <= smoothed[index + 1] &&
      value < smoothed[index + 2];
    if (peak && value > med * 0.8) peaks.push(value);
    if (trough && value < med) troughs.push(value);
  }
  if (peaks.length < 4 || troughs.length < 3) return { knife: false, peaks: peaks.length, ratio: 1 };
  const ratio = median(troughs) / median(peaks);
  const depth = (median(peaks) - median(troughs)) / med;
  return { knife: ratio < 0.58 && depth >= 0.16, peaks: peaks.length, ratio };
}

function bestPeriod(values: number[]): { period: number; amplitude: number } | null {
  if (values.length < 20) return null;
  const detrended = detrendLinear(values);
  const amplitude = stddev(detrended);
  if (amplitude < 0.8) return null;
  const corrAt = (lag: number) => {
    let score = 0;
    let count = 0;
    for (let i = 0; i + lag < detrended.length; i++) {
      score += detrended[i] * detrended[i + lag];
      count++;
    }
    return count ? score / count : -Infinity;
  };
  let bestLag = 0;
  let best = -Infinity;
  const maxLag = Math.min(48, Math.floor(values.length / 3));
  for (let lag = 4; lag <= maxLag; lag++) {
    const corr = corrAt(lag);
    if (corr > best) {
      best = corr;
      bestLag = lag;
    }
  }
  if (bestLag === 0 || best <= 0) return null;
  for (const divisor of [3, 2]) {
    const lag = Math.round(bestLag / divisor);
    if (lag >= 4 && corrAt(lag) > best * 0.62) bestLag = lag;
  }
  return { period: bestLag, amplitude };
}

type FixtureMeasure = {
  widths: number[];
  grooves: number[];
  /** True when the first threshold covered the whole bright screen and a higher one was required. */
  saturated: boolean;
  knife: boolean;
  knifeRatio: number;
};

function rankBands(
  lum: Float32Array,
  width: number,
  height: number,
  threshold: number,
  minPresent: number,
  maxFraction: number,
) {
  return fixtureBands(lum, width, height, threshold)
    .map((band) => {
      const measured = widthsInBand(lum, width, height, threshold, band);
      const present = measured.widths.filter((value) => value > 2);
      const fraction = (band.end - band.start + 1) / width;
      const threadiness = present.length ? stddev(present) / (median(present) || 1) : 0;
      return { band, ...measured, present: present.length, fraction, threadiness };
    })
    .filter((item) => item.present >= minPresent && item.fraction <= maxFraction && item.fraction >= 0.04)
    .sort((a, b) => b.threadiness - a.threadiness || b.band.mass - a.band.mass);
}

/**
 * A schematic has one bright object, so Otsu is enough.
 * A photo of a monitor is bright almost everywhere. Otsu then outlines the screen.
 * In that case the fixture is the tall object in the top few percent of gray values.
 */
function measureFixture(
  lum: Float32Array,
  width: number,
  height: number,
  hist: number[],
  otsuThreshold: number,
): FixtureMeasure | null {
  const plain = { knife: false, knifeRatio: 1 };
  const primary = rankBands(lum, width, height, otsuThreshold, height * 0.18, 0.85);
  const top = primary[0];
  if (top && top.fraction <= 0.7) {
    return { widths: top.widths, grooves: top.counts, saturated: false, ...plain };
  }
  let best: (typeof primary)[number] | null = null;
  let bestNotch = plain;
  for (const fraction of [0.985, 0.99, 0.993]) {
    const threshold = Math.max(otsuThreshold + 8, percentileThreshold(hist, width * height, fraction));
    const bands = rankBands(lum, width, height, threshold, height * 0.18, 0.45);
    const candidate = bands[0];
    if (!candidate) continue;
    const notch = knifeNotches(candidate.counts);
    const betterKnife = notch.knife && notch.ratio < bestNotch.knifeRatio;
    if (betterKnife) {
      best = candidate;
      bestNotch = { knife: true, knifeRatio: notch.ratio };
      continue;
    }
    if (!bestNotch.knife && (!best || candidate.threadiness > best.threadiness)) best = candidate;
  }
  if (!best) return top ? { widths: top.widths, grooves: top.counts, saturated: false, ...plain } : null;
  return { widths: best.widths, grooves: best.counts, saturated: true, ...bestNotch };
}

export function analyzeRaster(raster: Raster, polarity: Polarity = "bright"): VisionReport {
  const { width, height, data } = raster;
  const hist = new Array<number>(256).fill(0);
  const lum = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    let value = luminance(data, i * 4);
    if (polarity === "dark") value = 255 - value;
    lum[i] = value;
    hist[Math.max(0, Math.min(255, Math.round(value)))]++ ;
  }
  // Otsu lands on the background bin when the two peaks have an empty valley.
  // Step one gray level forward so the background itself is excluded.
  const threshold = otsu(hist, width * height) + 1;
  const measured = measureFixture(lum, width, height, hist, threshold);
  if (!measured) {
    return {
      cues: [],
      notes: [
        "The crop did not contain a clear bright fixture. Check polarity, or mark the cues yourself.",
      ],
    };
  }
  const widths = measured.widths;
  const saturated = measured.saturated;

  const present = widths.filter((value) => value > 2);
  if (present.length < height * 0.18) {
    return {
      cues: [],
      notes: [
        "The crop did not contain a clear bright fixture. Check polarity, or mark the cues yourself.",
      ],
    };
  }

  const presentIdx = widths.flatMap((value, index) => (value > 2 ? [index] : []));
  const firstPresent = presentIdx[0] ?? -1;
  const lastPresent = presentIdx[presentIdx.length - 1] ?? -1;
  if (firstPresent < 0 || lastPresent <= firstPresent + 16) {
    return {
      cues: [],
      notes: ["The fixture outline was too small to measure. Crop tighter around the threads."],
    };
  }
  const fixture = widths.slice(firstPresent, lastPresent + 1);
  const central = fixture.slice(Math.floor(fixture.length * 0.3), Math.floor(fixture.length * 0.7));
  const midMed = median(central.filter((value) => value > 2));
  let trim = 0;
  while (trim < fixture.length * 0.18 && fixture[trim] > 0 && fixture[trim] < midMed * 0.42) trim++;
  const span = fixture.slice(trim);
  const n = span.length;
  const collarSlice = span.slice(0, Math.max(6, Math.floor(n * 0.16))).filter((value) => value > 0);
  const bodySlice = span.slice(Math.floor(n * 0.28), Math.floor(n * 0.78)).filter((value) => value > 0);
  const apexEarly = span.slice(Math.floor(n * 0.78), Math.floor(n * 0.9)).filter((value) => value > 0);
  const apexLate = span.slice(Math.floor(n * 0.9)).filter((value) => value > 0);
  const cues: VisionCue[] = [];
  const notes: string[] = [
    "Image cues are measurements of this crop. They enter the same evidence list as a soft cue until you confirm or replace them.",
  ];

  if (collarSlice.length && bodySlice.length) {
    const ratio = median(collarSlice) / median(bodySlice);
    const flare = Math.max(...collarSlice) / median(bodySlice);
    const collarPeriod = bestPeriod(span.slice(0, Math.floor(n * 0.22)));
    const bodyPeriod = bestPeriod(bodySlice);
    const wideFraction =
      collarSlice.filter((value) => value > median(bodySlice) * 1.12).length / collarSlice.length;
    if (flare >= 1.18 && ratio >= 1.05 && wideFraction >= 0.34) {
      cues.push({
        feature: "collar",
        value: "tulip",
        strength: flare >= 1.3 ? "moderate" : "low",
        note: "The coronal outline is wider than the threaded body, which reads as a flare.",
      });
    } else if (ratio <= 0.8) {
      cues.push({
        feature: "collar",
        value: "hyperbolic",
        strength: ratio <= 0.7 ? "moderate" : "low",
        note: "The neck is narrower than the body, which reads as a convergent collar.",
      });
    } else if (
      collarPeriod &&
      bodyPeriod &&
      collarPeriod.period < bodyPeriod.period * 0.7 &&
      collarPeriod.amplitude > 0.9
    ) {
      cues.push({
        feature: "collar",
        value: "microthread",
        strength: "low",
        note: "The neck edge oscillates faster than the body thread. Confirm it is not noise.",
      });
    } else if (collarPeriod && collarPeriod.amplitude < 0.9 && bodyPeriod && bodyPeriod.amplitude > 1.3) {
      cues.push({
        feature: "collar",
        value: "machined-band",
        strength: "low",
        note: "The neck edge is smoother than the body. A short machined band is possible.",
      });
    } else {
      cues.push({
        feature: "collar",
        value: "bone-level",
        strength: "low",
        note: "No separate neck shape stood out from the body.",
      });
    }
  }

  if (bodySlice.length > 8) {
    const envelope = lowerEnvelope(span).filter((value) => value > 0);
    const coronal = median(envelope.slice(Math.floor(envelope.length * 0.18), Math.floor(envelope.length * 0.4)));
    const apical = median(envelope.slice(Math.floor(envelope.length * 0.72), Math.floor(envelope.length * 0.9)));
    const ratio = coronal > 0 ? apical / coronal : 1;
    const value = ratio > 0.88 ? "parallel" : ratio > 0.62 ? "mild-taper" : "strong-taper";
    const strength = ratio > 0.94 || ratio < 0.55 ? "moderate" : "low";
    cues.push({
      feature: "body",
      value,
      strength,
      note:
        value === "parallel"
          ? "Body width stays nearly constant along the threads."
          : value === "mild-taper"
            ? "The body narrows toward the apex without becoming a sharp root form."
            : "The body narrows sharply toward the apex.",
    });
  }

  const thread = bestPeriod(bodySlice);
  const notches = saturated
    ? { knife: measured.knife, peaks: 0, ratio: measured.knifeRatio }
    : knifeNotches(span);
  if (notches.knife) {
    cues.push({
      feature: "thread",
      value: "knife",
      strength: saturated || notches.ratio < 0.5 ? "moderate" : "low",
      note: "The core between the blades is narrow and the notches repeat. That reads as deep knife threads, including when a neighboring tooth is in the frame.",
    });
  } else if (thread) {
    const relative = thread.period / Math.max(n, 1);
    let value = "standard";
    if (relative < 0.034) value = "fine";
    else if (relative > 0.055 && thread.amplitude > midMed * 0.12) value = "knife";
    else if (relative > 0.048) value = "coarse";
    const topAmp = stddev(bodySlice.slice(0, Math.floor(bodySlice.length / 2)));
    const botAmp = stddev(bodySlice.slice(Math.floor(bodySlice.length / 2)));
    if (value !== "knife" && botAmp > topAmp * 1.45 && relative > 0.04) value = "progressive";
    cues.push({
      feature: "thread",
      value,
      strength: thread.amplitude > 1.6 ? "moderate" : "low",
      note: "Thread pitch is estimated from the edge, so angulation can fake a coarse or fine thread.",
    });
  } else {
    notes.push("Thread pitch was not readable. Leave thread as not sure unless you can count it.");
  }

  if (apexEarly.length && apexLate.length) {
    const ratio = median(apexLate) / median(apexEarly);
    const value = ratio < 0.42 ? "pointed" : ratio < 0.78 ? "rounded" : "flat";
    cues.push({
      feature: "apex",
      value,
      strength: ratio < 0.35 || ratio > 0.9 ? "moderate" : "low",
      note: "Cutting flutes are not inferred. Mark those only if you can see the vents.",
    });
  }

  notes.push("Connection geometry is not inferred from a crop.");
  if (saturated) {
    // A photographed screen is bright to the edges. Neck flare and the apex are
    // not reliable there. Thread notches and body taper still are.
    const kept = cues.filter((cue) => cue.feature === "thread" || cue.feature === "body");
    cues.splice(0, cues.length, ...kept);
  }
  return { cues, notes };
}
