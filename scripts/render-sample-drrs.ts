import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { getTwin } from "../lib/twins/catalog";
import { renderDrr } from "../lib/twins/project";
import type { TwinPose } from "../lib/twins/types";

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const value of buffer) {
    crc ^= value;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

export function rasterToPng(raster: { width: number; height: number; data: Uint8ClampedArray }) {
  const raw = Buffer.alloc((raster.width * 4 + 1) * raster.height);
  for (let y = 0; y < raster.height; y++) {
    const row = y * (raster.width * 4 + 1);
    raw[row] = 0;
    Buffer.from(raster.data.buffer, raster.data.byteOffset + y * raster.width * 4, raster.width * 4).copy(raw, row + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(raster.width, 0);
  ihdr.writeUInt32BE(raster.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return png;
}

const samples: { id: string; pose: TwinPose; screen?: boolean; file: string }[] = [
  {
    id: "megagen-st",
    pose: { lengthMm: 11, diameterMm: 4.5, mdDeg: 18, blDeg: 8, spinDeg: 20 },
    screen: true,
    file: "megagen_st_drr_18deg_screen.png",
  },
  {
    id: "straumann-tl",
    pose: { lengthMm: 10, diameterMm: 4.1, mdDeg: -12, blDeg: 0, spinDeg: 0 },
    file: "straumann_tl_drr_m12deg.png",
  },
  {
    id: "nobel-active",
    pose: { lengthMm: 11.5, diameterMm: 4.3, mdDeg: 0, blDeg: 20, spinDeg: 40 },
    file: "nobel_active_drr_bl20deg.png",
  },
];

const outDir = process.argv[2] ?? "/tmp/drr-samples";
mkdirSync(outDir, { recursive: true });
for (const sample of samples) {
  const spec = getTwin(sample.id);
  if (!spec) throw new Error(sample.id);
  const raster = renderDrr(spec, sample.pose, { screen: sample.screen, width: 220, height: 420 });
  const path = `${outDir}/${sample.file}`;
  writeFileSync(path, rasterToPng(raster));
  console.log(path);
}
