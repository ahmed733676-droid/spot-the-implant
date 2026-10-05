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

export function analyzeRaster(raster: Raster, polarity: Polarity = "bright"): VisionReport {
  const { width, height, data } = raster;
  const hist = new Array<number>(256).fill(0);
  const lum = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    let value = luminance(data, i * 4);
    if (polarity === "dark") value = 255 - value;
    lum[i] = value;
    hist[Math.max(0, Math.min(255, Math.round(value)))]++;
  }
  // Otsu lands on the background bin when the two peaks have an empty valley.
  // Step one gray level forward so the background itself is excluded.
  const threshold = otsu(hist, width * height) + 1;
  const widths: number[] = [];
  for (let y = 0; y < height; y++) {
    let minX = width;
    let maxX = -1;
    for (let x = 0; x < width; x++) {
      if (lum[y * width + x] >= threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    widths.push(maxX >= minX ? maxX - minX + 1 : 0);
  }

  const present = widths.filter((value) => value > 2);
  if (present.length < height * 0.25) {
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
    "Image cues are measurements of this crop, not a model of implant identity. Accept or ignore each one.",
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
  if (thread) {
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
  return { cues, notes };
}
