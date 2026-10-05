import { phraseFor } from "@/lib/labels";
import { notesFor, type LiteratureNote } from "@/lib/literature";
import { getSystem, identityOf, SYSTEMS } from "@/lib/systems";
import {
  answeredCount,
  FEATURE_KEYS,
  type FeatureKey,
  type ImplantSystem,
  type Observation,
} from "@/lib/types";

export const CONFIDENCE_CAP = 0.92;

export const WEIGHTS: Record<FeatureKey, number> = {
  collar: 3.4,
  connection: 2.6,
  thread: 2.5,
  body: 1.7,
  apex: 1.6,
  platformSwitch: 1.2,
  lead: 1.1,
  microgap: 1.8,
};

const INTERNAL_FAMILY = new Set([
  "internal-hex",
  "internal-conical",
  "internal-octagon",
  "tube-in-tube",
]);

export type FeatureNote = {
  feature: FeatureKey;
  value: string;
  label: string;
  phrase: string;
  kind: "match" | "weak" | "miss";
};

export type RankedSystem = {
  system: ImplantSystem;
  affinity: number;
  confidence: number;
  signature: number;
  matches: FeatureNote[];
  contradictions: FeatureNote[];
  why: string;
  whyNot: string[];
};

export type RankedBrand = {
  company: string;
  manufacturer: string | null;
  affinity: number;
  confidence: number;
  companySettled: boolean;
  lineSettled: boolean;
  systems: RankedSystem[];
  why: string;
  whyNot: string[];
};

export type RankResult = {
  brands: RankedBrand[];
  ranked: RankedSystem[];
  answered: number;
  noEvidence: boolean;
  evidence: "none" | "thin" | "partial" | "supported";
  clusterNote: string | null;
  literature: LiteratureNote[];
};

type Scored = {
  system: ImplantSystem;
  affinity: number;
  signature: number;
  matches: FeatureNote[];
  contradictions: FeatureNote[];
  signatureNotes: string[];
};

function judge(
  feature: FeatureKey,
  observed: string,
  accepts: readonly string[],
): "skip" | "match" | "weak" | "miss" {
  if (observed === "unknown") return "skip";
  if (feature === "connection" && observed === "internal-unspecified") {
    return accepts.some((value) => INTERNAL_FAMILY.has(value)) ? "weak" : "miss";
  }
  return accepts.includes(observed) ? "match" : "miss";
}

export function scoreSystem(system: ImplantSystem, observation: Observation): Scored {
  let earned = 0;
  let possible = 0;
  const matches: FeatureNote[] = [];
  const contradictions: FeatureNote[] = [];

  for (const feature of FEATURE_KEYS) {
    const observed = observation[feature];
    const verdict = judge(feature, observed, system.accepts[feature]);
    if (verdict === "skip") continue;
    const weight = WEIGHTS[feature];
    possible += weight;
    const note: FeatureNote = {
      feature,
      value: observed,
      label: phraseFor(feature, observed),
      phrase: phraseFor(feature, observed),
      kind: verdict,
    };
    if (verdict === "match") {
      earned += weight;
      matches.push(note);
    } else if (verdict === "weak") {
      earned += weight * 0.42;
      matches.push(note);
    } else {
      contradictions.push(note);
    }
  }

  let signature = 0;
  const signatureNotes: string[] = [];
  for (const rule of system.signatures) {
    const hit = rule.all.every((part) => observation[part.feature] === part.value);
    if (hit) {
      signature += rule.boost;
      signatureNotes.push(rule.note);
    }
  }

  const base = possible === 0 ? 0 : earned / possible;
  const affinity = clamp(base + signature / (possible + 6), 0, 1);

  return { system, affinity, signature, matches, contradictions, signatureNotes };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function confidenceFor(
  affinity: number,
  index: number,
  leader: number,
  second: number | null,
  answered: number,
  twinTight: boolean,
): number {
  let confidence = 0.18 + 0.74 * affinity;
  if (answered < 2) confidence = Math.min(confidence, 0.34);
  else if (answered < 3) confidence = Math.min(confidence, 0.52);
  else if (answered < 4) confidence = Math.min(confidence, 0.74);

  if (index === 0 && second != null) {
    const gap = leader - second;
    if (gap < 0.05) confidence *= 0.68;
    else if (gap < 0.1) confidence *= 0.78;
    else if (gap < 0.18) confidence *= 0.88;
  }
  if (twinTight && index < 2) confidence = Math.min(confidence, 0.6);
  if (index > 0) confidence = Math.min(confidence, 0.16 + 0.7 * affinity);
  return clamp(confidence, 0.04, CONFIDENCE_CAP);
}

function whyText(scored: Scored): string {
  if (scored.matches.length === 0) {
    return "None of the marked cues fit this system. It is listed only so a near-miss stays visible.";
  }
  const cues = scored.matches.map((match) => match.phrase).join("; ");
  const extra = scored.signatureNotes.length ? ` ${scored.signatureNotes.join(" ")}` : "";
  return `Fits ${cues}.${extra}`;
}

export function rankSystems(
  observation: Observation,
  systems: ImplantSystem[] = SYSTEMS,
  limit = 5,
): RankResult {
  const answered = answeredCount(observation);
  if (answered === 0) {
    return {
      brands: [],
      ranked: [],
      answered: 0,
      noEvidence: true,
      evidence: "none",
      clusterNote: "Mark at least one radiographic cue. With nothing marked, every system is equally possible.",
      literature: [],
    };
  }

  const scored = systems
    .map((system) => scoreSystem(system, observation))
    .sort((a, b) => {
      if (b.affinity !== a.affinity) return b.affinity - a.affinity;
      if (b.signature !== a.signature) return b.signature - a.signature;
      return a.system.brand.localeCompare(b.system.brand) || a.system.id.localeCompare(b.system.id);
    });

  const leader = scored[0];
  const second = scored[1] ?? null;
  const twinTight = Boolean(
    second &&
      leader.system.twins.includes(second.system.id) &&
      Math.abs(leader.affinity - second.affinity) < 0.04,
  );

  const presented: RankedSystem[] = scored.map((entry, index) => {
    const peers = scored.filter((other) => other.system.id !== entry.system.id);
    const whyNot: string[] = entry.contradictions.map(
      (note) => `Does not fit ${note.phrase}.`,
    );
    if (index === 0) {
      for (const confuser of entry.system.confusers) {
        whyNot.push(confuser.note);
      }
    }
    for (const other of peers.slice(0, 3)) {
      if (index > 0 && other.system.id !== leader.system.id) continue;
      const already = entry.system.confusers.some((item) => item.id === other.system.id);
      if (already && index === 0) continue;
      if (index === 0 && entry.affinity - other.affinity > 0.28) continue;
      if (other.contradictions.length === 0 && Math.abs(entry.affinity - other.affinity) < 0.04) {
        whyNot.push(
          `${other.system.brand} ${other.system.system} fits the same cues. A single periapical does not separate them.`,
        );
      } else if (index === 0 && other.affinity > entry.affinity - 0.28 && other.contradictions.length) {
        whyNot.push(
          `${other.system.brand} ${other.system.system} stays close. It does not fit ${other.contradictions
            .map((note) => note.phrase)
            .join("; ")}.`,
        );
      }
    }
    if (twinTight && index < 2 && second) {
      const other = index === 0 ? second.system : leader.system;
      whyNot.unshift(
        `${entry.system.brand} ${entry.system.system} and ${other.brand} ${other.system} are a radiographic pair. Do not pick one from this film alone.`,
      );
    }

    return {
      system: entry.system,
      affinity: entry.affinity,
      confidence: confidenceFor(
        entry.affinity,
        index,
        leader.affinity,
        second?.affinity ?? null,
        answered,
        twinTight,
      ),
      signature: entry.signature,
      matches: entry.matches,
      contradictions: entry.contradictions,
      why: whyText(entry),
      whyNot: dedupe(whyNot).slice(0, 4),
    };
  });

  const ranked = presented.slice(0, limit);
  const { brands, note: brandNote } = rollupBrands(scored, new Map(presented.map((row) => [row.system.id, row])), answered);

  const near = scored.filter((entry) => leader.affinity - entry.affinity <= 0.08).length;
  let evidence: RankResult["evidence"] = "supported";
  if (answered < 3 || leader.affinity < 0.45) evidence = "thin";
  else if (
    leader.affinity < 0.72 ||
    (second && leader.affinity - second.affinity < 0.1) ||
    near >= 3 ||
    (brands[0] && !brands[0].companySettled)
  ) {
    evidence = "partial";
  }

  let clusterNote: string | null = null;
  if (brandNote) {
    clusterNote = brandNote;
  } else if (twinTight && second) {
    clusterNote = `${leader.system.brand} ${leader.system.system} and ${second.system.brand} ${second.system.system} cannot be separated on these cues.`;
  } else if (near >= 3) {
    clusterNote =
      "Three or more systems fit these cues about equally. Treat the list as a differential, then check the record or flag it.";
  } else if (evidence === "thin") {
    clusterNote = "Too few cues, or none of the library fits cleanly. Browse the library or flag the case.";
  }

  const distinctive = new Set(["tulip", "hyperbolic", "knife", "subcrestal", "tube-in-tube", "external-hex"]);
  const leaderCues = new Set(
    (brands[0]?.systems[0]?.matches ?? [])
      .filter((note) => note.kind === "match" && distinctive.has(note.value))
      .map((note) => `${note.feature}:${note.value}`),
  );
  for (const brand of brands.slice(1)) {
    const missed = brand.systems[0]?.contradictions.some((note) => leaderCues.has(`${note.feature}:${note.value}`));
    if (missed) brand.confidence = Math.min(brand.confidence, 0.42);
  }

  const angled = observation.geometry === "angled";
  if (angled) {
    for (const brand of brands) {
      brand.confidence = clamp(brand.confidence * 0.75, 0.04, 0.62);
      brand.companySettled = false;
    }
    if (evidence === "supported") evidence = "partial";
    const angledNote =
      "The film was marked angled. Per Sahiwal, features near a 20° vertical tilt were not reliable, so the company is not called.";
    clusterNote = clusterNote ? `${angledNote} ${clusterNote}` : angledNote;
  }

  const literature = notesFor({
    observation,
    leaderCompany: brands[0]?.company ?? null,
    companySettled: brands[0]?.companySettled ?? false,
    runnerUp: brands[1]?.company ?? null,
    runnerClose: Boolean(brands[0] && brands[1] && brands[0].affinity - brands[1].affinity < 0.08),
  });

  return {
    brands,
    ranked,
    answered,
    noEvidence: false,
    evidence,
    clusterNote,
    literature,
  };
}

function sharesTwin(left: Scored[], right: Scored[]): boolean {
  for (const a of left) {
    for (const b of right) {
      const linked = a.system.twins.includes(b.system.id) || b.system.twins.includes(a.system.id);
      if (linked && Math.abs(a.affinity - b.affinity) < 0.06) return true;
    }
  }
  return false;
}

function brandConfidence(
  affinity: number,
  index: number,
  gap: number,
  answered: number,
  companySettled: boolean,
  lineSettled: boolean,
  crossTwin: boolean,
): number {
  let confidence = 0.18 + 0.74 * affinity;
  if (answered < 2) confidence = Math.min(confidence, 0.34);
  else if (answered < 3) confidence = Math.min(confidence, 0.52);
  else if (answered < 4) confidence = Math.min(confidence, 0.74);

  if (index === 0) {
    if (gap < 0.05) confidence *= 0.62;
    else if (gap < 0.1) confidence *= 0.75;
    else if (gap < 0.18) confidence *= 0.86;
  }
  if (crossTwin && index < 2) confidence = Math.min(confidence, 0.55);
  if (index === 0 && !companySettled) confidence = Math.min(confidence, 0.6);
  if (companySettled && !lineSettled) confidence = Math.min(confidence, 0.8);
  if (index > 0) confidence = Math.min(confidence, 0.16 + 0.7 * affinity);
  return clamp(confidence, 0.04, CONFIDENCE_CAP);
}

function rollupBrands(
  scored: Scored[],
  presentedById: Map<string, RankedSystem>,
  answered: number,
): { brands: RankedBrand[]; note: string | null } {
  const groups = new Map<string, Scored[]>();
  for (const entry of scored) {
    const company = identityOf(entry.system).company;
    const list = groups.get(company) ?? [];
    list.push(entry);
    groups.set(company, list);
  }

  const ordered = [...groups.values()]
    .map((entries) =>
      entries.sort(
        (a, b) => b.affinity - a.affinity || a.system.system.localeCompare(b.system.system),
      ),
    )
    .sort((a, b) => {
      if (b[0].affinity !== a[0].affinity) return b[0].affinity - a[0].affinity;
      if (b[0].signature !== a[0].signature) return b[0].signature - a[0].signature;
      return identityOf(a[0].system).company.localeCompare(identityOf(b[0].system).company);
    });

  const brands: RankedBrand[] = ordered.slice(0, 5).map((entries, index) => {
    const best = entries[0];
    const identity = identityOf(best.system);
    const nextGroup = ordered[index + 1] ?? [];
    const prevGroup = index > 0 ? (ordered[index - 1] ?? []) : [];
    const next = nextGroup[0] ?? null;
    const gap = next ? best.affinity - next.affinity : 1;
    const closeLines = entries.filter((entry, lineIndex) => lineIndex === 0 || best.affinity - entry.affinity <= 0.08);
    const lineSettled = closeLines.length === 1;
    const crossWithNext = nextGroup.length > 0 && gap < 0.06 && sharesTwin(entries, nextGroup);
    const crossWithPrev =
      prevGroup.length > 0 &&
      Math.abs(best.affinity - prevGroup[0].affinity) < 0.06 &&
      sharesTwin(entries, prevGroup);
    const crossTwin = crossWithNext || crossWithPrev;
    const near = ordered.filter((group) => best.affinity - group[0].affinity <= 0.08).length;
    const companySettled = index === 0 && answered >= 3 && !crossTwin && gap >= 0.08 && near < 3;
    const nextCompany = next ? identityOf(next.system).company : null;

    const whyNot: string[] = [];
    if (crossTwin && nextCompany && index < 2) {
      whyNot.push(
        `${identity.company} and ${nextCompany} are not separable on this film. Do not name the company, and do not order parts from it.`,
      );
    }
    for (const miss of best.contradictions) {
      whyNot.push(`Does not fit ${miss.phrase}.`);
    }
    if (index === 0) {
      for (const confuser of best.system.confusers) {
        const other = scored.find((entry) => entry.system.id === confuser.id);
        if (!other || identityOf(other.system).company === identity.company) continue;
        whyNot.push(confuser.note);
      }
    }
    if (index === 0 && next && nextCompany && gap < 0.28 && !crossTwin) {
      if (next.contradictions.length) {
        whyNot.push(
          `${nextCompany} stays in the differential. Its best line does not fit ${next.contradictions
            .map((miss) => miss.phrase)
            .join("; ")}.`,
        );
      } else if (gap < 0.08) {
        whyNot.push(`${nextCompany} fits the same cues. A single periapical does not name the company.`);
      }
    }

    let why = whyText(best);
    if (lineSettled) {
      why += ` Line these cues fit: ${best.system.system}.`;
    } else {
      why += ` Lines still open inside ${identity.company}: ${closeLines.map((entry) => entry.system.system).join(", ")}.`;
    }

    return {
      company: identity.company,
      manufacturer: identity.manufacturer,
      affinity: best.affinity,
      confidence: brandConfidence(best.affinity, index, gap, answered, companySettled, lineSettled, crossTwin),
      companySettled,
      lineSettled,
      systems: closeLines
        .map((entry) => presentedById.get(entry.system.id))
        .filter((row): row is RankedSystem => row != null),
      why,
      whyNot: dedupe(whyNot).slice(0, 4),
    };
  });

  const leader = brands[0];
  const second = brands[1];
  let note: string | null = null;
  if (leader && second && !leader.companySettled && leader.affinity - second.affinity < 0.06) {
    const cross = sharesTwin(
      ordered[0] ?? [],
      ordered[1] ?? [],
    );
    if (cross || leader.affinity - second.affinity < 0.04) {
      note = `${leader.company} and ${second.company} cannot be separated on this film. Do not name the company from these cues alone.`;
    }
  } else if (leader && !leader.lineSettled && answered >= 3) {
    const names = leader.systems.map((row) => row.system.system).join(" and ");
    note = `${names} cannot be separated on this film. The company these cues support is ${leader.company}. The line is not settled.`;
  }

  return { brands, note };
}

function dedupe(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    if (seen.has(line)) continue;
    seen.add(line);
    out.push(line);
  }
  return out;
}

export function canonicalObservation(system: ImplantSystem): Observation {
  return {
    collar: system.accepts.collar[0],
    connection: system.accepts.connection[0],
    body: system.accepts.body[0],
    thread: system.accepts.thread[0],
    apex: system.accepts.apex[0],
    platformSwitch: system.accepts.platformSwitch[0],
    lead: system.accepts.lead[0],
    microgap: system.accepts.microgap[0],
    geometry: "unknown",
  };
}

export function agreementPercent(confidence: number): number {
  return Math.min(92, Math.max(4, Math.round(confidence * 100)));
}

export function systemOrNull(id: string | null | undefined) {
  if (!id) return null;
  return getSystem(id) ?? null;
}
