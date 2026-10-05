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

const strip = ["straumann-tl", "prama", "nobel-active", "ankylos", "megagen-st", "astra-tx"]
  .map((id) => getSystem(id))
  .filter((system) => system != null);

const steps = [
  {
    n: "01",
    title: "Crop the fixture",
    body: "Collar, threads, apex. Leave the crown and the next root outside the box.",
  },
  {
    n: "02",
    title: "Confirm the cues",
    body: "What you mark is hard evidence. An image measurement stays soft until you accept it.",
  },
  {
    n: "03",
    title: "Read two names",
    body: "The company comes first. The line stays open until the film can actually separate it.",
  },
];

export default function HomePage() {
  const pair = preview.brands.slice(0, 2);
  const leader = pair[0];
  const leadLine = leader?.systems[0];
  if (!leader || !leadLine) {
    throw new Error("The teaching preview did not produce a company.");
  }

  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end lg:py-16">
        <div>
          <p className="kicker">Periapical → company</p>
          <h1 className="mt-4 max-w-xl font-heading text-[3.4rem] leading-[0.88] tracking-tight text-balance sm:text-7xl">
            Two names.
            <span className="mt-1 block italic text-brass">Then stop.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-snug text-foreground/80">
            A periapical or one CBCT crop. You confirm the cues you can defend. The bench returns two manufacturers,
            a reason, and a refusal when the film cannot split them.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/identify" className={cn(buttonVariants(), "h-12 px-5 text-base")}>
              Identify a film
            </Link>
            <Link href="/library" className="inline-flex h-12 items-center px-1 text-sm underline decoration-brass underline-offset-4">
              Browse the library
            </Link>
          </div>
        </div>

        <figure className="film p-4 sm:p-5">
          <figcaption className="flex items-baseline justify-between gap-3 font-mono text-[11px] text-phosphor">
            <span>Teaching schematic</span>
            <span>Not a patient film</span>
          </figcaption>
          <div className="mt-4 grid gap-4 sm:grid-cols-[7.5rem_1fr]">
            <FixtureSchematic profile={leadLine.system.schematic} className="h-52 w-full sm:h-64" />
            <ol className="divide-y divide-phosphor/30">
              {pair.map((brand, index) => (
                <li key={brand.company} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-mono text-[11px] text-phosphor">
                    {preview.flat ? "Tied" : index === 0 ? "Company" : "Also open"}
                  </p>
                  <p className="mt-1 font-heading text-3xl leading-none">{brand.company}</p>
                  <p className="mt-1 text-sm text-bone/75">
                    {brand.lineSettled
                      ? brand.systems[0]?.system.system
                      : "Line not settled"}
                    <span className="ml-3 font-mono text-phosphor">{agreementPercent(brand.confidence)}%</span>
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-4 line-clamp-3 border-t border-phosphor/25 pt-3 text-sm leading-relaxed text-bone/80">{leader.why}</p>
        </figure>
      </section>

      <section className="border-y border-foreground/15">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
          {[
            ["Two", "companies on the short list"],
            ["On device", "the film is never uploaded"],
            ["92", "hard ceiling, not a probability"],
            [String(SYSTEMS.length), "sourced systems in the library"],
          ].map(([value, label], index) => (
            <div
              key={label}
              className={`px-4 py-5 sm:px-6 ${index > 0 ? "border-foreground/15 md:border-l" : ""} ${index === 2 || index === 3 ? "border-t md:border-t-0" : ""} ${index % 2 === 1 ? "border-l" : ""}`}
            >
              <dt className="font-heading text-4xl leading-none">{value}</dt>
              <dd className="mt-2 max-w-[12rem] text-sm leading-snug text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
        <div>
          <p className="kicker">How it works</p>
          <h2 className="mt-3 font-heading text-4xl leading-[0.95] tracking-tight">
            Crop. Confirm. <span className="italic">Refuse</span> when you must.
          </h2>
          <Link href="/how-it-works" className="mt-5 inline-block text-sm underline decoration-brass underline-offset-4">
            Read the pipeline
          </Link>
        </div>
        <ol>
          {steps.map((step) => (
            <li key={step.n} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-foreground/15 py-5">
              <span className="font-mono text-sm text-brass">{step.n}</span>
              <div>
                <h3 className="font-heading text-2xl leading-none">{step.title}</h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-film text-bone">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[11px] text-phosphor">Reference shapes</p>
              <h2 className="mt-2 font-heading text-4xl leading-none text-bone">Drawn. Not borrowed films.</h2>
            </div>
            <Link href="/library" className="text-sm text-phosphor underline underline-offset-4">
              Open the library
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-px bg-phosphor/20 sm:grid-cols-3 lg:grid-cols-6">
            {strip.map((system) => (
              <li key={system.id} className="bg-film">
                <Link href={`/library/${system.id}`} className="block p-2 hover:bg-white/5">
                  <FixtureSchematic profile={system.schematic} className="h-36 w-full" />
                  <p className="mt-2 font-heading text-lg leading-tight text-bone">{identityOf(system).company}</p>
                  <p className="mt-1 font-mono text-[11px] leading-tight text-bone/60">{system.system}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="kicker">Limits</p>
          <h2 className="mt-3 font-heading text-4xl leading-[0.95] tracking-tight">What this bench will not claim.</h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/80">
            <li className="border-t border-foreground/15 pt-4">It will not show 100, and it will not say a fixture is identified.</li>
            <li className="border-t border-foreground/15 pt-4">
              Osstem and Hiossen stay unnamed as a company. Astra TX and EV stay Astra Tech, line open.
            </li>
            <li className="border-t border-foreground/15 pt-4">
              Every library picture is a schematic. No clinical radiograph is passed off as ours.
            </li>
            <li className="border-t border-foreground/15 pt-4">
              There is no clinical accuracy percentage. This has not been tested on a labeled film set.
            </li>
          </ul>
          <Link href="/about" className="mt-6 inline-block text-sm underline decoration-brass underline-offset-4">
            Full disclaimer
          </Link>
        </div>
        <Disclaimer />
      </section>
    </div>
  );
}
