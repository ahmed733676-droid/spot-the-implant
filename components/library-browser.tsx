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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="kicker">Reference library</p>
      <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h1 className="max-w-xl font-heading text-5xl leading-none tracking-tight">
          {SYSTEMS.length} systems, drawn as schematics.
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Filter by what you can see. Open a card for the sources, the look-alikes, and a walkthrough on the bench.
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
              className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground"
              style={{ colorScheme: "dark" }}
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
        <div className="mt-6 rounded-lg border border-dashed border-border px-4 py-12 text-center">
          <p className="font-heading text-2xl">Nothing in the library matches that filter.</p>
          <button
            type="button"
            className="mt-3 text-sm text-brass hover:underline"
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
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((system) => (
            <li key={system.id}>
              <Link
                href={`/library/${system.id}`}
                className="flex h-full gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-brass/50"
              >
                <FixtureSchematic profile={system.schematic} className="h-36 w-24 shrink-0 rounded-md" />
                <span className="min-w-0">
                  <span className="block font-heading text-2xl leading-tight">{identityOf(system).company}</span>
                  <span className="mt-1 block text-sm text-bone/80">{system.system}</span>
                  {identityOf(system).manufacturer ? (
                    <span className="mt-1 block text-xs text-muted-foreground">{identityOf(system).manufacturer}</span>
                  ) : null}
                  <span className="mt-2 block text-sm leading-snug text-muted-foreground">{system.lookFor[0]}</span>
                </span>
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
      <span className="w-16 shrink-0 pt-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`min-h-10 rounded-full border px-3 text-sm ${
                active
                  ? "border-brass bg-brass text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-brass/40 hover:text-foreground"
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
