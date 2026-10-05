import { describe, expect, it } from "vitest";
import { notesFor } from "@/lib/literature";
import { emptyObservation } from "@/lib/types";

describe("notesFor", () => {
  it("quotes the angulation limit when the film is marked angled", () => {
    const notes = notesFor({
      observation: { ...emptyObservation(), collar: "tulip", geometry: "angled" },
      leaderCompany: "Straumann",
      companySettled: false,
      runnerUp: "Sweden & Martina",
      runnerClose: false,
    });
    expect(notes[0]?.text.toLowerCase()).toContain("per the literature");
    expect(notes[0]?.text).toMatch(/10°|angled/i);
    expect(notes[0]?.url).toMatch(/^https:\/\//);
  });

  it("does not pretend surface or length were scored", () => {
    const notes = notesFor({
      observation: { ...emptyObservation(), collar: "tulip" },
      leaderCompany: "Straumann",
      companySettled: true,
      runnerUp: null,
      runnerClose: false,
    });
    expect(notes.some((note) => /surface/i.test(note.text))).toBe(true);
  });
});
