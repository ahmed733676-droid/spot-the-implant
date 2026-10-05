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
        <p className={`font-heading tabular-nums text-foreground ${prominent ? "text-5xl leading-none" : "text-3xl leading-none"}`}>
          {percent}
          <span className="font-mono text-sm text-brass">%</span>
        </p>
        <p className="text-right font-mono text-[11px] text-muted-foreground">{caption}</p>
      </div>
      <div className="mt-3 h-px bg-foreground/15" aria-hidden>
        <div className="h-1 -mt-px bg-brass" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">Not a probability. Ceiling 92.</p>
    </div>
  );
}
