import type { Metadata } from "next";
import { Disclaimer } from "@/components/disclaimer";

export const metadata: Metadata = {
  title: "About and disclaimer",
  description: "What Spot the Implant is for, what it refuses to claim, and where films stay.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="kicker">About</p>
      <h1 className="mt-3 font-heading text-5xl leading-none tracking-tight">A bench for the record, not a second opinion with a badge.</h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          Spot the Implant, also called What&apos;s my implant?, helps a dentist or prosthodontist build a short list
          of common fixture designs from a periapical radiograph or a single CBCT slice. The work is the crop, the
          cues you can defend, and a ranked comparison against a sourced library.
        </p>
        <p>
          It is for chairs that already know the limits of a two-dimensional film: overlap, angulation, a custom
          abutment that hides the seat, and brands that share a cone. The useful output is often “these three, and
          here is why the others fell away,” or “these two cannot be split.”
        </p>
        <h2 className="pt-4 font-heading text-3xl text-foreground">Privacy</h2>
        <p>
          The film never leaves the browser. JPEG, PNG, WebP, and supported DICOM frames are decoded locally. There
          is no account and no image database. When you mark a case correct, wrong, unsure, or flagged, only the
          cues and the verdict are written to local storage on that device. Export or clear them from the results
          step.
        </p>
        <h2 className="pt-4 font-heading text-3xl text-foreground">What it is not</h2>
        <p>
          It is not a medical device. It is not cleared or approved by the U.S. FDA. It is not CE-marked. It is not
          a substitute for the surgical record, the restoring clinician, or a radiologist. It does not measure bone,
          and it does not authorize a prosthetic component.
        </p>
        <p>
          Ordering an abutment, a driver, or a rescue screw from a radiographic guess can damage the fixture. If the
          short list is tight or the film is poor, use the library, flag the case, and confirm clinically.
        </p>
        <h2 className="pt-4 font-heading text-3xl text-foreground">Sources</h2>
        <p>
          Catalog features come from public manufacturer brochures, surgical and prosthetic manuals, and open
          papers. Radiographic readings that go beyond those pages are labeled as interpretation in the library and
          in DATA.md. No paywalled atlas figure is reproduced. No clinical radiograph is presented as if this
          project owned it.
        </p>
      </div>
      <div className="mt-8">
        <Disclaimer />
      </div>
    </article>
  );
}
