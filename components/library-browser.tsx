"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FixtureSchematic } from "@/components/schematic";
import { Input } from "@/components/ui/input";
import { companies, identityOf, SYSTEMS } from "@/lib/systems";
import type { Body, Collar, Connection } from "@/lib/types";

const collars: Array<{ value: Collar | "all"; label: string }> = [
  { value: "all", label: "Any neck" },
  { value: "tulip", label: "Tulip" },
  { value: "hyperbolic", label: "Convergent" },
  { value: "microthread", label: "Microthread" },
  { value: "machined-band", label: "Machined" },
  { value: "bone-level", label: "Bone level" },
];

const connections: Array<{ value: Connection | "all"; label: string }> = [
  { value: "all", label: "Any seat" },
  { value: "external-hex", label: "External hex" },
  { value: "internal-hex", label: "Internal hex" },
  { value: "internal-conical", label: "Internal cone" },
  { value: "tube-in-tube", label: "Tube-in-tube" },
  { value: "subcrestal-conical", label: "Subcrestal" },
];

const bodies: Array<{ value: Body | "all"; label: string }> = [
  { value: "all", label: "Any body" },
  { value: "parallel", label: "Parallel" },
  { value: "mild-taper", label: "Mild taper" },
  { value: "strong-taper", label: "Strong taper" },
];

export function LibraryBrowser() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [collar, setCollar] = useState<Collar | "all">("all");
  const [connection, setConnection] = useState<Connection | "all">("all");
  const [body, setBody] = useState<Body | "all">("all");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SYSTEMS.filter((system) => {
      const identity = identityOf(system);
      if (brand !== "all" && identity.company !== brand) return false;
      if (collar !== "all" && !system.accepts.collar.includes(collar)) return false;
      if (connection !== "all" && !system.accepts.connection.includes(connection)) return false;
      if (body !== "all" && !system.accepts.body.includes(body)) return false;
      if (!needle) return true;
      const haystack = [
        identity.company,
        identity.manufacturer ?? "",
        system.brand,
        system.system,
        system.summary,
        ...system.aliases,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, brand, collar, connection, body]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 pb-18 sm:px-6 lg:pt-24 lg:pb-28">
      <p className="kicker">Library</p>
      <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h1 className="max-w-xl font-heading text-5xl leading-[0.92] tracking-tight sm:text-6xl">
          {SYSTEMS.length} systems. <span className="italic text-brass">No borrowed films.</span>
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Filter by what you can see. Open a row for the sources, the look-alikes, and a walkthrough on the bench.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company, Zimmer, Astra, synOcta…"
            aria-label="Search the library"
            className="h-11"
          />
          <label className="text-sm">
            <span className="sr-only">Brand</span>
            <select
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              aria-label="Company"
              className="h-11 w-full border border-foreground/20 bg-background px-3 text-sm text-foreground"
            >
              <option value="all">All companies</option>
              {companies().map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ChipRow label="Neck" options={collars} value={collar} onChange={setCollar} />
        <ChipRow label="Seat" options={connections} value={connection} onChange={setConnection} />
        <ChipRow label="Body" options={bodies} value={body} onChange={setBody} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "system" : "systems"}
      </p>

      {results.length === 0 ? (
        <div className="mt-8 border border-dashed border-foreground/25 px-4 py-14 text-center">
          <p className="font-heading text-4xl leading-none">Nothing matches that filter.</p>
          <p className="mt-3 text-sm text-muted-foreground">Try another neck, or clear the search.</p>
          <button
            type="button"
            className="mt-4 text-sm text-brass underline underline-offset-4"
            onClick={() => {
              setQuery("");
              setBrand("all");
              setCollar("all");
              setConnection("all");
              setBody("all");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-6 border-t border-foreground/15">
          {results.map((system) => (
            <li key={system.id} className="border-b border-foreground/15">
              <Link
                href={`/library/${system.id}`}
                className="grid grid-cols-[5.5rem_1fr] gap-4 py-4 hover:bg-secondary/70 sm:grid-cols-[7.5rem_14rem_1fr] sm:items-center"
              >
                <FixtureSchematic profile={system.schematic} className="h-28 w-full sm:h-32" />
                <span className="min-w-0 sm:col-span-1">
                  <span className="block font-heading text-3xl leading-none">{identityOf(system).company}</span>
                  <span className="mt-1 block text-sm">{system.system}</span>
                  {identityOf(system).manufacturer ? (
                    <span className="mt-1 block font-mono text-[11px] text-muted-foreground">{identityOf(system).manufacturer}</span>
                  ) : null}
                </span>
                <span className="col-span-2 text-sm leading-snug text-muted-foreground sm:col-span-1">{system.lookFor[0]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChipRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <span className="w-16 shrink-0 pt-2 font-mono text-[11px] text-brass">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`min-h-10 border px-3 text-sm ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/15 text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
