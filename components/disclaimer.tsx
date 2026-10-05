export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="border-l-2 border-brass pl-3 text-sm leading-relaxed text-foreground">
        Assistive only. Not a diagnosis, not a measurement, not an FDA-cleared or CE-marked device. The percent is
        capped at 92 and is not a probability.
      </p>
    );
  }
  return (
    <aside className="border-l-2 border-brass bg-transparent py-1 pl-4">
      <p className="font-mono text-xs text-brass">Not FDA-cleared · not CE-marked</p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground">
        Ranked names do not replace the implant record, the restoring dentist, or a radiologist. Spot the Implant is
        not a medical device and is not certified for clinical use. The percentage is how the marked cues fit the
        library, with a hard cap of 92%. It is not the chance the guess is right. Do not order prosthetic parts from
        this list.
      </p>
    </aside>
  );
}
