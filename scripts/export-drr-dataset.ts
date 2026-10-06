/**
 * Writes a small labeled set of parametric DRRs for a future browser model.
 * This does not train anything. Each row is a catalog approximation, not a patient film.
 *
 *   npx tsx scripts/export-drr-dataset.ts ./data/drr
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { libraryTwins } from "../lib/twins/catalog";
import { renderDrr } from "../lib/twins/project";
import { rasterToPng } from "./render-sample-drrs";

const outDir = process.argv[2] ?? "./data/drr";
mkdirSync(outDir, { recursive: true });

const angles = [
  { mdDeg: 0, blDeg: 0, spinDeg: 0 },
  { mdDeg: 15, blDeg: 0, spinDeg: 0 },
  { mdDeg: -15, blDeg: 10, spinDeg: 45 },
];

const rows: Record<string, unknown>[] = [];
for (const spec of libraryTwins()) {
  for (const angle of angles) {
    const pose = {
      lengthMm: spec.length.value,
      diameterMm: spec.coronalDiameter.value,
      ...angle,
    };
    const raster = renderDrr(spec, pose, { width: 120, height: 220, screen: angle.mdDeg !== 0 });
    const file = `${spec.id}_${angle.mdDeg}_${angle.blDeg}.png`;
    writeFileSync(`${outDir}/${file}`, rasterToPng(raster));
    rows.push({
      file,
      systemId: spec.libraryId,
      name: spec.name,
      pose,
      source: spec.source,
      approximation: spec.approximation,
      estimated: [
        spec.length,
        spec.coronalDiameter,
        spec.apicalDiameter,
        spec.pitch,
        spec.threadDepth,
        spec.leads,
        spec.collarHeight,
        spec.platformInset,
      ]
        .filter((item) => item.status === "estimated")
        .map((item) => item.note),
    });
  }
}

writeFileSync(`${outDir}/labels.json`, JSON.stringify(rows, null, 2));
console.log(`${rows.length} DRRs in ${outDir}`);
