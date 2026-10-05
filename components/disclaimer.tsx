export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-sm leading-relaxed text-bone/90">
        Assistive only. This is not a diagnosis, not a measurement, and not an FDA-cleared or CE-marked device.
        Feature agreement is capped at 92% and is not a probability.
      </p>
    );
  }
  return (
    <aside className="rounded-md border border-brass/30 bg-brass/8 px-4 py-3 text-sm leading-relaxed text-foreground">
      <p className="font-medium text-brass">Decision support, not a device reading</p>
      <p className="mt-1 text-muted-foreground">
        Ranked matches do not replace the implant record, the restoring dentist, or a radiologist. Spot the Implant
        is not a medical device. It is not cleared or approved by the FDA, not CE-marked, and not certified for
        clinical use. The percentage is a feature-match score with a hard cap of 92%. It is not the chance that the
        guess is correct. Do not order prosthetic parts from this list.
      </p>
    </aside>
  );
}
