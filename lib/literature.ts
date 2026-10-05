import type { Observation } from "@/lib/types";

export type LiteratureNote = {
  cite: string;
  url: string;
  text: string;
};

const SAHIWAL_THREADED = "https://doi.org/10.1067/mpr.2002.124430";
const SAHIWAL_MACRO = "https://doi.org/10.1067/mpr.2002.124432";
const SEWERIN_ANGLE = "https://doi.org/10.1034/j.1600-0501.1991.020102.x";
const SAGHIRI_REVIEW = "https://doi.org/10.1186/s42269-020-00471-0";
const IRS =
  "https://research.manchester.ac.uk/en/publications/identification-of-dental-implants-through-the-use-of-implant-reco/";

export function notesFor(input: {
  observation: Observation;
  leaderCompany: string | null;
  companySettled: boolean;
  runnerUp: string | null;
  /** True when the next company is within the same affinity band as the leader. */
  runnerClose: boolean;
}): LiteratureNote[] {
  const { observation } = input;
  const notes: LiteratureNote[] = [];

  if (observation.geometry === "angled") {
    notes.push({
      cite: "Sahiwal et al., J Prosthet Dent 2002; Sewerin, Clin Oral Implants Res 1991",
      url: SAHIWAL_THREADED,
      text: "Per the literature: threaded fixtures stayed recognizable only within about ±10° of vertical beam angulation. Near 20°, Sahiwal judged the same features unrecognizable, and Sewerin showed that thread images move with the beam. This film was marked angled, so the company is not called.",
    });
  }

  if (!input.companySettled && input.runnerUp && input.leaderCompany && input.runnerClose) {
    notes.push({
      cite: "Saghiri et al., Bull Natl Res Cent 2021",
      url: SAGHIRI_REVIEW,
      text: `Per the literature: a single periapical does not carry the three-dimensional seat that separates many lookalikes. ${input.leaderCompany} and ${input.runnerUp} stay as competing hypotheses.`,
    });
  } else if (!input.companySettled && input.leaderCompany && observation.geometry !== "angled") {
    notes.push({
      cite: "Saghiri et al., Bull Natl Res Cent 2021",
      url: SAGHIRI_REVIEW,
      text: "Per the literature: a single periapical does not carry the three-dimensional seat that separates many lookalikes. These cues are not enough to call the company.",
    });
  }

  if (observation.microgap === "subcrestal") {
    notes.push({
      cite: "Sahiwal et al., J Prosthet Dent 2002 (macro design)",
      url: SAHIWAL_MACRO,
      text: "Per the literature: the coronal third is read separately from the threads. A junction line apical to the crest is that coronal reading. In this library it supports Ankylos over a crestal bone-level cone, and only when you can see the line.",
    });
  } else if (observation.collar === "tulip") {
    notes.push({
      cite: "Sahiwal et al., J Prosthet Dent 2002",
      url: SAHIWAL_THREADED,
      text: "Per the literature: a flared coronal flange is a coronal-third identifier. In this catalog that flange is the Straumann tissue-level sign, not a wide abutment.",
    });
  } else if (observation.collar === "hyperbolic") {
    notes.push({
      cite: "Sahiwal et al., J Prosthet Dent 2002",
      url: SAHIWAL_THREADED,
      text: "Per the literature: flange direction is a coronal-third sign. A neck that narrows toward the crown is the opposite of a tulip flare.",
    });
  } else if (observation.thread === "knife" || observation.thread === "buttress" || observation.thread === "progressive") {
    notes.push({
      cite: "Sahiwal et al., J Prosthet Dent 2002 (macro design)",
      url: SAHIWAL_MACRO,
      text: "Per the literature: midbody thread form — V, square, or buttress, and here a knife blade or a thread that deepens apically — is a separate reading from taper.",
    });
  } else if (observation.body === "strong-taper") {
    notes.push({
      cite: "Sahiwal et al., J Prosthet Dent 2002; Sewerin, Clin Oral Implants Res 1991",
      url: SEWERIN_ANGLE,
      text: "Per the literature: tapered and non-tapered midbodies were separated on straight films. Beam angulation can counterfeit taper, so a strong taper alone does not name the company.",
    });
  }

  notes.push({
    cite: "Michelinakis, Sharrock, and Barclay, Int Dent J 2006",
    url: IRS,
    text: "Per the literature: Implant Recognition Software also asked for surface, diameter, and length. Those are catalog fields. This bench does not score them from a periapical.",
  });

  if (notes.length < 4) {
    notes.push({
      cite: "Sahiwal et al., J Prosthet Dent 2002",
      url: SAHIWAL_THREADED,
      text: "Per the literature: read the fixture in thirds — coronal flange and junction, midbody thread and taper, then the apex. The crop bands follow that order.",
    });
  }

  return notes.slice(0, 4);
}
