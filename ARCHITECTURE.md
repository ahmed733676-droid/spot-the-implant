# Architecture

Spot the Implant is a Next.js app. Identification runs entirely in the browser. There is no model server, no account, and no image upload.

## Pipeline

1. **Read the film.** JPEG, PNG, and WebP use the browser image decoder. DICOM uses `dicom-parser` for uncompressed little-endian grayscale and for a single JPEG baseline or lossless JPEG frame. Other transfer syntaxes stop with a request to export PNG from the viewer. Multi-frame files use frame 0 and say so. Windowing uses the DICOM window center and width when present, otherwise a 1st-to-99th percentile stretch.
2. **Crop.** The dentist isolates the fixture. A tissue-level collar has to be inside the box or the tulip cue cannot be true.
3. **Identify.** `rankSystems` in `lib/scoring.ts` is a facade over four layers in `lib/pipeline/`. Image measurements are not a second guess. They enter layer 1.
4. **Label.** Correct, wrong, unsure, or specialist. `lib/feedback.ts` writes the cues and the verdict to `localStorage` under `spot-the-implant.feedback.v1`. The bitmap is not stored.

## ADR: company identity is a differential, not a catalog sort

**Status:** accepted, 6 Oct 2026, after a labeled periapical (Ahmed, Cairo) was returned as Ankylos.

**Problem.** The previous scorer treated every matching cue as equal, sorted ties alphabetically, and then multiplied only the leader’s percent when the gap was small. One confirmed “mild taper” therefore crowned Ankylos at 21% while the next cards showed 34%. MegaGen was in the catalog and accepts a mild taper, but it sorted after the A–B names, so it never appeared. The on-device measurement could see threads and still did not enter the score until someone clicked it.

**Decision.** Company identification is four layers. A line is named only after the company differential says the lines inside that company actually separate.

| Layer | Module | What it does |
| --- | --- | --- |
| 1. Cue extraction | `lib/pipeline/extract.ts` | A mark the dentist chose is hard evidence and blocks the image cue for that feature. Using an image cue keeps it soft (strength 0.8, labelled “image, accepted”) and does not count toward the three clinician cues required to name a company. An untouched image cue stays softer (low ≈ 0.40, moderate ≈ 0.62). Vision never supplies a connection or a junction line. |
| 2. Feature evidence graph | `lib/pipeline/graph.ts` | Confirmed match earns the feature weight. Confirmed miss is a contradiction. A vision match on a distinctive value (tulip, knife, progressive, microthread, subcrestal cone, tube-in-tube, external hex, buttress, hyperbolic) counts fully at its soft strength. A generic vision match counts less. A vision miss is a small penalty, and it is printed only when the cue is a moderate distinctive reading. Signatures fire when every part is present in the evidence, confirmed or from the image. |
| 3. Company differential | `lib/pipeline/differential.ts` | Companies roll up with `identityOf`. The company score is the best line, not the sum. Declared twins (Osstem/Hiossen and the others) refuse `companySettled`. Fewer than three hard cues refuse it. A vision-only distinctive cue can move a family up the list and still cannot settle the company. An angled film multiplies agreement by 0.75, caps it at 62%, and forces the company unsettled. |
| 4. Line, only if separable | same module | Inside the leading company, a second line within 0.08 of the best stays open. MegaGen ST and AnyRidge share the KnifeThread signature. A double lead, which the ST brochure adds to KnifeThread, is what settles ST. |

**Generic cues are not a ranking.** Mild taper, a parallel body, a standard thread, a rounded apex, a bone-level collar, and a single lead do not belong to one company. When no distinctive cue is present and three or more companies tie, the result is `flat`. The screen says this is not a ranking, badges every card “Same evidence,” and the note names Ankylos and MegaGen as members of that shared set. Alphabetical order is not a winner.

**The short list is two companies.** `rankSystems` returns two brands. Honesty flags are computed on the full differential first — twins, the flat band, the open line — and only then is the list cut. On a flat tie both rows are badged as the same evidence, and the note still names Ankylos and MegaGen when they share that tie, plus how many other companies fit. Cards three through five are not rendered. Alphabetical order is not a company call.

**Not in library sits beside those two names.** The two names stay on screen as the closest reads. “Not in library / unsure” is added when confirmed cues contradict both closest systems, when every system in the library contradicts at least two confirmed cues, when the best agreement is weak, or when the top two conflict on a distinctive cue and are not a declared twin pair.

**Image measurement.** Before the width profile is read, the crop is rotated onto the fixture’s long axis when that axis is clearly off vertical (about 4–35°). The axis is the midline of the bright flanks, with image moments on the fixture mask as a fallback. Thread class is pitch divided by fixture width, not by length, so an 8 mm and a 13 mm implant with the same thread do not change class.

**Percents stay in rank order.** Near-ties (rank gap under 0.02) share one displayed percent. A later row never displays a higher percent than the row above it. The old leader-only gap penalty is gone.

**What did not change.** The 92% cap, the 34% cap under two hard cues, the 55% twin cap, the 80% cap when the company is ahead but the line is open, and the refusal to call the company on an angled film. This is still decision support. It is not a sensitivity and not a clearance.

## Feature ontology

The features are the ones a careful reader can sometimes defend on a periapical, not the ones a catalog uses to sell a surface.

- **Collar** is the highest weight (3.4). Tulip and hyperbolic necks are nearly unique in this set.
- **Connection** is 2.6, but only when specified. `internal-unspecified` scores 0.42 of the weight against any internal family and misses external hex and the subcrestal cone. That is intentional: most periapicals do not show hex versus Morse.
- **Thread** is 2.5. Knife, buttress, and progressive are specific. Standard is common and weak as a separator.
- **Body** 1.7, **apex** 1.6, **platform step** 1.2, **lead** 1.1.

A system may accept several values (Zimmer collars, Bone Level versus BLT). The first accepted value is the canonical example used in tests.

### Signatures

A signature adds points only when every listed cue is present. It does not override a pile of contradictions, because the boost is divided by `(possible + 6)` and then clamped.

| Signature | Why it exists |
| --- | --- |
| Tulip → Tissue Level | Brochure: integrated tulip-shaped machined collar |
| Hyperbolic neck → Prama | Brochure: 2 mm hyperbola plus 0.8 mm cylinder |
| Knife thread → MegaGen (AnyRidge and ST) | Brochure: KnifeThread. The line stays open until a lead separates them |
| Knife thread and double lead → MegaGen ST | Brochure: KnifeThread added to a double thread. Vetronix is a chair-side alias, marked interpretation |
| Subcrestal cone, and progressive thread → Ankylos | Manual: TissueCare connection and a thread that deepens apically |
| External hex and coarse thread → Southern | Teaching split from a fine Brånemark hex. Marked as interpretation |
| Tube-in-tube → Camlog | Brochure. The dentist has to choose it; the image code never will |
| Pointed apex → NobelActive | Design split from cutting-tip tapers |
| Variable pitch → BLX | Brochure pitch range, used against double-lead tapers |
| Triple lead → Tapered Screw-Vent | FDA filing |
| Buttress → BioHorizons | Product page |
| Microthread → both Astra entries, same boost | They stay tied on purpose |

### Displayed agreement

`confidence = clamp(0.18 + 0.74 × affinity, 0.04, 0.92)`, then:

- fewer than 2 hard cues → at most 0.34
- fewer than 3 → at most 0.52
- fewer than 4 → at most 0.74
- a declared twin within 0.04 rank score caps both system rows at 0.60
- near-ties share one percent, and a later row never displays a higher percent than the row above it

The UI rounds that to an integer and still will not print a number above 92. On a system row the word is **feature agreement**. On the short list the word is **company agreement**, because the rank the dentist sees is the manufacturer.

### Company before line

`identityOf` in `lib/systems.ts` is the lab-slip name. Astra TX and EV roll up to **Astra Tech** (manufacturer Dentsply Sirona). Ankylos stays **Ankylos**, not Astra, because the subcrestal cone is a different company call even though Dentsply Sirona makes both. Tapered Screw-Vent is **Zimmer Biomet**, with ZimVie shown as the current manufacturer. Neodent stays Neodent (Straumann Group) so a Helix film is not reported as Straumann.

Brand affinity is the best line inside that company. A second line of the same company does not raise the score. It marks the line as unsettled and caps company agreement at 80% when the company itself is ahead of the next manufacturer.

Company agreement is capped at 55% when the leader and the runner-up are a cross-company radiographic pair within 0.06 affinity (Osstem/Hiossen, Straumann Bone Level/NobelParallel CC, and the other declared twins). Fewer than three cues also refuses `companySettled`, so a lone tulip can lead with Straumann and still display at most 34%.

The UI headline is the company. The line is a secondary sentence. Feedback stores both `topCompany` and the line id.

Evidence is `thin`, `partial`, or `supported`. Supported requires at least three cues, affinity at least 0.72, and a gap that is not a cluster. Three or more systems within 0.08 of the leader produce a cluster note instead of a winner’s tone.

### Twins

These pairs are not a failure of the sort. They are the finding.

- Astra TX and EV
- Osstem TS III and Hiossen ET III
- Straumann Bone Level and NobelParallel CC
- Dentium SuperLine and Neodent Helix GM
- Anthogyr Axiom BL and BEGO Semados RSX

## Academic rules on a periapical

The score is a checklist, but the checklist is the one the identification papers actually used. `lib/literature.ts` attaches short notes to every short list. The UI labels them **Per the literature**. Full citations are in [DATA.md](DATA.md). The comparison with commercial tools is in [COMPETITORS.md](COMPETITORS.md).

What is encoded:

- **Thirds.** Sahiwal, Woody, Benson, and Guillen (J Prosthet Dent, 2002) split threaded fixtures into a coronal third, a midbody, and an apex, and found the features readable within about ±10° of vertical beam angulation and unrecognizable near 20°. The crop overlay is those three bands. A short or wide box is warned, not blocked.
- **Angulation.** Sewerin (Clin Oral Implants Res, 1991) showed thread images move with the beam. If the dentist marks the film **Obviously angled**, company agreement is multiplied by 0.75, capped at 62%, and `companySettled` is forced off. The company can still lead. It is not called.
- **Junction versus crest.** The coronal third includes where the implant–abutment line sits. `microgap` is `supracrestal`, `crestal`, or `subcrestal`, weight 1.8, and only when the dentist can see the line. Subcrestal supports Ankylos. It does not outrank a tulip collar. The image code never suggests it.
- **What is refused.** Michelinakis, Sharrock, and Barclay (Int Dent J, 2006) asked Implant Recognition Software for surface, diameter, and length as well as shape. Surface and catalog length are not scored. The bench does not report millimeters.
- **Hard negatives.** Declared radiographic pairs (Osstem/Hiossen, Bone Level/NobelParallel CC, and the others in the twins list) stay as competing hypotheses. Saghiri and colleagues (Bull Natl Res Cent, 2021) state the plain limit: a 2D film does not carry the 3D seat those pairs differ by. A close runner-up is shown with that sentence, not hidden by a signature boost.
- **Several hypotheses.** The short list is companies, each with the lines still open inside it. Confidence is a capped feature agreement, not a probability and not a calibrated clinical sensitivity. Bands: under 35% a single cue, under 63% an angled film or an unsettled company, at most 80% when the company is ahead but the line is open, at most 92% when both are supported.

## How labeled feedback would change the model

Today the JSON export is a dataset, not a training loop. Each row has the observation, the top id, the verdict, and the corrected id. A useful next model:

1. Keep the checklist as the representation. It is what a dentist can audit.
2. Fit the weights and the signature boosts on exported corrections, with a holdout by clinician, not by row. The current weights are priors.
3. Only then consider an embedding. A small on-device encoder (a few-hundred-kilobyte ONNX file trained on *labeled crops*, not on scraped IFU art) can rerank the top of the checklist. It should not be allowed to outvote a contradiction the dentist marked.
4. Never train on the film without the correction. A click on “this is the system I see” is the label. A specialist flag is not a negative label for the leader; it is an abstention.

Until that set exists, shipping a network would pretend to a sensitivity this repository does not have.

## Extending the catalog

Add an object to `SYSTEMS` in `lib/systems.ts`.

- Order `accepts` arrays with the typical value first.
- Add a signature only for a cue that is actually rare in the file. A boost on `internal-conical` would flatten the cone cluster.
- If the new system cannot be separated from an existing one on a periapical, put that id in `twins` on both sides and write the `confusers` note in clinical language.
- Cite a public brochure, manual, or open paper in `sources`. If the body shape is your reading of the catalog rather than a quoted sentence, set `kind` to `interpretation`.
- The test “canonical cues rank the system or its twin first” will fail if the new entry is a silent duplicate. That failure is the review.

## Extending to CBCT

A volume is not a smarter periapical. The honest addition is two extra crops, not a new brand list:

- A cross-section through the platform, which can sometimes show hex versus cone versus three cams. That would let `internal-unspecified` be replaced by a real seat more often. Weight on connection can then go up.
- A second plane for the apex, which is where cutting flutes hide in a periapical.

The same checklist still applies. Store the plane (`pa`, `cbct-axial`, `cbct-cross`) on the feedback row so a later model does not mix them. Do not claim a CBCT brand call from a single slice. This version renders one DICOM frame and says when others were ignored.

## Limits of a 2D periapical

- The beam is rarely the long axis. Taper and pitch both lie.
- The connection is inside the metal. External hex is the seat you can sometimes see. Everything internal collapses.
- A healing abutment or a custom abutment copies a tulip or a convergent neck. The crop instructions exist because of that.
- Surface names (SLA, TiUnite, Laser-Lok, OsseoSpeed) are not radiographic signs.
- One catalog entry hides generations: Semados S-Line versus RSX, 3i external hex versus Certain, Southern external hex versus Deep Conical. The pitfalls on the card are part of the model.
- Magnification is unknown, so the bench never reports a millimeter measurement. Neck heights in the copy are quoted from brochures, not measured on the film.

## What “surpass an average dentist on common systems” would require

An average dentist is uneven: very good on a tulip or an AnyRidge knife thread, and honestly stuck on a parallel internal cone. This bench is built to match that shape of skill, not to fake a higher one.

To *measure* a gain you need a set Ahmed does not have in this repository: two or more known films per family, a reader who records the system from the chart, and a reader who uses only the film plus this short list. Report agreement with the chart, and report how often the charted system is inside the top 3, separately for pathognomonic necks and for the cone cluster. Do not average those into one percent.

Until that study exists, the product claim is the short list, the reason, and the refusal to split twins.
