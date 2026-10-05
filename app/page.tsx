import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";
import { FixtureSchematic } from "@/components/schematic";
import { buttonVariants } from "@/components/ui/button";
import { agreementPercent, rankSystems } from "@/lib/scoring";
import { getSystem, identityOf, SYSTEMS } from "@/lib/systems";
import { emptyObservation } from "@/lib/types";
import { cn } from "@/lib/utils";

const preview = rankSystems({
  ...emptyObservation(),
  collar: "tulip",
  body: "parallel",
  thread: "standard",
  apex: "rounded",
  connection: "internal-octagon",
  platformSwitch: "no",
  lead: "single",
});

const strip = ["straumann-tl", "prama", "nobel-active", "ankylos", "megagen-anyridge", "astra-tx"]
  .map((id) => getSystem(id))
  .filter((system) => system != null);

export default function HomePage() {
  const leader = preview.brands[0];
  const leadLine = leader?.systems[0];
  if (!leader || !leadLine) {
    throw new Error("The teaching preview did not produce a company.");
  }
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <p className="kicker">For dentists and prosthodontists</p>
          <h1 className="mt-4 font-heading text-5xl leading-[0.95] tracking-tight text-balance sm:text-6xl">
            <span className="italic text-brass">Spot</span> the implant before you commit the abutment.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A short list of implant companies from a periapical or a single CBCT crop. You confirm every
            radiographic cue. The bench names the company first, then the line only when the film can separate it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/identify" className={cn(buttonVariants(), "h-11 px-5")}>
              Identify a fixture
            </Link>
            <Link href="/library" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}>
              Browse {SYSTEMS.length} systems
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              [String(SYSTEMS.length), "catalogued systems"],
              ["On device", "films are not uploaded"],
              ["92%", "hard cap on the score"],
              ["Company", "line only if it separates"],
            ].map(([value, label]) => (
              <div key={label} className="border-t border-brass/40 pt-3">
                <dt className="font-heading text-2xl text-bone">{value}</dt>
                <dd className="mt-1 text-xs leading-snug text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="film overflow-hidden rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-bone/70">
            <span className="font-mono tracking-widest">TEACHING FILM · SCHEMATIC</span>
            <span>Not a patient radiograph</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
            <FixtureSchematic profile={leadLine.system.schematic} className="h-72 w-full rounded-md" />
            <div className="flex flex-col justify-between rounded-md border border-white/10 bg-black/25 p-4">
              <div>
                <p className="kicker">Company · 01</p>
                <h2 className="mt-2 font-heading text-4xl leading-none">{leader.company}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {leader.lineSettled ? `Line · ${leadLine.system.system}` : "Line not settled"}
                </p>
                <p className="mt-4 font-mono text-3xl text-brass tabular-nums">
                  {agreementPercent(leader.confidence)}%
                </p>
                <p className="text-xs text-muted-foreground">company agreement · not a probability</p>
                <p className="mt-4 text-sm leading-relaxed text-bone/90">{leader.why}</p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {preview.brands[1] ? `Next company: ${preview.brands[1].company}. ` : null}
                {leader.whyNot[0]}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-black/20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          {[
            ["01", "Crop the fixture", "Isolate the body from the first thread to the apex. Keep a transmucosal collar in the frame. Leave the crown out."],
            ["02", "Confirm the cues", "Collar, interface, taper, thread, apex. Image measurements can suggest a cue. You accept it, or you leave it as not sure."],
            ["03", "Read the short list", "Top matches, the features that agreed, and why the neighbor is still possible. Not sure goes to the library or a specialist flag."],
          ].map(([index, title, body]) => (
            <article key={index}>
              <p className="font-mono text-xs text-brass">{index}</p>
              <h2 className="mt-2 font-heading text-2xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Reference shapes</p>
            <h2 className="mt-2 font-heading text-3xl">Silhouettes, not stolen radiographs</h2>
          </div>
          <Link href="/library" className="hidden text-sm text-brass hover:underline sm:inline">
            Open the library
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {strip.map((system) => (
            <Link
              key={system.id}
              href={`/library/${system.id}`}
              className="group rounded-md border border-border bg-card p-2 transition-colors hover:border-brass/50"
            >
              <FixtureSchematic profile={system.schematic} className="h-40 w-full rounded-sm" />
              <p className="mt-2 truncate font-heading text-lg leading-tight group-hover:text-brass">
                {identityOf(system).company}
              </p>
              <p className="truncate text-xs text-muted-foreground">{system.system}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 rounded-lg border border-border bg-card/60 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <h2 className="font-heading text-3xl">What this bench will not do</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>It will not claim a fixture is identified, and it will not show 100%.</li>
              <li>
                It will not separate Osstem from Hiossen on one periapical, so it will not name that company. Astra TX
                and EV stay one company, Astra Tech, with the line left open.
              </li>
              <li>It will not invent a radiograph. Every picture in the library is a labeled schematic.</li>
              <li>It has no clinical accuracy percentage, because it has not been tested on a labeled film set.</li>
            </ul>
          </div>
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}
