import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Disclaimer } from "@/components/disclaimer";
import { FixtureSchematic } from "@/components/schematic";
import { buttonVariants } from "@/components/ui/button";
import { FEATURE_LABEL, phraseFor } from "@/lib/labels";
import { getSystem, identityOf, SYSTEMS } from "@/lib/systems";
import { FEATURE_KEYS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return SYSTEMS.map((system) => ({ slug: system.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const system = getSystem(slug);
  if (!system) return { title: "System" };
  return {
    title: `${identityOf(system).company} ${system.system}`,
    description: system.summary,
  };
}

export default async function SystemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = getSystem(slug);
  if (!system) notFound();
  const twins = system.twins.map((id) => getSystem(id)).filter((item) => item != null);

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="kicker">{identityOf(system).company}</p>
      <div className="mt-3 grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
        <div>
          <div className="film p-3">
            <FixtureSchematic profile={system.schematic} guides className="h-[420px] w-full" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Diagram of catalog features. Not a radiograph and not a clinical image of this system.
          </p>
        </div>
        <div>
          <h1 className="font-heading text-5xl leading-[0.92] tracking-tight sm:text-6xl">{system.system}</h1>
          {identityOf(system).manufacturer ? (
            <p className="mt-2 text-sm text-muted-foreground">Manufacturer · {identityOf(system).manufacturer}</p>
          ) : null}
          <p className="mt-2 text-sm text-muted-foreground">{system.aliases.join(" · ")}</p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{system.summary}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={`/identify?preset=${system.id}`} className={cn(buttonVariants(), "h-11 px-4")}>
              Walk this system on the bench
            </Link>
            <Link href="/library" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-4")}>
              Back to the library
            </Link>
          </div>
          <div className="mt-8">
            <Disclaimer compact />
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-heading text-2xl">What to look for</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {system.lookFor.map((item) => (
              <li key={item} className="border-l border-brass/50 pl-3">
                {item}
              </li>
            ))}
          </ul>
          <h2 className="mt-8 font-heading text-2xl">Easy to get wrong</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {system.pitfalls.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-heading text-2xl">Checklist values</h2>
          <dl className="mt-3 divide-y divide-foreground/15 border-y border-foreground/15">
            {FEATURE_KEYS.map((feature) => (
              <div key={feature} className="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2 text-sm">
                <dt className="text-muted-foreground">{FEATURE_LABEL[feature]}</dt>
                <dd>{system.accepts[feature].map((value) => phraseFor(feature, value)).join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {twins.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-heading text-2xl">Not separable on one periapical</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {twins.map((twin) => (
              <Link key={twin.id} href={`/library/${twin.id}`} className="border border-foreground/20 px-3 py-2 text-sm hover:border-foreground">
                {twin.brand} {twin.system}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="font-heading text-2xl">Close calls</h2>
        <ul className="mt-3 space-y-3">
          {system.confusers.map((confuser) => {
            const other = getSystem(confuser.id);
            return (
              <li key={confuser.id} className="border-t border-foreground/15 py-3 text-sm leading-relaxed">
                {other ? (
                  <Link href={`/library/${other.id}`} className="font-medium text-brass hover:underline">
                    {other.brand} {other.system}
                  </Link>
                ) : null}
                <p className="mt-1 text-muted-foreground">{confuser.note}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl">Sources</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {system.sources.map((source) => (
            <li key={source.url + source.title}>
              <a href={source.url} className="text-brass hover:underline" target="_blank" rel="noreferrer">
                {source.title}
              </a>
              <span className="ml-2 font-mono text-xs text-muted-foreground uppercase">{source.kind}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
