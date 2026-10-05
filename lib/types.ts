export const COLLARS = [
  "bone-level",
  "machined-band",
  "microthread",
  "tulip",
  "hyperbolic",
] as const;
export type Collar = (typeof COLLARS)[number];

export const CONNECTIONS = [
  "external-hex",
  "internal-unspecified",
  "internal-hex",
  "internal-conical",
  "internal-octagon",
  "tube-in-tube",
  "subcrestal-conical",
] as const;
export type Connection = (typeof CONNECTIONS)[number];

export const BODIES = ["parallel", "mild-taper", "strong-taper"] as const;
export type Body = (typeof BODIES)[number];

export const THREADS = [
  "fine",
  "standard",
  "buttress",
  "coarse",
  "knife",
  "progressive",
] as const;
export type Thread = (typeof THREADS)[number];

export const APEXES = ["flat", "rounded", "pointed", "cutting"] as const;
export type Apex = (typeof APEXES)[number];

export const LEADS = ["single", "double", "triple", "variable"] as const;
export type Lead = (typeof LEADS)[number];

export const SWITCHES = ["yes", "no"] as const;
export type PlatformSwitch = (typeof SWITCHES)[number];

export const MICROGAPS = ["supracrestal", "crestal", "subcrestal"] as const;
export type Microgap = (typeof MICROGAPS)[number];

export const GEOMETRIES = ["orthogonal", "angled", "unknown"] as const;
export type FilmGeometry = (typeof GEOMETRIES)[number];

export const FEATURE_KEYS = [
  "collar",
  "microgap",
  "connection",
  "body",
  "thread",
  "apex",
  "platformSwitch",
  "lead",
] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type Observation = {
  collar: Collar | "unknown";
  connection: Connection | "unknown";
  body: Body | "unknown";
  thread: Thread | "unknown";
  apex: Apex | "unknown";
  platformSwitch: PlatformSwitch | "unknown";
  lead: Lead | "unknown";
  microgap: Microgap | "unknown";
  geometry: FilmGeometry;
};

export type FeatureValue = Observation[FeatureKey];

export type SchematicProfile = {
  collar: "none" | "machined" | "micro" | "tulip" | "hyperbolic";
  body: "parallel" | "mild" | "strong";
  thread: "fine" | "standard" | "buttress" | "coarse" | "knife" | "progressive";
  apex: "flat" | "round" | "point" | "vent";
  connection: "ext-hex" | "int-hex" | "cone" | "octagon" | "tube" | "subcrestal";
  platformSwitch: boolean;
};

export type EvidenceKind = "brochure" | "manual" | "paper" | "interpretation";

export type Source = {
  title: string;
  url: string;
  kind: EvidenceKind;
};

export type Signature = {
  all: { feature: FeatureKey; value: string }[];
  boost: number;
  note: string;
};

export type ImplantSystem = {
  id: string;
  brand: string;
  system: string;
  aliases: string[];
  summary: string;
  lookFor: string[];
  pitfalls: string[];
  accepts: {
    collar: Collar[];
    connection: Connection[];
    body: Body[];
    thread: Thread[];
    apex: Apex[];
    platformSwitch: PlatformSwitch[];
    lead: Lead[];
    microgap: Microgap[];
  };
  signatures: Signature[];
  twins: string[];
  confusers: { id: string; note: string }[];
  schematic: SchematicProfile;
  sources: Source[];
};

export function emptyObservation(): Observation {
  return {
    collar: "unknown",
    connection: "unknown",
    body: "unknown",
    thread: "unknown",
    apex: "unknown",
    platformSwitch: "unknown",
    lead: "unknown",
    microgap: "unknown",
    geometry: "unknown",
  };
}

export function answeredCount(observation: Observation): number {
  return FEATURE_KEYS.filter((key) => observation[key] !== "unknown").length;
}
