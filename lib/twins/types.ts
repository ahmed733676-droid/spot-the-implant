export type MeasureStatus = "catalog" | "estimated";

/**
 * A millimetre or ratio used to draw a twin.
 * `catalog` means the number is quoted from the source on this twin.
 * `estimated` means the drawing needed a number the source did not give. The range is the band that number was taken from.
 */
export type Measured = {
  value: number;
  unit: "mm" | "ratio" | "count";
  status: MeasureStatus;
  range?: readonly [number, number];
  note: string;
};

export type ThreadProfile = "v" | "buttress" | "reverse-buttress" | "knife";
export type CollarShape = "none" | "tulip" | "machined" | "microthread";
export type ApexShape = "round" | "point" | "flat" | "cutting";

export type TwinSpec = {
  id: string;
  /** Library system this silhouette may support. Null when the shape is not one of the 26. */
  libraryId: string | null;
  name: string;
  source: { title: string; url: string };
  /** Shown wherever a picture of this twin is shown. */
  approximation: string;
  length: Measured;
  coronalDiameter: Measured;
  apicalDiameter: Measured;
  pitch: Measured;
  threadDepth: Measured;
  leads: Measured;
  threadProfile: ThreadProfile;
  threadNote: string;
  collar: CollarShape;
  collarHeight: Measured;
  apex: ApexShape;
  /** How much narrower the platform is than the threaded body, in millimetres of diameter. */
  platformInset: Measured;
  /** Thread depth grows toward the apex. Ankylos is the catalog case. */
  progressive: boolean;
};

export type TwinPose = {
  lengthMm: number;
  diameterMm: number;
  /** Lean in the film plane, degrees clockwise from vertical. */
  mdDeg: number;
  /** Lean toward or away from the beam, degrees. */
  blDeg: number;
  /** Rotation about the long axis, degrees. */
  spinDeg: number;
};

export type ShapeHit = {
  systemId: string;
  libraryId: string | null;
  name: string;
  score: number;
  pose: TwinPose;
  sentence: string;
};
