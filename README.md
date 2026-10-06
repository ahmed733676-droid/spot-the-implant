# Spot the Implant

What’s my implant? is a decision-support bench for dentists and prosthodontists. You crop a periapical radiograph or a single CBCT frame, confirm the radiographic cues you can actually see, and get **two implant companies** — with a reason, a doubt, and a refusal when the film cannot split them. The catalog line is shown only when those cues can separate it.

It is not a medical device. It is not FDA-cleared, not CE-marked, and not a diagnosis. Feature agreement is capped at **92%** and is not a probability.

Films are decoded in the browser. They are not uploaded.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open the URL printed by Next.js (the project script does not pin a port). Production build:

```bash
npm run build
npm start
```

## What you can do

- **Identify** — JPEG, PNG, WebP, or DICOM (uncompressed grayscale, or a single JPEG-compressed frame). Crop the fixture. Cues you set yourself are hard evidence. On-device measurements of neck, taper, thread, and apex stay soft, including after you accept them, and are labelled as image evidence. The company comes first. The line is secondary. When the confirmed cues fit no system, the two closest names stay up and the screen says the fixture may be outside the library.
- **Library** — 26 systems with schematic silhouettes, checklist values, look-alikes, and public sources. No clinical radiograph is presented as a product photo.
- **Labels** — Mark a result correct, wrong, unsure, or flag it for a specialist. The label (cues and verdict only, never the radiograph) stays in `localStorage`, capped at 200 rows. Export it as JSON from the results step.

## Accuracy, stated plainly

This build has **no clinical accuracy percentage**. It has not been measured on a labeled set of patient radiographs, so there is no sensitivity, specificity, or “better than a dentist” claim to quote.

What the percentage on screen means:

- It is the share of the cues you marked that fit a catalog entry, plus a small boost for a few distinctive shapes (tulip collar, knife thread, convergent neck, tube-in-tube, subcrestal cone).
- It is reduced when you marked fewer than four hard cues, and when two companies are a declared radiographic pair (Osstem / Hiossen, Straumann Bone Level / NobelParallel, and others). Astra TX and EV do not split the company: the screen can say Astra Tech and still refuse the generation. A later card never displays a higher percent than the card above it.
- It cannot display above 92. Fewer than two hard cues cannot display above 34. An unsettled company cannot display above 60. An angled film is capped at 62 and is never called settled. A settled company with an open line cannot display above 80.
- A mild taper, with nothing more distinctive, is not a company call. The list is marked “not a ranking.” On 6 Oct 2026 a labeled film (Vetronix / MegaGen ST, Cairo) was returned as Ankylos at 21% with the next cards at 34%, and MegaGen was absent. That was a logic failure: mild taper is generic, and the leader-only penalty inverted the percents. Knife or deep threads now put MegaGen on the short list (ST and AnyRidge, line open unless a double lead is confirmed). Vetronix is the chair-side alias for ST and is marked as interpretation, not as a name MegaGen publishes.

On the schematic teaching cases in `npm test`, the labeled system (or its declared twin) ranks first when every canonical cue is marked. That is a unit check of the scorer, not a clinical study.

## How to test with two real films

Ahmed, or anyone with two known fixtures:

1. Run the app locally or open the deployed URL.
2. Identify → upload the first periapical as JPEG or PNG (or DICOM, if the viewer can save an uncompressed or JPEG frame). The file stays in the browser.
3. Crop to the fixture, including a tissue-level collar if there is one. Exclude the crown.
4. Leave any cue you cannot defend as **Not sure**. An image suggestion already counts as a soft cue. Accept it if you agree, or pick another value to replace it.
5. Read the two companies and the “why it may be wrong” lines. Mark **This is the company I see**, or **None of these** and pick the company you know was placed. Use the line button only when you also know the generation.
6. Repeat with a second film, preferably a different design family (for example one tissue-level and one tapered bone-level).
7. On the results step, **Export JSON**. That file is the label set. It does not contain the radiograph.

If the two films are the same company with no distinctive neck, expect the company and an open line. If they are Osstem and Hiossen, or Bone Level and NobelParallel, expect the bench to refuse the company. That is the bench working.

## Data

Catalog features and links are in [DATA.md](DATA.md). Scoring, the academic rules, and how to extend the bench are in [ARCHITECTURE.md](ARCHITECTURE.md). Commercial and published alternatives are in [COMPETITORS.md](COMPETITORS.md).

## Deploy

The app is a Next.js App Router project and deploys on Vercel with no environment variables.

```bash
npx vercel
npx vercel --prod
```

Link the Vercel project to this repository when the dashboard asks. No API keys are required.
