import type { Metadata } from "next";
import Link from "next/link";
import { SYSTEMS } from "@/lib/systems";

export const metadata: Metadata = {
  title: "How it works",
  description: "Cues become evidence, then two companies, then a line only when the film can separate it.",
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
    body: "What you set yourself is hard evidence. Accepting an image measurement keeps it soft and labelled, and it does not count toward the three cues that name a company. A mild taper by itself does not name a company. A knife thread, a tulip, a convergent neck, tube-in-tube, or a subcrestal cone can move a family up the list.",
  },
  {
    title: "Then a company, then a line",
    body: "The short list is two companies. Twins such as Osstem and Hiossen are refused. A line inside the company is named only when these cues separate it. MegaGen ST and AnyRidge stay open on knife threads until a double lead is actually visible. The connection is never guessed.",
  },
  {
    title: "The crop is three bands",
    body: "Collar, threads, apex. That is the coronal, midbody, and apical split in the 2002 radiographic tables. A wide box or a short box is flagged before you rank. The film still never leaves the browser.",
  },
  {
    title: "The company comes first",
    body: "Straumann Tissue Level, Bone Level, and BLX compete as Straumann until a cue settles the line. Astra TX and EV stay Astra Tech (Dentsply Sirona) with the generation left open. Osstem TS III and Hiossen ET III stay two company names for one look, so the bench will not call the company.",
  },
  {
    title: "The number is capped",
    body: "Feature agreement cannot display above 92%. An angled film cannot display a settled company above 62%. The notes under the list say “per the literature” and link the paper. That number is not a probability and not a sensitivity.",
  },
  {
    title: "Your labels stay on this device",
    body: "Correct, wrong, unsure, and specialist flags stay in local storage. They are not a trained model in this build. They are the labeled set a later model would need, tied to the cues rather than to a stored film.",
  },
];

export default function HowItWorksPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 pt-14 pb-18 sm:px-6 lg:pt-24 lg:pb-28">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="kicker">Pipeline</p>
          <h1 className="mt-3 font-heading text-5xl leading-[0.92] tracking-tight sm:text-6xl">
            How two names get made.
          </h1>
        </div>
        <p className="max-w-xl text-lg leading-snug text-foreground/80">
          No hidden network and no paid vision API. {SYSTEMS.length} systems are scored from the cues you confirm,
          against features taken from public catalogs. The ontology and the weights live in ARCHITECTURE.md.
        </p>
      </div>
      <ol className="mt-12 border-t border-foreground/15">
        {steps.map((step, index) => (
          <li key={step.title} className="grid gap-2 border-b border-foreground/15 py-5 sm:grid-cols-[4.5rem_14rem_1fr] sm:gap-6">
            <span className="font-mono text-sm text-brass">0{index + 1}</span>
            <h2 className="font-heading text-2xl leading-tight text-foreground">{step.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 grid gap-6 border-l-2 border-brass pl-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h2 className="font-heading text-3xl leading-none">Limits of a periapical</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Two dimensions collapse the connection. A Morse taper, an internal hex, and a tube-in-tube often look like
            “something inside the body.” Angulation exaggerates taper. A wide abutment imitates a tulip. This bench
            would rather tie Straumann Bone Level with NobelParallel CC than pretend the CrossFit groove is visible.
          </p>
        </div>
        <p className="text-sm">
          <Link href="/library" className="underline decoration-brass underline-offset-4">
            Systems and sources
          </Link>
          <span className="text-muted-foreground"> · </span>
          <Link href="/about" className="underline decoration-brass underline-offset-4">
            Disclaimer
          </Link>
        </p>
      </div>
    </article>
  );
}
