import * as dicomParser from "dicom-parser";
import type { Raster } from "@/lib/silhouette";

const UNCOMPRESSED = new Set([
  "1.2.840.10008.1.2",
  "1.2.840.10008.1.2.1",
  "1.2.840.10008.1.2.2",
]);

const JPEG = new Set(["1.2.840.10008.1.2.4.50", "1.2.840.10008.1.2.4.70"]);

export type DicomDecoded =
  | { kind: "raster"; raster: Raster; note: string }
  | { kind: "jpeg"; bytes: Uint8Array; note: string };

export function decodeDicom(bytes: Uint8Array): DicomDecoded {
  let dataSet: dicomParser.DataSet;
  try {
    dataSet = dicomParser.parseDicom(bytes);
  } catch {
    throw new Error("This file does not read as a DICOM part 10 image. Export a JPEG or PNG from the viewer.");
  }

  const rows = dataSet.uint16("x00280010");
  const cols = dataSet.uint16("x00280011");
  if (!rows || !cols) {
    throw new Error("The DICOM file has no rows or columns. Export a JPEG or PNG instead.");
  }

  const transfer = (dataSet.string("x00020010") || "").trim();
  const frames = Number(dataSet.string("x00280008") || "1") || 1;
  const frameNote = frames > 1 ? " Only the first frame was rendered." : "";

  if (JPEG.has(transfer)) {
    const pixel = dataSet.elements.x7fe00010;
    if (!pixel) throw new Error("No pixel data in this DICOM file.");
    const jpeg = dicomParser.readEncapsulatedImageFrame(dataSet, pixel, 0);
    return {
      kind: "jpeg",
      bytes: jpeg,
      note: `JPEG DICOM frame decoded in the browser.${frameNote}`,
    };
  }

  if (transfer && !UNCOMPRESSED.has(transfer)) {
    throw new Error(
      `Transfer syntax ${transfer} is not rendered here. Export JPEG or PNG from the viewer.`,
    );
  }

  const raster = rasterFromUncompressed(dataSet, bytes, rows, cols);
  return {
    kind: "raster",
    raster,
    note: `Uncompressed DICOM windowed in the browser.${frameNote} Windowing is approximate.`,
  };
}

function rasterFromUncompressed(
  dataSet: dicomParser.DataSet,
  bytes: Uint8Array,
  rows: number,
  cols: number,
): Raster {
  const pixel = dataSet.elements.x7fe00010;
  if (!pixel) throw new Error("No pixel data in this DICOM file.");
  const bits = dataSet.uint16("x00280100") || 16;
  const signed = (dataSet.uint16("x00280103") || 0) === 1;
  const photo = (dataSet.string("x00280004") || "MONOCHROME2").trim();
  const slope = Number(dataSet.string("x00281053") || "1") || 1;
  const intercept = Number(dataSet.string("x00281052") || "0") || 0;
  const samples = new Float32Array(rows * cols);
  const offset = pixel.dataOffset;

  if (bits <= 8) {
    for (let i = 0; i < samples.length; i++) {
      let value = bytes[offset + i] ?? 0;
      if (signed && value > 127) value -= 256;
      samples[i] = value * slope + intercept;
    }
  } else {
    for (let i = 0; i < samples.length; i++) {
      const lo = bytes[offset + i * 2] ?? 0;
      const hi = bytes[offset + i * 2 + 1] ?? 0;
      let value = lo + hi * 256;
      if (signed && value > 32767) value -= 65536;
      samples[i] = value * slope + intercept;
    }
  }

  const gray = windowSamples(samples, dataSet);
  const data = new Uint8ClampedArray(rows * cols * 4);
  const invert = photo === "MONOCHROME1";
  for (let i = 0; i < gray.length; i++) {
    const value = invert ? 255 - gray[i] : gray[i];
    data[i * 4] = value;
    data[i * 4 + 1] = value;
    data[i * 4 + 2] = value;
    data[i * 4 + 3] = 255;
  }
  return { width: cols, height: rows, data };
}

export function windowSamples(samples: Float32Array, dataSet?: dicomParser.DataSet): Uint8Array {
  const wc = Number((dataSet?.string("x00281050") || "").split("\\")[0]);
  const ww = Number((dataSet?.string("x00281051") || "").split("\\")[0]);
  let low: number;
  let high: number;
  if (Number.isFinite(wc) && Number.isFinite(ww) && ww > 0) {
    low = wc - ww / 2;
    high = wc + ww / 2;
  } else {
    const sorted = Float32Array.from(samples).sort();
    low = sorted[Math.floor(sorted.length * 0.01)] ?? 0;
    high = sorted[Math.ceil(sorted.length * 0.99) - 1] ?? 1;
    if (high <= low) high = low + 1;
  }
  const out = new Uint8Array(samples.length);
  const span = high - low || 1;
  for (let i = 0; i < samples.length; i++) {
    const scaled = ((samples[i] - low) / span) * 255;
    out[i] = Math.max(0, Math.min(255, Math.round(scaled)));
  }
  return out;
}

export async function dicomBytesToDataUrl(bytes: Uint8Array): Promise<{ url: string; note: string }> {
  const decoded = decodeDicom(bytes);
  if (decoded.kind === "jpeg") {
    const blob = new Blob([new Uint8Array(decoded.bytes)], { type: "image/jpeg" });
    return { url: URL.createObjectURL(blob), note: decoded.note };
  }
  const canvas = document.createElement("canvas");
  canvas.width = decoded.raster.width;
  canvas.height = decoded.raster.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not draw the DICOM frame.");
  const copy = new Uint8ClampedArray(decoded.raster.data.byteLength);
  copy.set(decoded.raster.data);
  context.putImageData(new ImageData(copy, decoded.raster.width, decoded.raster.height), 0, 0);
  return { url: canvas.toDataURL("image/png"), note: decoded.note };
}
