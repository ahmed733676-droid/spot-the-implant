import type { FeatureKey, Observation } from "@/lib/types";

export const FEATURE_LABEL: Record<FeatureKey, string> = {
  collar: "Collar / neck",
  microgap: "Junction vs crest",
  connection: "Abutment interface",
  body: "Body shape",
  thread: "Thread form",
  apex: "Apex",
  platformSwitch: "Platform step",
  lead: "Thread starts",
};

export type Choice = {
  value: string;
  label: string;
  hint: string;
  phrase: string;
};

export const CHOICES: Record<FeatureKey, Choice[]> = {
  collar: [
    {
      value: "unknown",
      label: "Not sure",
      hint: "Leave this open if the neck is buried or the crop is short.",
      phrase: "an unmarked neck",
    },
    {
      value: "bone-level",
      label: "Bone level",
      hint: "Threads or texture run to the platform. No polished transmucosal neck.",
      phrase: "a bone-level platform with no polished neck",
    },
    {
      value: "machined-band",
      label: "Machined band",
      hint: "A short smooth collar, usually under 2 mm, coronal to the threads.",
      phrase: "a short machined collar",
    },
    {
      value: "microthread",
      label: "Microthread band",
      hint: "A band of finer threads at the neck, tighter than the body thread.",
      phrase: "a microthread band at the neck",
    },
    {
      value: "tulip",
      label: "Tulip flare",
      hint: "Machined neck that widens toward the crown and sits above bone.",
      phrase: "a flared tulip collar above the bone",
    },
    {
      value: "hyperbolic",
      label: "Convergent neck",
      hint: "Transmucosal neck that is wider at bone and narrows toward the crown.",
      phrase: "a convergent hyperbolic neck",
    },
  ],
  microgap: [
    {
      value: "unknown",
      label: "Not sure",
      hint: "Mark this only when the implant–abutment line is visible. Angled films hide it.",
      phrase: "an unread junction line",
    },
    {
      value: "supracrestal",
      label: "Above the crest",
      hint: "The junction sits on a neck that is clearly coronal to bone.",
      phrase: "a junction above the crest",
    },
    {
      value: "crestal",
      label: "At the crest",
      hint: "The junction is level with the bone contact at the shoulder.",
      phrase: "a junction at the crest",
    },
    {
      value: "subcrestal",
      label: "Below the crest",
      hint: "The seat sinks into the body, apical to the bone contact. The Ankylos pattern.",
      phrase: "a subcrestal junction",
    },
  ],
  connection: [
    {
      value: "unknown",
      label: "Not sure",
      hint: "The interface is often hidden on a periapical. Unknown is a good answer.",
      phrase: "an unseen interface",
    },
    {
      value: "external-hex",
      label: "External hex",
      hint: "A hex flange sits on the shoulder, like a short chimney.",
      phrase: "an external hex",
    },
    {
      value: "internal-unspecified",
      label: "Internal, type unclear",
      hint: "The connection is inside the body, but hex vs cone is not readable.",
      phrase: "an internal connection of unclear type",
    },
    {
      value: "internal-hex",
      label: "Internal hex",
      hint: "Only when you can defend a hex rather than a cone.",
      phrase: "an internal hex",
    },
    {
      value: "internal-conical",
      label: "Internal cone",
      hint: "Morse, CrossFit, TorcFit, Conical Seal, or Grand Morse family.",
      phrase: "an internal cone",
    },
    {
      value: "internal-octagon",
      label: "Internal octagon",
      hint: "synOcta. Rarely separable from a generic internal seat on one film.",
      phrase: "an internal octagon",
    },
    {
      value: "tube-in-tube",
      label: "Tube-in-tube",
      hint: "Camlog’s parallel tube and cams. Mark this only if that geometry is known.",
      phrase: "a tube-in-tube connection",
    },
    {
      value: "subcrestal-conical",
      label: "Deep subcrestal cone",
      hint: "The abutment sinks into the fixture. Classic Ankylos TissueCare reading.",
      phrase: "a deep subcrestal cone",
    },
  ],
  body: [
    {
      value: "unknown",
      label: "Not sure",
      hint: "Angulation and foreshortening fake a taper.",
      phrase: "an unread body",
    },
    {
      value: "parallel",
      label: "Parallel",
      hint: "Walls stay nearly the same width from neck to apex.",
      phrase: "a parallel body",
    },
    {
      value: "mild-taper",
      label: "Mild taper",
      hint: "Noticeably narrower at the apex, still a broad body.",
      phrase: "a mild taper",
    },
    {
      value: "strong-taper",
      label: "Strong taper",
      hint: "Root-form or fully tapered. The apex is much narrower than the neck.",
      phrase: "a strong taper",
    },
  ],
  thread: [
    {
      value: "unknown",
      label: "Not sure",
      hint: "Pitch is hard to count when the beam is off-axis.",
      phrase: "an unread thread",
    },
    {
      value: "fine",
      label: "Fine",
      hint: "Tight, shallow threads.",
      phrase: "fine threads",
    },
    {
      value: "standard",
      label: "Standard",
      hint: "Ordinary V-shaped thread. The most common, and the least specific.",
      phrase: "a standard thread",
    },
    {
      value: "buttress",
      label: "Buttress",
      hint: "Flat crestal-facing flank and a wider thread base.",
      phrase: "buttress threads",
    },
    {
      value: "coarse",
      label: "Coarse",
      hint: "Deep, widely spaced threads.",
      phrase: "coarse threads",
    },
    {
      value: "knife",
      label: "Knife thread",
      hint: "Very thin blades and a narrow core. AnyRidge is the reference shape.",
      phrase: "knife-thin deep threads",
    },
    {
      value: "progressive",
      label: "Progressive",
      hint: "Thread depth increases toward the apex.",
      phrase: "a progressive thread",
    },
  ],
  apex: [
    {
      value: "unknown",
      label: "Not sure",
      hint: "The apex is often cut off or overlapped.",
      phrase: "an unread apex",
    },
    {
      value: "flat",
      label: "Flat",
      hint: "A blunt end, sometimes with a small vent.",
      phrase: "a flat apex",
    },
    {
      value: "rounded",
      label: "Rounded",
      hint: "A dome, without a sharp point.",
      phrase: "a rounded apex",
    },
    {
      value: "pointed",
      label: "Pointed",
      hint: "Comes to a relatively sharp tip.",
      phrase: "a pointed apex",
    },
    {
      value: "cutting",
      label: "Cutting flutes",
      hint: "Vertical vents or a self-cutting chamber at the tip.",
      phrase: "a cutting apex",
    },
  ],
  platformSwitch: [
    {
      value: "unknown",
      label: "Not sure",
      hint: "A narrower abutment can be prosthetic hardware, not the fixture.",
      phrase: "an unread platform step",
    },
    {
      value: "yes",
      label: "Narrower seat",
      hint: "The connection or abutment seat is visibly inside the shoulder.",
      phrase: "a narrower prosthetic seat",
    },
    {
      value: "no",
      label: "No step",
      hint: "Shoulder and seat are about the same width.",
      phrase: "no platform step",
    },
  ],
  lead: [
    {
      value: "unknown",
      label: "Not sure",
      hint: "Counting starts needs a sharp film. Skip this if you are guessing.",
      phrase: "an uncounted lead",
    },
    {
      value: "single",
      label: "Single",
      hint: "One thread start.",
      phrase: "a single thread start",
    },
    {
      value: "double",
      label: "Double",
      hint: "Two starts. Common on aggressive tapered designs.",
      phrase: "a double lead",
    },
    {
      value: "triple",
      label: "Triple",
      hint: "Three starts. A Tapered Screw-Vent clue when you can count it.",
      phrase: "a triple lead",
    },
    {
      value: "variable",
      label: "Variable pitch",
      hint: "Pitch changes along the body, as on BLX.",
      phrase: "a variable pitch",
    },
  ],
};

export function choiceFor(feature: FeatureKey, value: string): Choice | undefined {
  return CHOICES[feature].find((choice) => choice.value === value);
}

export function phraseFor(feature: FeatureKey, value: Observation[FeatureKey]): string {
  return choiceFor(feature, value)?.phrase ?? String(value);
}
