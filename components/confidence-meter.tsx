import { agreementPercent } from "@/lib/scoring";

export function ConfidenceMeter({
  confidence,
  prominent = false,
  caption = "feature agreement",
}: {
  confidence: number;
  prominent?: boolean;
  caption?: string;
}) {
  const percent = agreementPercent(confidence);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className={`font-mono tabular-nums text-brass ${prominent ? "text-2xl" : "text-lg"}`}>{percent}%</p>
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{caption}</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
        <div className="h-full rounded-full bg-brass transition-[width] duration-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">Not a probability. Capped at 92%.</p>
    </div>
  );
}
