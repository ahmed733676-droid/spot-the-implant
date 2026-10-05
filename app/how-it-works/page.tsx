import type { Metadata } from "next";
import Link from "next/link";
import { SYSTEMS } from "@/lib/systems";

export const metadata: Metadata = {
  title: "How it works",
  description: "The honest pipeline: cues you confirm, a feature score, and the limits of a periapical.",
};

const steps = [
  {
    title: "The film stays here",
    body: "Upload is a browser file read. DICOM support covers uncompressed grayscale and basic JPEG transfer syntaxes. Anything else asks you to export a PNG from the viewer.",
  },
  {
    title: "You crop the fixture",
    body: "The score is only as honest as the crop. Include a transmucosal collar. Exclude the crown. A CBCT series is one exported frame, not a volume.",
  },
  {
    title: "Cues become evidence",
    body: "What you confirm is hard evidence. An image measurement of neck, taper, thread, or apex stays in the same list as a soft cue until you confirm or replace it. A mild taper by itself does not name a company. A knife thread, a tulip, a convergent neck, tube-in-tube, or a subcrestal cone can move a family up the list.",
  },
  {
    title: "Then a company, then a line",
    body: "The short list is a differential. Twins such as Osstem and Hiossen are refused. A line inside the company is named only when these cues separate it. MegaGen ST and AnyRidge stay open on knife threads until a double lead is actually visible. Polarity can be flipped if the fixture is displayed dark. The connection is never guessed.",
  },
  {
    title: "The crop is three bands",
    body: "Collar, threads, apex. That is the coronal, midbody, and apical split in the 2002 radiographic tables. A wide box or a short box is flagged before you rank. The film still never leaves the browser.",
  },
  {
    title: "The company comes first",
    body: "The short list ranks manufacturers, not catalog generations. Straumann Tissue Level, Bone Level, and BLX compete as Straumann until a cue settles the line. Astra TX and EV stay Astra Tech (Dentsply Sirona) with the generation left open. Osstem TS III and Hiossen ET III stay two company names for one look, so the bench will not call the company.",
  },
  {
    title: "The number is capped",
    body: "Feature agreement cannot display above 92%. An angled film cannot display a settled company above 62%. The notes under the list say “per the literature” and link the paper. That number is not a probability and not a sensitivity.",
  },
  {
    title: "Your labels teach the next version",
    body: "Correct, wrong, unsure, and specialist flags stay in local storage. They are not a trained model in this build. They are the labeled set a later model would need, tied to features rather than to a vibe.",
  },
];

export default function HowItWorksPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="kicker">Architecture, in the open</p>
      <h1 className="mt-3 font-heading text-5xl leading-none tracking-tight">How a short list is made.</h1>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
        There is no hidden network and no paid vision API. {SYSTEMS.length} systems are scored from the cues you
        confirm, against features taken from public catalogs. The full ontology, the weights, and the path to CBCT
        are in ARCHITECTURE.md in the repository.
      </p>
      <ol className="mt-10 space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="grid grid-cols-[auto_1fr] gap-4">
            <span className="font-mono text-sm text-brass">0{index + 1}</span>
            <div>
              <h2 className="font-heading text-2xl text-foreground">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-12 rounded-lg border border-border bg-card p-5">
        <h2 className="font-heading text-2xl">Limits of a periapical</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Two dimensions collapse the connection. A Morse taper, an internal hex, and a tube-in-tube often look
          like “something inside the body.” Angulation exaggerates taper. A wide abutment imitates a tulip. This
          bench would rather tie Straumann Bone Level with NobelParallel CC than pretend the CrossFit groove is
          visible. CBCT can add cross-sections later. It does not, by itself, name the brand.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/library" className="text-brass hover:underline">
            Read the systems and their sources
          </Link>
          <span className="text-muted-foreground"> · </span>
          <Link href="/about" className="text-brass hover:underline">
            Disclaimer
          </Link>
        </p>
      </div>
    </article>
  );
}
