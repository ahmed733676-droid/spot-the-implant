import { DISTINCTIVE, hardCount, hasDistinctive, type EvidenceCue } from "@/lib/pipeline/extract";
import { scoreEvidence, type Scored } from "@/lib/pipeline/graph";
import type { RankedBrand, RankedSystem, RankResult } from "@/lib/pipeline/types";
import { identityOf } from "@/lib/systems";
import { shapeRankNudge } from "@/lib/twins/match";
import type { ShapeHit } from "@/lib/twins/types";
import type { ImplantSystem, Observation } from "@/lib/types";

const CONFIDENCE_CAP = 0.92;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

function withoutScore<T extends { rankScore: number }>(row: T): Omit<T, "rankScore"> {
  const copy = { ...row };
  delete (copy as { rankScore?: number }).rankScore;
  return copy;
}

function lineTitle(system: ImplantSystem): string {
  if (system.aliases.some((alias) => alias.toLowerCase() === "vetronix")) {
    return `${system.system} (also called Vetronix)`;
  }
  return system.system;
}

function whyText(scored: Scored): string {
  if (scored.matches.length === 0) {
    return "None of the marked cues fit this system. It is listed only so a near-miss stays visible.";
  }
  const cues = scored.matches
    .map((match) =>
      match.source === "accepted"
        ? `${match.phrase} (image, accepted)`
        : match.source === "vision"
          ? `${match.phrase} (image)`
          : match.phrase,
    )
    .join("; ");
  const extra = scored.signatureNotes.length ? ` ${scored.signatureNotes.join(" ")}` : "";
  return `Fits ${cues}.${extra}`;
}

function sharesTwin(left: Scored[], right: Scored[]): boolean {
  for (const a of left) {
    for (const b of right) {
      const linked = a.system.twins.includes(b.system.id) || b.system.twins.includes(a.system.id);
      if (linked && Math.abs(a.rankScore - b.rankScore) < 0.06) return true;
    }
  }
  return false;
}

/**
 * Near-ties share one percent. Later rows never display a higher percent than
 * the row above them. The old leader-only gap penalty made #1 show 21% while
 * the next card showed 34%.
 */
function monotonic<T extends { rankScore: number; confidence: number }>(rows: T[]) {
  let index = 0;
  while (index < rows.length) {
    let end = index + 1;
    while (end < rows.length && rows[index].rankScore - rows[end].rankScore < 0.02) end++;
    let shared = 0;
    for (let cursor = index; cursor < end; cursor++) shared = Math.max(shared, rows[cursor].confidence);
    for (let cursor = index; cursor < end; cursor++) rows[cursor].confidence = shared;
    index = end;
  }
  for (let cursor = 1; cursor < rows.length; cursor++) {
    if (rows[cursor].confidence > rows[cursor - 1].confidence) {
      rows[cursor].confidence = rows[cursor - 1].confidence;
    }
  }
}

function systemConfidence(
  affinity: number,
  index: number,
  answered: number,
  twinTight: boolean,
): number {
  let confidence = 0.18 + 0.74 * affinity;
  if (answered < 2) confidence = Math.min(confidence, 0.34);
  else if (answered < 3) confidence = Math.min(confidence, 0.52);
  else if (answered < 4) confidence = Math.min(confidence, 0.74);
  if (twinTight && index < 2) confidence = Math.min(confidence, 0.6);
  if (index > 0) confidence = Math.min(confidence, 0.16 + 0.7 * affinity);
  return clamp(confidence, 0.04, CONFIDENCE_CAP);
}

function brandConfidence(
  affinity: number,
  index: number,
  answered: number,
  companySettled: boolean,
  lineSettled: boolean,
  crossTwin: boolean,
): number {
  let confidence = 0.18 + 0.74 * affinity;
  if (answered < 2) confidence = Math.min(confidence, 0.34);
  else if (answered < 3) confidence = Math.min(confidence, 0.52);
  else if (answered < 4) confidence = Math.min(confidence, 0.74);
  if (crossTwin && index < 2) confidence = Math.min(confidence, 0.55);
  if (index === 0 && !companySettled) confidence = Math.min(confidence, 0.6);
  if (companySettled && !lineSettled) confidence = Math.min(confidence, 0.8);
  if (index > 0) confidence = Math.min(confidence, 0.16 + 0.7 * affinity);
  return clamp(confidence, 0.04, CONFIDENCE_CAP);
}

function compareScored(a: Scored, b: Scored): number {
  if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
  if (b.signature !== a.signature) return b.signature - a.signature;
  return a.system.brand.localeCompare(b.system.brand) || a.system.id.localeCompare(b.system.id);
}

/**
 * Layers 3 and 4 — company differential, then a line only when the film can separate it.
 * Twin pairs refuse the company. A generic tie is a flat band, not an alphabetical winner.
 * A vision-only distinctive cue can move a family up the list. It cannot settle the company.
 */
export function differentiate(input: {
  scored: Scored[];
  cues: readonly EvidenceCue[];
  observation: Observation;
  limit: number;
  shapeHits?: readonly ShapeHit[];
}): Omit<RankResult, "literature"> {
  const { observation, limit } = input;
  const answered = hardCount(input.cues);
  const shapeHits = input.shapeHits ?? [];
  const scored = [...input.scored].sort(compareScored);
  if (shapeHits.length > 0) {
    for (const entry of scored) {
      entry.rankScore += shapeRankNudge(entry.system.id, shapeHits);
      entry.affinity = Math.min(1, entry.rankScore);
    }
    scored.sort(compareScored);
  }
  const leader = scored[0];
  const second = scored[1] ?? null;

  if (!leader) {
    return {
      brands: [],
      ranked: [],
      answered,
      noEvidence: true,
      evidence: "none",
      flat: false,
      clusterNote: "Mark at least one radiographic cue. With nothing marked, every system is equally possible.",
      libraryUnsure: null,
      shapeAside: null,
    };
  }

  const twinTight = Boolean(
    second &&
      leader.system.twins.includes(second.system.id) &&
      Math.abs(leader.rankScore - second.rankScore) < 0.04,
  );

  const presented: (RankedSystem & { rankScore: number })[] = scored.map((entry, index) => {
    const peers = scored.filter((other) => other.system.id !== entry.system.id);
    const whyNot: string[] = entry.contradictions.map((note) => `Does not fit ${note.phrase}.`);
    if (index === 0) {
      for (const confuser of entry.system.confusers) whyNot.push(confuser.note);
    }
    for (const other of peers.slice(0, 3)) {
      if (index > 0 && other.system.id !== leader.system.id) continue;
      const already = entry.system.confusers.some((item) => item.id === other.system.id);
      if (already && index === 0) continue;
      if (index === 0 && entry.rankScore - other.rankScore > 0.28) continue;
      if (other.contradictions.length === 0 && Math.abs(entry.rankScore - other.rankScore) < 0.04) {
        whyNot.push(
          `${other.system.brand} ${other.system.system} fits the same cues. A single periapical does not separate them.`,
        );
      } else if (index === 0 && other.rankScore > entry.rankScore - 0.28 && other.contradictions.length) {
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
      rankScore: entry.rankScore,
      confidence: systemConfidence(entry.affinity, index, answered, twinTight),
      signature: entry.signature,
      matches: entry.matches,
      contradictions: entry.contradictions,
      why: whyText(entry),
      whyNot: dedupe(whyNot).slice(0, 4),
    };
  });

  const presentedById = new Map(presented.map((row) => [row.system.id, row]));
  const groups = new Map<string, Scored[]>();
  for (const entry of scored) {
    const company = identityOf(entry.system).company;
    const list = groups.get(company) ?? [];
    list.push(entry);
    groups.set(company, list);
  }

  const ordered = [...groups.values()]
    .map((entries) => [...entries].sort(compareScored))
    .sort((a, b) => {
      if (a[0].rankScore !== b[0].rankScore) return b[0].rankScore - a[0].rankScore;
      if (a[0].signature !== b[0].signature) return b[0].signature - a[0].signature;
      return identityOf(a[0].system).company.localeCompare(identityOf(b[0].system).company);
    });

  const distinctiveConfirmed = hasDistinctive(input.cues, "confirmed");
  const distinctiveImage = input.cues.some(
    (cue) => cue.source !== "confirmed" && DISTINCTIVE.has(cue.value),
  );
  const visionCarriesTheSplit = distinctiveImage && !distinctiveConfirmed;
  const anyDistinctive = distinctiveConfirmed || distinctiveImage;
  const tiedGroups = ordered.filter((group) => leader.rankScore - group[0].rankScore < 0.02);
  const flat = !anyDistinctive && tiedGroups.length >= 3;

  const draft: (RankedBrand & { rankScore: number })[] = ordered.map((entries, index) => {
    const best = entries[0];
    const identity = identityOf(best.system);
    const nextGroup = ordered[index + 1] ?? [];
    const prevGroup = index > 0 ? (ordered[index - 1] ?? []) : [];
    const next = nextGroup[0] ?? null;
    const gap = next ? best.rankScore - next.rankScore : 1;
    const closeLines = entries.filter(
      (entry, lineIndex) => lineIndex === 0 || best.rankScore - entry.rankScore <= 0.08,
    );
    const lineSettled = !flat && closeLines.length === 1;
    const crossWithNext = nextGroup.length > 0 && gap < 0.06 && sharesTwin(entries, nextGroup);
    const crossWithPrev =
      prevGroup.length > 0 &&
      Math.abs(best.rankScore - prevGroup[0].rankScore) < 0.06 &&
      sharesTwin(entries, prevGroup);
    const crossTwin = crossWithNext || crossWithPrev;
    const near = ordered.filter((group) => best.rankScore - group[0].rankScore <= 0.08).length;
    const companySettled =
      index === 0 &&
      answered >= 3 &&
      !crossTwin &&
      !flat &&
      !visionCarriesTheSplit &&
      gap >= 0.08 &&
      near < 3;
    const nextCompany = next ? identityOf(next.system).company : null;

    const whyNot: string[] = [];
    if (crossTwin && nextCompany && index < 2) {
      whyNot.push(
        `${identity.company} and ${nextCompany} are not separable on this film. Do not name the company, and do not order parts from it.`,
      );
    }
    for (const miss of best.contradictions) whyNot.push(`Does not fit ${miss.phrase}.`);
    if (index === 0) {
      for (const confuser of best.system.confusers) {
        const other = scored.find((entry) => entry.system.id === confuser.id);
        if (!other || identityOf(other.system).company === identity.company) continue;
        whyNot.push(confuser.note);
      }
    }
    if (index === 0 && next && nextCompany && gap < 0.28 && !crossTwin && !flat) {
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
      why += ` Line these cues fit: ${lineTitle(best.system)}.`;
    } else if (!flat) {
      why += ` Lines still open inside ${identity.company}: ${closeLines.map((entry) => lineTitle(entry.system)).join(", ")}.`;
    } else {
      why += ` ${identity.company} is in the shared set. These generic cues do not choose it.`;
    }

    return {
      company: identity.company,
      manufacturer: identity.manufacturer,
      affinity: best.affinity,
      rankScore: best.rankScore,
      confidence: brandConfidence(best.affinity, index, answered, companySettled, lineSettled, crossTwin),
      companySettled,
      lineSettled,
      systems: closeLines
        .map((entry) => presentedById.get(entry.system.id))
        .filter((row): row is RankedSystem & { rankScore: number } => row != null)
        .map((row) => withoutScore(row)),
      why,
      whyNot: dedupe(whyNot).slice(0, 4),
      shapeNote: null,
    };
  });

  const bestShape = shapeHits[0] ?? null;
  if (bestShape && bestShape.score >= 0.62 && bestShape.libraryId) {
    const matched = scored.find((entry) => entry.system.id === bestShape.libraryId);
    const company = matched ? identityOf(matched.system).company : null;
    for (const brand of draft) {
      if (company && brand.company === company) brand.shapeNote = bestShape.sentence;
    }
  }

  const leaderBrand = draft[0];
  const runnerBrand = draft[1];
  const leaderCues = new Set(
    (leaderBrand?.systems[0]?.matches ?? [])
      .filter((note) => note.kind === "match" && DISTINCTIVE.has(note.value))
      .map((note) => `${note.feature}:${note.value}`),
  );
  for (const brand of draft.slice(1)) {
    const missed = brand.systems[0]?.contradictions.some((note) => leaderCues.has(`${note.feature}:${note.value}`));
    if (missed) brand.confidence = Math.min(brand.confidence, 0.42);
  }

  let clusterNote: string | null = null;
  if (leaderBrand && runnerBrand && !leaderBrand.companySettled && leaderBrand.rankScore - runnerBrand.rankScore < 0.06) {
    const cross = sharesTwin(ordered[0] ?? [], ordered[1] ?? []);
    if (cross) {
      clusterNote = `${leaderBrand.company} and ${runnerBrand.company} cannot be separated on this film. Do not name the company from these cues alone.`;
    }
  }
  if (!clusterNote && flat) {
    const names = tiedGroups.map((group) => identityOf(group[0].system).company);
    const named = ["Ankylos", "MegaGen"].filter((name) => names.includes(name));
    const label = named.length >= 2 ? named.join(" and ") : names.slice(0, 4).join(", ");
    clusterNote = `These cues do not call a company. This is not a ranking. The shared set includes ${label}, among ${names.length} companies that fit the same generic cues.`;
  } else if (!clusterNote && leaderBrand && !leaderBrand.lineSettled && answered >= 3 && !flat) {
    const names = leaderBrand.systems.map((row) => lineTitle(row.system)).join(" and ");
    clusterNote = `${names} cannot be separated on this film. The company these cues support is ${leaderBrand.company}. The line is not settled.`;
  }

  const nearCount = scored.filter((entry) => leader.rankScore - entry.rankScore <= 0.08).length;
  let evidence: RankResult["evidence"] = "supported";
  if (answered < 3 || leader.affinity < 0.45 || flat) evidence = "thin";
  else if (
    leader.affinity < 0.72 ||
    (second && leader.rankScore - second.rankScore < 0.1) ||
    nearCount >= 3 ||
    (leaderBrand && !leaderBrand.companySettled)
  ) {
    evidence = "partial";
  }

  if (!clusterNote && nearCount >= 3 && !flat) {
    clusterNote =
      "Three or more systems fit these cues about equally. Treat the list as a differential, then check the record or flag it.";
  } else if (!clusterNote && evidence === "thin") {
    clusterNote = "Too few cues, or none of the library fits cleanly. Browse the library or flag the case.";
  }

  if (observation.geometry === "angled") {
    for (const brand of draft) {
      brand.confidence = clamp(brand.confidence * 0.75, 0.04, 0.62);
      brand.companySettled = false;
    }
    if (evidence === "supported") evidence = "partial";
    const angledNote =
      "The film was marked angled. Per Sahiwal, features near a 20° vertical tilt were not reliable, so the company is not called.";
    clusterNote = clusterNote ? `${angledNote} ${clusterNote}` : angledNote;
  }

  monotonic(draft);
  monotonic(presented);

  const brands: RankedBrand[] = draft.slice(0, Math.max(1, limit)).map((brand) => withoutScore(brand));
  const ranked: RankedSystem[] = presented.slice(0, limit).map((row) => withoutScore(row));
  const shapeOnCard = brands.some((brand) => brand.shapeNote);
  const shapeAside =
    bestShape && bestShape.score >= 0.62 && bestShape.libraryId && !shapeOnCard ? bestShape.sentence : null;
  const libraryUnsure = unsureLibrary({
    cues: input.cues,
    scored,
    leader,
    second,
    flat,
    affinity: leader.affinity,
  });

  return {
    brands,
    ranked,
    answered,
    noEvidence: false,
    evidence,
    flat,
    clusterNote,
    libraryUnsure,
    shapeAside,
  };
}

function confirmedMisses(entry: Scored, cues: readonly EvidenceCue[]): number {
  return cues.filter(
    (cue) =>
      cue.source === "confirmed" &&
      entry.contradictions.some((note) => note.feature === cue.feature && note.value === cue.value),
  ).length;
}

/**
 * Open set. The top two stay visible. This only says the library may not contain the fixture.
 */
function unsureLibrary(input: {
  cues: readonly EvidenceCue[];
  scored: Scored[];
  leader: Scored;
  second: Scored | null;
  flat: boolean;
  affinity: number;
}): { reason: string } | null {
  const confirmed = input.cues.filter((cue) => cue.source === "confirmed");
  if (confirmed.length >= 2 && input.second) {
    const shared = confirmed.filter(
      (cue) => confirmedMisses(input.leader, [cue]) === 1 && confirmedMisses(input.second as Scored, [cue]) === 1,
    );
    if (shared.length >= 2) {
      return {
        reason:
          "Not in library / unsure. The two closest names both contradict cues you confirmed, so this fixture may sit outside the 26 systems.",
      };
    }
  }
  if (confirmed.length >= 3 && input.scored.length > 0) {
    const fewestMisses = Math.min(...input.scored.map((entry) => confirmedMisses(entry, confirmed)));
    if (fewestMisses >= 2) {
      return {
        reason:
          "Not in library / unsure. Every system in this library contradicts at least two cues you confirmed, so the fixture may sit outside the 26 systems.",
      };
    }
  }
  if (confirmed.length >= 1 && confirmedMisses(input.leader, confirmed) === confirmed.length) {
    return {
      reason:
        "Not in library / unsure. None of the cues you confirmed fit the closest system in this library.",
    };
  }
  if (confirmed.length >= 2 && input.affinity < 0.4 && confirmedMisses(input.leader, confirmed) >= 1) {
    return {
      reason:
        "Not in library / unsure. The best agreement with this library is weak, so do not treat the two names as a match.",
    };
  }
  if (
    !input.flat &&
    input.second &&
    input.leader.rankScore - input.second.rankScore < 0.05 &&
    !sharesTwin([input.leader], [input.second]) &&
    input.leader.contradictions.some((note) => DISTINCTIVE.has(note.value)) &&
    input.second.contradictions.some((note) => DISTINCTIVE.has(note.value))
  ) {
    return {
      reason:
        "Not in library / unsure. The top two names conflict on a distinctive cue and neither pulls away. The fixture may be outside this library.",
    };
  }
  return null;
}

export function scoreCatalog(systems: readonly ImplantSystem[], cues: readonly EvidenceCue[]): Scored[] {
  return systems.map((system) => scoreEvidence(system, cues));
}
