import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";

export const metadata: Metadata = {
  title: "About and disclaimer",
  description: "What Spot the Implant is for, what it refuses to claim, and where films stay.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 pt-14 pb-18 sm:px-6 lg:pt-24 lg:pb-28">
      <p className="kicker">Limits</p>
      <h1 className="mt-3 max-w-3xl font-heading text-5xl leading-[0.92] tracking-tight sm:text-6xl">
        A bench for the record. <span className="italic text-brass">Not a badge.</span>
      </h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="space-y-5 text-base leading-relaxed text-foreground/80">
          <p>
            Spot the Implant, also called What&apos;s my implant?, helps a dentist or prosthodontist hold a periapical
            or a single CBCT slice up to a sourced library. The work is the crop, the cues you can defend, and two
            company names — or a refusal to name one.
          </p>
          <p>
            Useful output is often “these two, and here is why the film will not go further,” or “these two cannot be
            split.” The catalog line appears only when the cues inside that company actually separate.
          </p>
        </div>
        <Disclaimer />
      </div>

      <div className="mt-14 grid gap-px border border-foreground/15 bg-foreground/15 md:grid-cols-3">
        {[
          [
            "Privacy",
            "The film never leaves the browser. JPEG, PNG, WebP, and supported DICOM frames are decoded locally. There is no account and no image database. A correct, wrong, unsure, or specialist mark stores the cues and the verdict in local storage on that device. The bitmap is not stored.",
          ],
          [
            "Not a device",
            "It is not cleared or approved by the U.S. FDA. It is not CE-marked. It does not measure bone, and it does not authorize a prosthetic component. Ordering an abutment, a driver, or a rescue screw from a radiographic guess can damage the fixture.",
          ],
          [
            "Sources",
            "Catalog features come from public manufacturer pages, surgical manuals, and open papers. Readings that go past those pages are labeled interpretation. No paywalled atlas figure is reproduced.",
          ],
        ].map(([title, body]) => (
          <section key={title} className="bg-background p-5 sm:p-6">
            <h2 className="font-heading text-3xl leading-none">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm">
        <Link href="/how-it-works" className="underline decoration-brass underline-offset-4">
          How a short list is made
        </Link>
        <span className="text-muted-foreground"> · </span>
        <Link href="/library" className="underline decoration-brass underline-offset-4">
          Library
        </Link>
      </p>
    </article>
  );
}
