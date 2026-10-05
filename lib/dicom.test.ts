import { describe, expect, it } from "vitest";
import { decodeDicom, windowSamples } from "@/lib/dicom";

function u16(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
}

function element(group: number, tag: number, vr: string, value: Buffer) {
  const long = ["OB", "OW", "OF", "SQ", "UT", "UN"].includes(vr);
  const head = Buffer.concat([u16(group), u16(tag), Buffer.from(vr, "ascii")]);
  if (long) {
    return Buffer.concat([head, Buffer.from([0, 0]), u32(value.length), value]);
  }
  return Buffer.concat([head, u16(value.length), value]);
}

function text(vr: "UI" | "CS" | "LO", value: string) {
  const pad = vr === "UI" ? "\0" : " ";
  const even = value.length % 2 === 0 ? value : value + pad;
  return Buffer.from(even, "ascii");
}

function tinyDicom() {
  const version = element(0x0002, 0x0001, "OB", Buffer.from([0x00, 0x01]));
  const sopClass = element(0x0002, 0x0002, "UI", text("UI", "1.2.840.10008.5.1.4.1.1.7"));
  const sopUid = element(0x0002, 0x0003, "UI", text("UI", "1.2.3.4.5.6.7.8"));
  const syntax = element(0x0002, 0x0010, "UI", text("UI", "1.2.840.10008.1.2.1"));
  const impl = element(0x0002, 0x0012, "UI", text("UI", "1.2.826.0.1.3680043.10.1"));
  const metaBody = Buffer.concat([version, sopClass, sopUid, syntax, impl]);
  const metaLen = element(0x0002, 0x0000, "UL", u32(metaBody.length));
  const pixels = Buffer.alloc(8);
  pixels.writeUInt16LE(10, 0);
  pixels.writeUInt16LE(10, 2);
  pixels.writeUInt16LE(4000, 4);
  pixels.writeUInt16LE(4000, 6);
  const dataset = Buffer.concat([
    element(0x0028, 0x0002, "US", u16(1)),
    element(0x0028, 0x0004, "CS", text("CS", "MONOCHROME2")),
    element(0x0028, 0x0010, "US", u16(2)),
    element(0x0028, 0x0011, "US", u16(2)),
    element(0x0028, 0x0100, "US", u16(16)),
    element(0x0028, 0x0101, "US", u16(16)),
    element(0x0028, 0x0102, "US", u16(15)),
    element(0x0028, 0x0103, "US", u16(0)),
    element(0x0028, 0x1050, "DS", text("CS", "2000")),
    element(0x0028, 0x1051, "DS", text("CS", "4000")),
    element(0x7fe0, 0x0010, "OW", pixels),
  ]);
  return Buffer.concat([Buffer.alloc(128), Buffer.from("DICM", "ascii"), metaLen, metaBody, dataset]);
}

describe("dicom", () => {
  it("windows samples around center and width", () => {
    const samples = Float32Array.from([0, 1000, 2000, 4000]);
    const gray = windowSamples(samples);
    expect(gray[0]).toBeLessThan(gray[3]);
  });

  it("decodes a tiny uncompressed DICOM into a brighter lower row", () => {
    const decoded = decodeDicom(new Uint8Array(tinyDicom()));
    expect(decoded.kind).toBe("raster");
    if (decoded.kind !== "raster") return;
    expect(decoded.raster.width).toBe(2);
    expect(decoded.raster.height).toBe(2);
    expect(decoded.raster.data[0]).toBeLessThan(decoded.raster.data[8]);
    expect(decoded.note).toMatch(/Uncompressed DICOM/);
  });
});
