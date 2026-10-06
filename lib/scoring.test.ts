import { describe, expect, it } from "vitest";
import { agreementPercent, canonicalObservation, CONFIDENCE_CAP, rankSystems } from "@/lib/scoring";
import { identityOf, SYSTEMS } from "@/lib/systems";
import { emptyObservation, type FeatureKey, type Observation } from "@/lib/types";

function observe(partial: Partial<Observation>): Observation {
  return { ...emptyObservation(), ...partial };
}

describe("rankSystems", () => {
  it("returns no ranking when every cue is unmarked", () => {
    const result = rankSystems(emptyObservation());
    expect(result.noEvidence).toBe(true);
    expect(result.ranked).toHaveLength(0);
    expect(result.evidence).toBe("none");
  });

  it("puts Straumann Tissue Level first for a tulip collar", () => {
    const result = rankSystems(
      observe({
        collar: "tulip",
        connection: "internal-octagon",
        body: "parallel",
        thread: "standard",
        apex: "rounded",
        platformSwitch: "no",
        lead: "single",
      }),
    );
    expect(result.ranked[0]?.system.id).toBe("straumann-tl");
    expect(result.ranked[0]?.why.toLowerCase()).toContain("tulip");
    expect(result.ranked[0]?.confidence).toBeGreaterThan(0.7);
    expect(result.ranked[0]?.confidence).toBeLessThanOrEqual(CONFIDENCE_CAP);
    expect(result.ranked[1]?.system.id).not.toBe("straumann-tl");
  });

  it("puts AnyRidge first for a knife thread", () => {
    const result = rankSystems(
      observe({
        collar: "bone-level",
        thread: "knife",
        body: "strong-taper",
        apex: "rounded",
      }),
    );
    expect(result.ranked[0]?.system.id).toBe("megagen-anyridge");
    expect(result.ranked[0]?.why.toLowerCase()).toContain("knife");
  });

  it("puts Ankylos first for a progressive thread and a subcrestal cone", () => {
    const result = rankSystems(
      observe({
        collar: "bone-level",
        connection: "subcrestal-conical",
        thread: "progressive",
        body: "mild-taper",
        apex: "rounded",
        lead: "single",
        platformSwitch: "yes",
      }),
    );
    expect(result.ranked[0]?.system.id).toBe("ankylos");
    expect(result.evidence).toBe("supported");
  });

  it("puts Prama first for a convergent neck and explains the tulip differential", () => {
    const result = rankSystems(
      observe({
        collar: "hyperbolic",
        connection: "internal-hex",
        body: "parallel",
        thread: "standard",
        apex: "rounded",
        lead: "single",
      }),
    );
    expect(result.ranked[0]?.system.id).toBe("prama");
    expect(result.ranked[0]?.whyNot.join(" ")).toMatch(/flares|Tissue Level/i);
  });

  it("separates NobelActive from BLX on apex and lead", () => {
    const result = rankSystems(
      observe({
        collar: "bone-level",
        connection: "internal-conical",
        body: "strong-taper",
        thread: "coarse",
        apex: "pointed",
        platformSwitch: "yes",
        lead: "double",
      }),
    );
    expect(result.ranked[0]?.system.id).toBe("nobel-active");
    expect(result.ranked[0]?.whyNot.join(" ")).toMatch(/BLX|Helix|apex/i);
    expect(result.ranked.map((row) => row.system.id)).not.toContain("straumann-tl");
  });

  it("ranks BLX ahead of double-lead tapers when pitch is variable", () => {
    const result = rankSystems(
      observe({
        collar: "bone-level",
        connection: "internal-conical",
        body: "strong-taper",
        thread: "coarse",
        apex: "cutting",
        platformSwitch: "yes",
        lead: "variable",
      }),
    );
    expect(result.ranked[0]?.system.id).toBe("straumann-blx");
  });

  it("prefers Brånemark for a fine parallel external hex and Southern for a coarse one", () => {
    const classic = rankSystems(
      observe({
        collar: "machined-band",
        connection: "external-hex",
        body: "parallel",
        thread: "fine",
        apex: "flat",
        platformSwitch: "no",
        lead: "single",
      }),
    );
    const coarse = rankSystems(
      observe({
        collar: "bone-level",
        connection: "external-hex",
        body: "strong-taper",
        thread: "coarse",
        apex: "rounded",
        platformSwitch: "no",
        lead: "single",
      }),
    );
    expect(classic.ranked[0]?.system.id).toBe("nobel-branemark");
    expect(coarse.ranked[0]?.system.id).toBe("southern-external");
    expect(classic.ranked[0]?.whyNot.join(" ")).toMatch(/Southern/i);
  });

  it("keeps Astra ahead of Implantium when the seat is conical", () => {
    const result = rankSystems(
      observe({
        collar: "microthread",
        connection: "internal-conical",
        body: "mild-taper",
        thread: "standard",
        apex: "rounded",
        platformSwitch: "yes",
        lead: "single",
      }),
    );
    const top = result.ranked.slice(0, 2).map((row) => row.system.id).sort();
    expect(top).toEqual(["astra-ev", "astra-tx"]);
    expect(result.clusterNote).toMatch(/cannot be separated/i);
    expect(result.ranked[0]?.confidence).toBeLessThanOrEqual(0.6);
  });

  it("does not split Osstem TS III from Hiossen ET III", () => {
    const result = rankSystems(canonicalObservation(SYSTEMS.find((system) => system.id === "osstem-tsiii")!));
    const top = result.ranked.slice(0, 2).map((row) => row.system.id).sort();
    expect(top).toEqual(["hiossen-etiii", "osstem-tsiii"]);
    expect(result.ranked[0]?.whyNot.join(" ")).toMatch(/radiographic pair/i);
  });

  it("treats an unclear internal seat as weak evidence, not a contradiction", () => {
    const result = rankSystems(
      observe({
        collar: "microthread",
        connection: "internal-unspecified",
        body: "mild-taper",
      }),
    );
    expect(result.ranked[0]?.system.id).toMatch(/astra|dentium-implantium/);
    const astra = result.ranked.find((row) => row.system.id === "astra-tx");
    expect(astra?.contradictions.some((note) => note.feature === "connection")).toBe(false);
  });

  it("caps displayed agreement at 92 percent", () => {
    for (const system of SYSTEMS) {
      const result = rankSystems(canonicalObservation(system));
      for (const row of result.ranked) {
        expect(row.confidence).toBeLessThanOrEqual(CONFIDENCE_CAP);
        expect(agreementPercent(row.confidence)).toBeLessThanOrEqual(92);
        expect(agreementPercent(row.confidence)).toBeGreaterThan(0);
      }
    }
  });

  it("caps a single cue below a supported call", () => {
    const result = rankSystems(observe({ collar: "tulip" }));
    expect(result.ranked[0]?.system.id).toBe("straumann-tl");
    expect(result.ranked[0]?.confidence).toBeLessThanOrEqual(0.34);
    expect(result.evidence).toBe("thin");
  });

  it("lifts Camlog when tube-in-tube is marked", () => {
    const result = rankSystems(
      observe({
        connection: "tube-in-tube",
        collar: "bone-level",
        body: "strong-taper",
        thread: "coarse",
        apex: "rounded",
        lead: "single",
        platformSwitch: "no",
      }),
    );
    expect(result.ranked[0]?.system.id).toBe("camlog-progressive");
  });

  it("puts each library system first, or its declared twin, on its own canonical cues", () => {
    for (const system of SYSTEMS) {
      const result = rankSystems(canonicalObservation(system));
      const winner = result.ranked[0]?.system.id;
      const allowed = new Set([system.id, ...system.twins]);
      expect(allowed.has(winner ?? ""), `${system.id} ranked ${winner}`).toBe(true);
    }
  });

  it("names the company first, and the line only when the film can settle it", () => {
    const tulip = rankSystems(
      observe({
        collar: "tulip",
        connection: "internal-octagon",
        body: "parallel",
        thread: "standard",
        apex: "rounded",
        platformSwitch: "no",
        lead: "single",
      }),
    );
    expect(tulip.brands[0]?.company).toBe("Straumann");
    expect(tulip.brands[0]?.lineSettled).toBe(true);
    expect(tulip.brands[0]?.companySettled).toBe(true);
    expect(tulip.brands[0]?.systems[0]?.system.id).toBe("straumann-tl");
    expect(tulip.brands[0]?.confidence).toBeGreaterThan(0.7);
    expect(tulip.brands[0]?.confidence).toBeLessThanOrEqual(CONFIDENCE_CAP);
    for (const brand of tulip.brands.slice(1)) {
      expect(brand.confidence).toBeLessThanOrEqual(0.42);
    }
    expect(tulip.brands[1]?.companySettled).not.toBe(true);

    const astra = rankSystems(
      observe({
        collar: "microthread",
        connection: "internal-conical",
        body: "mild-taper",
        thread: "standard",
        apex: "rounded",
        platformSwitch: "yes",
        lead: "single",
      }),
    );
    expect(astra.brands[0]?.company).toBe("Astra Tech");
    expect(astra.brands[0]?.manufacturer).toBe("Dentsply Sirona");
    expect(astra.brands[0]?.lineSettled).toBe(false);
    expect(astra.brands[0]?.companySettled).toBe(true);
    expect(astra.brands[0]?.confidence).toBeGreaterThan(0.6);
    expect(astra.brands[0]?.confidence).toBeLessThanOrEqual(0.8);
    expect(astra.brands[0]?.systems.map((row) => row.system.id).sort()).toEqual(["astra-ev", "astra-tx"]);
    expect(astra.clusterNote).toMatch(/Astra Tech/i);

    const ankylos = rankSystems(canonicalObservation(SYSTEMS.find((system) => system.id === "ankylos")!));
    expect(ankylos.brands[0]?.company).toBe("Ankylos");
    expect(ankylos.brands[0]?.manufacturer).toBe("Dentsply Sirona");
    expect(ankylos.brands[0]?.company).not.toBe("Astra Tech");

    const zimmer = rankSystems(canonicalObservation(SYSTEMS.find((system) => system.id === "zimmer-tsv")!));
    expect(zimmer.brands[0]?.company).toBe("Zimmer Biomet");
    expect(zimmer.brands[0]?.manufacturer).toBe("ZimVie");
  });

  it("refuses a company call when two manufacturers share the look", () => {
    const pair = rankSystems(canonicalObservation(SYSTEMS.find((system) => system.id === "osstem-tsiii")!));
    const names = pair.brands.slice(0, 2).map((brand) => brand.company).sort();
    expect(names).toEqual(["Hiossen", "Osstem"]);
    expect(pair.brands[0]?.companySettled).toBe(false);
    expect(pair.brands[1]?.companySettled).toBe(false);
    expect(pair.brands[0]?.confidence).toBeLessThanOrEqual(0.55);
    expect(pair.brands[1]?.confidence).toBeLessThanOrEqual(0.55);
    expect(pair.clusterNote).toMatch(/do not name the company/i);

    const generic = rankSystems(
      observe({
        collar: "bone-level",
        connection: "internal-conical",
        body: "parallel",
        thread: "standard",
        apex: "rounded",
        platformSwitch: "yes",
        lead: "single",
      }),
    );
    expect(generic.brands[0]?.companySettled).toBe(false);
    expect(generic.brands[0]?.confidence).toBeLessThanOrEqual(0.6);
    expect(generic.brands.slice(0, 2).map((brand) => brand.company).sort()).toEqual([
      "Nobel Biocare",
      "Straumann",
    ]);
    expect(generic.literature.some((note) => /competing hypotheses/i.test(note.text))).toBe(true);
  });

  it("reads a subcrestal junction as an Ankylos company cue and cites the coronal third", () => {
    const result = rankSystems(
      observe({
        collar: "bone-level",
        microgap: "subcrestal",
        connection: "subcrestal-conical",
        body: "mild-taper",
        thread: "progressive",
        apex: "rounded",
        lead: "single",
        platformSwitch: "yes",
      }),
    );
    expect(result.brands[0]?.company).toBe("Ankylos");
    expect(result.literature.some((note) => /per the literature/i.test(note.text) && /subcrestal|Ankylos/i.test(note.text))).toBe(
      true,
    );
    expect(result.literature.every((note) => note.url.startsWith("https://"))).toBe(true);
  });

  it("refuses to settle the company when the film is marked angled", () => {
    const straight = rankSystems(
      observe({
        collar: "tulip",
        connection: "internal-octagon",
        body: "parallel",
        thread: "standard",
        apex: "rounded",
        platformSwitch: "no",
        lead: "single",
        microgap: "supracrestal",
        geometry: "orthogonal",
      }),
    );
    const angled = rankSystems(
      observe({
        collar: "tulip",
        connection: "internal-octagon",
        body: "parallel",
        thread: "standard",
        apex: "rounded",
        platformSwitch: "no",
        lead: "single",
        microgap: "supracrestal",
        geometry: "angled",
      }),
    );
    expect(angled.brands[0]?.company).toBe("Straumann");
    expect(angled.brands[0]?.companySettled).toBe(false);
    expect(angled.brands[0]?.confidence).toBeLessThanOrEqual(0.62);
    expect(angled.brands[0]?.confidence).toBeLessThan(straight.brands[0]?.confidence ?? 1);
    expect(angled.clusterNote).toMatch(/angled/i);
    expect(angled.literature[0]?.text).toMatch(/per the literature/i);
  });

  it("keeps a single distinctive cue from looking like a company call", () => {
    const result = rankSystems(observe({ collar: "tulip" }));
    expect(result.brands[0]?.company).toBe("Straumann");
    expect(result.brands[0]?.companySettled).toBe(false);
    expect(result.brands[0]?.confidence).toBeLessThanOrEqual(0.34);
    expect(result.literature.some((note) => /Ankylos/.test(note.text))).toBe(false);
    expect(result.literature.some((note) => /not enough to call the company/i.test(note.text))).toBe(true);
  });

  it("lets every canonical film name its company, or the twin company", () => {
    for (const system of SYSTEMS) {
      const result = rankSystems(canonicalObservation(system));
      const winner = result.brands[0]?.company;
      const allowed = new Set([
        identityOf(system).company,
        ...system.twins.map((id) => identityOf(SYSTEMS.find((item) => item.id === id)!).company),
      ]);
      expect(allowed.has(winner ?? ""), `${system.id} named ${winner}`).toBe(true);
      for (const brand of result.brands) {
        expect(brand.confidence).toBeLessThanOrEqual(CONFIDENCE_CAP);
      }
    }
  });

  it("keeps confidence ordered with the leader", () => {
    const result = rankSystems(canonicalObservation(SYSTEMS[0]));
    const scores = result.ranked.map((row) => row.confidence);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1] + 0.02);
    }
  });

  it("does not crown Ankylos from a mild taper, and keeps the percents monotonic", () => {
    const result = rankSystems(observe({ body: "mild-taper" }));
    expect(result.flat).toBe(true);
    expect(result.brands.every((brand) => brand.companySettled === false)).toBe(true);
    expect(result.clusterNote).toMatch(/not a ranking|not called/i);
    expect(result.clusterNote).toMatch(/Ankylos/);
    expect(result.clusterNote).toMatch(/MegaGen/);
    expect(result.brands).toHaveLength(2);
    const percents = result.brands.map((brand) => agreementPercent(brand.confidence));
    expect(new Set(percents).size).toBe(1);
    for (let i = 1; i < percents.length; i++) {
      expect(percents[i]).toBeLessThanOrEqual(percents[i - 1]);
    }
  });

  it("puts the MegaGen family first when knife threads and a mild taper are marked", () => {
    const result = rankSystems(
      observe({
        collar: "bone-level",
        body: "mild-taper",
        thread: "knife",
      }),
    );
    expect(result.brands).toHaveLength(2);
    expect(result.brands[0]?.company).toBe("MegaGen");
    expect(result.brands[0]?.company).not.toBe("Ankylos");
    expect(result.ranked[0]?.system.id).not.toBe("ankylos");
    const lines = result.brands[0]?.systems.map((row) => row.system.id) ?? [];
    expect(lines).toEqual(expect.arrayContaining(["megagen-st", "megagen-anyridge"]));
    expect(result.brands[0]?.lineSettled).toBe(false);
    expect(result.brands[0]?.why.toLowerCase()).toMatch(/vetronix|st/);
    const percents = result.brands.map((brand) => agreementPercent(brand.confidence));
    for (let i = 1; i < percents.length; i++) {
      expect(percents[i]).toBeLessThanOrEqual(percents[i - 1]);
    }
  });

  it("lets a double lead separate MegaGen ST from AnyRidge", () => {
    const result = rankSystems(
      observe({
        collar: "bone-level",
        body: "mild-taper",
        thread: "knife",
        lead: "double",
      }),
    );
    expect(result.brands[0]?.company).toBe("MegaGen");
    expect(result.brands[0]?.lineSettled).toBe(true);
    expect(result.brands[0]?.systems[0]?.system.id).toBe("megagen-st");
  });

  it("feeds a soft image knife cue into the same company differential", () => {
    const result = rankSystems(observe({ body: "mild-taper" }), SYSTEMS, 2, [
      {
        feature: "thread",
        value: "knife",
        strength: "moderate",
        note: "Deep repeated blades.",
      },
    ]);
    expect(result.brands).toHaveLength(2);
    expect(result.brands[0]?.company).toBe("MegaGen");
    expect(result.brands[0]?.companySettled).toBe(false);
    expect(result.brands[0]?.confidence).toBeLessThanOrEqual(0.34);
    expect(result.ranked[0]?.system.id).not.toBe("ankylos");
    expect(result.brands[0]?.systems[0]?.matches.some((match) => match.source === "vision" && match.value === "knife")).toBe(
      true,
    );
    const percents = result.brands.map((brand) => agreementPercent(brand.confidence));
    for (let i = 1; i < percents.length; i++) {
      expect(percents[i]).toBeLessThanOrEqual(percents[i - 1]);
    }
    expect(result.literature.some((note) => /thread form|knife/i.test(note.text))).toBe(true);
  });

  it("keeps an accepted image cue soft and out of the company rule", () => {
    const observation = observe({
      collar: "bone-level",
      body: "mild-taper",
      thread: "knife",
    });
    const accepted: FeatureKey[] = ["collar", "body", "thread"];
    const vision = [
      { feature: "collar" as const, value: "bone-level", strength: "low" as const, note: "Image neck." },
      { feature: "body" as const, value: "mild-taper", strength: "moderate" as const, note: "Image taper." },
      { feature: "thread" as const, value: "knife", strength: "moderate" as const, note: "Image blades." },
    ];
    const result = rankSystems(observation, SYSTEMS, 2, vision, accepted);
    expect(result.answered).toBe(0);
    expect(result.brands[0]?.company).toBe("MegaGen");
    expect(result.brands[0]?.companySettled).toBe(false);
    expect(result.brands[0]?.systems[0]?.matches.some((match) => match.source === "accepted" && match.value === "knife")).toBe(
      true,
    );
    expect(result.brands[0]?.why).toMatch(/image, accepted/);
  });

  it("says the fixture may be outside the library when confirmed cues fit nobody", () => {
    const result = rankSystems(
      observe({
        collar: "tulip",
        thread: "knife",
        connection: "external-hex",
      }),
    );
    expect(result.brands).toHaveLength(2);
    expect(result.libraryUnsure?.reason).toMatch(/Not in library/);
  });

  it("does not call a clean tissue-level film unknown", () => {
    const result = rankSystems(canonicalObservation(SYSTEMS.find((system) => system.id === "straumann-tl")!));
    expect(result.libraryUnsure).toBeNull();
    expect(result.brands[0]?.companySettled).toBe(true);
  });
});
