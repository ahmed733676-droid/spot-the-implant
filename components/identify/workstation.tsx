"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { Disclaimer } from "@/components/disclaimer";
import { FixtureSchematic } from "@/components/schematic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cropRead } from "@/lib/crop-guide";
import { dicomBytesToDataUrl } from "@/lib/dicom";
import {
  clearFeedback,
  loadFeedback,
  newFeedbackId,
  saveFeedback,
  type FeedbackEntry,
  type Verdict,
} from "@/lib/feedback";
import { CHOICES, FEATURE_LABEL } from "@/lib/labels";
import { canonicalObservation, rankSystems, type RankResult } from "@/lib/scoring";
import type { Raster } from "@/lib/silhouette";
import { paintSchematic } from "@/lib/silhouette";
import { getSystem, identityOf, SYSTEMS } from "@/lib/systems";
import { emptyObservation, FEATURE_KEYS, type FeatureKey, type Observation } from "@/lib/types";
import { analyzeRaster, type Polarity, type VisionCue } from "@/lib/vision";

type Stage = "upload" | "crop" | "cues" | "results";
type Box = { x: number; y: number; w: number; h: number };

const STEPS: Array<{ id: Stage; label: string }> = [
  { id: "upload", label: "Film" },
  { id: "crop", label: "Crop" },
  { id: "cues", label: "Cues" },
  { id: "results", label: "Short list" },
];

export function Workstation() {
  const params = useSearchParams();
  const booted = useRef(false);
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [filmNote, setFilmNote] = useState<string | null>(null);
  const [teaching, setTeaching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  const [raster, setRaster] = useState<Raster | null>(null);
  const [polarity, setPolarity] = useState<Polarity>("bright");
  const [observation, setObservation] = useState<Observation>(emptyObservation());
  const [fromImage, setFromImage] = useState<Partial<Record<FeatureKey, boolean>>>({});
  const [labels, setLabels] = useState<FeedbackEntry[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [specialistOpen, setSpecialistOpen] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => setLabels(loadFeedback()), 0);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    const preset = params.get("preset");
    if (!preset) return;
    const system = getSystem(preset);
    if (!system) return;
    let cancelled = false;
    const handle = window.setTimeout(() => {
      if (cancelled || booted.current) return;
      booted.current = true;
      const painted = paintSchematic(system.schematic, 280, 560);
      setTeaching(true);
      setFileName(`${system.brand} ${system.system} schematic`);
      setImageUrl(rasterToDataUrl(painted));
      setCropUrl(rasterToDataUrl(painted));
      setRaster(painted);
      setFilmNote("Library schematic, loaded so you can see how this system scores. Not a patient radiograph.");
      setObservation(canonicalObservation(system));
      setFromImage({});
      setStage("results");
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [params]);

  const vision = useMemo(() => (raster ? analyzeRaster(raster, polarity) : null), [raster, polarity]);
  const result = useMemo(
    () =>
      rankSystems(
        observation,
        SYSTEMS,
        2,
        vision?.cues ?? [],
        FEATURE_KEYS.filter((feature) => fromImage[feature]),
      ),
    [observation, vision, fromImage],
  );

  async function takeFile(file: File) {
    setError(null);
    setBusy(true);
    setStatus(null);
    try {
      if (file.size > 40 * 1024 * 1024) {
        throw new Error("That file is over 40 MB. Export a JPEG or PNG crop from the viewer.");
      }
      const lower = file.name.toLowerCase();
      const dicom = lower.endsWith(".dcm") || lower.endsWith(".dicom") || file.type.includes("dicom");
      let url: string;
      let note: string | null = null;
      if (dicom) {
        const decoded = await dicomBytesToDataUrl(new Uint8Array(await file.arrayBuffer()));
        url = decoded.url;
        note = decoded.note;
      } else if (!file.type.startsWith("image/")) {
        throw new Error("Use a JPEG, PNG, WebP, or DICOM file.");
      } else {
        url = URL.createObjectURL(file);
      }
      setFileName(file.name);
      setImageUrl(url);
      setFilmNote(note);
      setTeaching(false);
      setCropUrl(null);
      setRaster(null);
      setObservation(emptyObservation());
      setFromImage({});
      setStage("crop");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read that file.");
    } finally {
      setBusy(false);
    }
  }

  function loadSchematic(id: string) {
    const system = getSystem(id);
    if (!system) return;
    const painted = paintSchematic(system.schematic, 280, 560);
    setTeaching(true);
    setFileName(`${system.brand} ${system.system} schematic`);
    setImageUrl(rasterToDataUrl(painted));
    setFilmNote("Schematic generated from the library. Not a patient radiograph.");
    setCropUrl(null);
    setRaster(null);
    setObservation(emptyObservation());
    setFromImage({});
    setError(null);
    setStage("crop");
  }

  function reset() {
    setStage("upload");
    setFileName("");
    setImageUrl(null);
    setFilmNote(null);
    setTeaching(false);
    setCropUrl(null);
    setRaster(null);
    setObservation(emptyObservation());
    setFromImage({});
    setStatus(null);
    setError(null);
  }

  function commit(
    verdict: Verdict,
    correctedSystemId: string | null,
    note = "",
    correctedCompany: string | null = null,
  ) {
    const entry: FeedbackEntry = {
      id: newFeedbackId(),
      at: new Date().toISOString(),
      verdict,
      topSystemId: result.ranked[0]?.system.id ?? null,
      correctedSystemId,
      topCompany: result.brands[0]?.company ?? null,
      correctedCompany,
      observation,
      note,
      teachingSchematic: teaching,
    };
    setLabels(saveFeedback(entry));
    const named = correctedSystemId ? getSystem(correctedSystemId) : null;
    const companyLabel = correctedCompany ?? (named ? identityOf(named).company : "the case");
    const lineLabel = named ? `${companyLabel} ${named.system}` : companyLabel;
    const text =
      verdict === "correct"
        ? `Saved on this browser: you marked ${lineLabel} as what you see. The film was not stored.`
        : verdict === "wrong"
          ? `Saved on this browser: the company call was wrong, and you recorded ${lineLabel}.`
          : verdict === "specialist"
            ? "Flagged for a specialist. The note stays on this browser. Bring the film and the record."
            : "Marked as not sure. The library is the next stop, not a parts order.";
    setStatus(text);
    setPickerOpen(false);
    setSpecialistOpen(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Identify</p>
          <h1 className="mt-2 font-heading text-4xl leading-[0.95] tracking-tight sm:text-5xl">Two companies from one film.</h1>
        </div>
        <ol className="flex flex-wrap gap-2">
          {STEPS.map((step, index) => {
            const current = STEPS.findIndex((item) => item.id === stage);
            const enabled = index <= current;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  disabled={!enabled || (index > 0 && !imageUrl)}
                  onClick={() => enabled && setStage(step.id)}
                  className={`min-h-10 border px-3 text-sm ${
                    step.id === stage
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/20 text-muted-foreground disabled:opacity-40"
                  }`}
                >
                  {index + 1} {step.label}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}
      {filmNote ? <p className="mt-4 text-sm text-brass">{filmNote}</p> : null}

      <div className="mt-6">
        {stage === "upload" ? (
          <UploadStage busy={busy} onFile={takeFile} onSchematic={loadSchematic} />
        ) : null}
        {stage === "crop" && imageUrl ? (
          <CropStage
            imageUrl={imageUrl}
            fileName={fileName}
            onBack={() => setStage("upload")}
            onConfirm={(next) => {
              setCropUrl(next.url);
              setRaster(next.raster);
              setStage("cues");
            }}
          />
        ) : null}
        {stage === "cues" && cropUrl && vision ? (
          <CueStage
            cropUrl={cropUrl}
            visionNotes={vision.notes}
            cues={vision.cues}
            polarity={polarity}
            onPolarity={setPolarity}
            observation={observation}
            fromImage={fromImage}
            onChange={(feature, value) => {
              setObservation((current) => ({ ...current, [feature]: value }));
              setFromImage((current) => ({ ...current, [feature]: false }));
            }}
            onGeometry={(geometry) => setObservation((current) => ({ ...current, geometry }))}
            onApply={(cue) => {
              setObservation((current) => ({ ...current, [cue.feature]: cue.value }) as Observation);
              setFromImage((current) => ({ ...current, [cue.feature]: true }));
            }}
            onApplyAll={() => {
              setObservation((current) => {
                const next = { ...current };
                for (const cue of vision.cues) {
                  (next as Record<string, string>)[cue.feature] = cue.value;
                }
                return next;
              });
              setFromImage((current) => {
                const next = { ...current };
                for (const cue of vision.cues) next[cue.feature] = true;
                return next;
              });
            }}
            onBack={() => setStage("crop")}
            onRank={() => setStage("results")}
          />
        ) : null}
        {stage === "results" ? (
          <ResultStage
            result={result}
            cropUrl={cropUrl}
            teaching={teaching}
            status={status}
            labelCount={labels.length}
            onMarkCompany={(company) => {
              const brand = result.brands.find((item) => item.company === company);
              const id = brand?.systems[0]?.system.id ?? null;
              const top = result.brands[0]?.company ?? null;
              commit(company === top ? "correct" : "wrong", id, "", company);
            }}
            onMarkLine={(id) => {
              const system = getSystem(id);
              const top = result.ranked[0]?.system.id;
              commit(id === top ? "correct" : "wrong", id, "", system ? identityOf(system).company : null);
            }}
            onUnsure={() => commit("unsure", null)}
            onSpecialist={(note) => commit("specialist", null, note)}
            onNone={() => setPickerOpen(true)}
            onBack={() => setStage(cropUrl ? "cues" : "upload")}
            onReset={reset}
            onExport={() => {
              const blob = new Blob([JSON.stringify(loadFeedback(), null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "spot-the-implant-labels.json";
              anchor.click();
              URL.revokeObjectURL(url);
            }}
            onClear={() => {
              clearFeedback();
              setLabels([]);
              setStatus("Labels cleared from this browser.");
            }}
            specialistOpen={specialistOpen}
            setSpecialistOpen={setSpecialistOpen}
          />
        ) : null}
      </div>

      <SystemPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(id) => commit("wrong", id)}
      />
    </div>
  );
}

function UploadStage({
  busy,
  onFile,
  onSchematic,
}: {
  busy: boolean;
  onFile: (file: File) => void;
  onSchematic: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          const file = event.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        className={`film flex min-h-80 flex-col items-center justify-center rounded-lg px-6 py-12 text-center ${
          over ? "outline outline-2 outline-brass" : ""
        }`}
      >
        <p className="kicker">Periapical or one CBCT frame</p>
        <p className="mt-3 max-w-md font-heading text-4xl leading-none text-bone">Drop the film. It stays on this device.</p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-bone/70">
          JPEG, PNG, WebP, or a DICOM file. Crop to the fixture on the next step. Include a collar if the implant
          is tissue level.
        </p>
        <Button type="button" className="mt-6 h-11 bg-brass px-5 text-film hover:bg-brass/90" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "Reading…" : "Choose a file"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.dcm,.dicom,application/dicom"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.target.value = "";
          }}
        />
      </div>
      <aside className="border-t border-foreground/15 pt-2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        <h2 className="font-heading text-3xl leading-none">No film yet</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Walk the crop and the cues on a labeled schematic. These are drawings, not radiographs.
        </p>
        <div className="mt-5 flex flex-col">
          <button type="button" className="border-t border-foreground/15 py-3 text-left text-sm hover:text-brass" onClick={() => onSchematic("straumann-tl")}>
            Tissue-level tulip
          </button>
          <button type="button" className="border-y border-foreground/15 py-3 text-left text-sm hover:text-brass" onClick={() => onSchematic("megagen-anyridge")}>
            Knife-thread, MegaGen
          </button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Or <Link href="/library" className="text-brass underline underline-offset-4">browse the library</Link> and open any system on the bench.
        </p>
      </aside>
    </div>
  );
}

function CropStage({
  imageUrl,
  fileName,
  onBack,
  onConfirm,
}: {
  imageUrl: string;
  fileName: string;
  onBack: () => void;
  onConfirm: (next: { url: string; raster: Raster }) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ mode: string; x: number; y: number; box: Box } | null>(null);
  const [crop, setCrop] = useState<Box>({ x: 0.27, y: 0.08, w: 0.46, h: 0.84 });
  const advice = cropRead(crop);

  function begin(event: ReactPointerEvent<HTMLElement>, mode: string) {
    event.preventDefault();
    event.stopPropagation();
    drag.current = { mode, x: event.clientX, y: event.clientY, box: crop };
    const onMove = (moveEvent: PointerEvent) => {
      if (!drag.current || !frameRef.current) return;
      const rect = frameRef.current.getBoundingClientRect();
      const dx = (moveEvent.clientX - drag.current.x) / rect.width;
      const dy = (moveEvent.clientY - drag.current.y) / rect.height;
      const start = drag.current.box;
      const next = { ...start };
      const handle = drag.current.mode;
      if (handle === "move") {
        next.x += dx;
        next.y += dy;
      } else {
        if (handle === "ne" || handle === "se") next.w += dx;
        if (handle === "sw" || handle === "se") next.h += dy;
        if (handle === "nw" || handle === "sw") {
          next.x += dx;
          next.w -= dx;
        }
        if (handle === "nw" || handle === "ne") {
          next.y += dy;
          next.h -= dy;
        }
      }
      setCrop(clampBox(next));
    };
    const onUp = () => {
      drag.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="film rounded-lg p-3 sm:p-4">
        <div className="flex justify-center">
          <div
            ref={frameRef}
            className="relative inline-block max-w-full touch-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt={fileName ? `Uploaded film ${fileName}` : "Uploaded film"}
              className="block max-h-[70vh] max-w-full select-none"
              draggable={false}
            />
            <div
              className="absolute border border-brass bg-brass/10"
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.w * 100}%`,
                height: `${crop.h * 100}%`,
              }}
              onPointerDown={(event) => begin(event, "move")}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[22%] items-start border-b border-dashed border-brass/50 px-2 pt-1">
                <span className="font-mono text-[10px] tracking-widest text-brass">COLLAR</span>
              </div>
              <div className="pointer-events-none absolute inset-x-0 top-[22%] flex h-[56%] items-start border-b border-dashed border-brass/50 px-2 pt-1">
                <span className="font-mono text-[10px] tracking-widest text-brass">THREADS</span>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[22%] items-end px-2 pb-1">
                <span className="font-mono text-[10px] tracking-widest text-brass">APEX</span>
              </div>
              {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                <button
                  key={corner}
                  type="button"
                  aria-label={`Resize crop ${corner}`}
                  className={`absolute size-5 rounded-sm border border-brass bg-background ${
                    corner.includes("n") ? "-top-2" : "-bottom-2"
                  } ${corner.includes("w") ? "-left-2" : "-right-2"}`}
                  onPointerDown={(event) => begin(event, corner)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="font-heading text-3xl">Crop the fixture.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Drag the box onto one implant. The bands follow the published reading order: collar, threads, apex. Leave
          the crown and the neighboring root outside.
        </p>
        <p
          className={`mt-4 rounded-md border px-3 py-2 text-sm leading-relaxed ${
            advice.tone === "ready" ? "border-foreground/15 text-muted-foreground" : "border-brass text-foreground"
          }`}
        >
          <span className="font-medium text-brass">{advice.title}. </span>
          {advice.text}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            type="button"
            className="h-11"
            onClick={() => {
              const image = imgRef.current;
              if (!image) return;
              const framed = rasterFromCrop(image, crop);
              if (framed.width < 32 || framed.height < 32) {
                return;
              }
              onConfirm({ url: rasterToDataUrl(framed), raster: framed });
            }}
          >
            Use this crop
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={() => setCrop({ x: 0.08, y: 0.04, w: 0.84, h: 0.92 })}>
            Use most of the frame
          </Button>
          <Button type="button" variant="ghost" className="h-11" onClick={onBack}>
            Choose a different film
          </Button>
        </div>
      </div>
    </div>
  );
}

function CueStage({
  cropUrl,
  cues,
  visionNotes,
  polarity,
  onPolarity,
  observation,
  fromImage,
  onChange,
  onGeometry,
  onApply,
  onApplyAll,
  onBack,
  onRank,
}: {
  cropUrl: string;
  cues: VisionCue[];
  visionNotes: string[];
  polarity: Polarity;
  onPolarity: (polarity: Polarity) => void;
  observation: Observation;
  fromImage: Partial<Record<FeatureKey, boolean>>;
  onChange: (feature: FeatureKey, value: string) => void;
  onGeometry: (geometry: Observation["geometry"]) => void;
  onApply: (cue: VisionCue) => void;
  onApplyAll: () => void;
  onBack: () => void;
  onRank: () => void;
}) {
  const answered = FEATURE_KEYS.filter((feature) => observation[feature] !== "unknown").length;
  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <div className="film rounded-lg p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cropUrl} alt="Cropped fixture" className="mx-auto max-h-[520px] w-full object-contain" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant={polarity === "bright" ? "default" : "outline"} className="h-10" onClick={() => onPolarity("bright")}>
            Fixture is bright
          </Button>
          <Button type="button" variant={polarity === "dark" ? "default" : "outline"} className="h-10" onClick={() => onPolarity("dark")}>
            Fixture is dark
          </Button>
        </div>
        <ul className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
          {visionNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-3xl">Confirm only what you can see.</h2>
          <Button type="button" variant="outline" className="h-10" onClick={onApplyAll} disabled={cues.length === 0}>
            Apply image cues
          </Button>
        </div>
        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Beam vs the long axis</legend>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Sahiwal could use the tables only near a straight-on beam. If the threads are obviously skewed, mark the film angled.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["orthogonal", "Nearly straight on"],
                ["angled", "Obviously angled"],
                ["unknown", "Not sure"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={observation.geometry === value}
                onClick={() => onGeometry(value)}
                className={`min-h-11 rounded-md border px-3 text-sm ${
                  observation.geometry === value
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Image measurements of collar, taper, thread, and apex already count as soft evidence. Using an image cue keeps that label. It does not become a cue you confirmed, and it does not count toward naming a company. Pick a value yourself when you can see it. The junction line and the connection are never guessed.
        </p>
        <div className="mt-5 space-y-5">
          {FEATURE_KEYS.map((feature) => {
            const suggestion = cues.find((cue) => cue.feature === feature);
            return (
              <fieldset key={feature}>
                <legend className="text-sm font-medium">{FEATURE_LABEL[feature]}</legend>
                {suggestion ? (
                  <button
                    type="button"
                    onClick={() => onApply(suggestion)}
                    className="mt-2 block text-left text-xs text-brass hover:underline"
                  >
                    {fromImage[feature]
                      ? "Image, accepted — still soft: "
                      : "Use this image cue (stays soft): "}
                    {CHOICES[feature].find((choice) => choice.value === suggestion.value)?.label} · {suggestion.strength} ·{" "}
                    {suggestion.note}
                  </button>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {CHOICES[feature].map((choice) => {
                    const active = observation[feature] === choice.value;
                    return (
                      <button
                        key={choice.value}
                        type="button"
                        aria-pressed={active}
                        title={choice.hint}
                        onClick={() => onChange(feature, choice.value)}
                        className={`min-h-11 rounded-md border px-3 text-left text-sm ${
                          active ? "border-foreground bg-foreground text-background" : "border-foreground/20 text-muted-foreground"
                        }`}
                      >
                        {choice.label}
                        {active && fromImage[feature] && choice.value !== "unknown" ? (
                          <span className="ml-2 font-mono text-[10px] text-background/80">IMAGE</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="button" className="h-11" onClick={onRank} disabled={answered === 0}>
            Rank a short list
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={onBack}>
            Adjust the crop
          </Button>
          <Link href="/library" className="inline-flex h-11 items-center justify-center px-3 text-sm text-brass hover:underline">
            Not sure — browse the library
          </Link>
        </div>
        {answered === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Mark at least one cue, or leave the case and browse.</p>
        ) : null}
      </div>
    </div>
  );
}

function lineCaption(system: { system: string; aliases: string[] }) {
  if (system.aliases.some((alias) => alias.toLowerCase() === "vetronix")) {
    return `${system.system} (also called Vetronix)`;
  }
  return system.system;
}

function ResultStage({
  result,
  cropUrl,
  teaching,
  status,
  labelCount,
  onMarkCompany,
  onMarkLine,
  onUnsure,
  onSpecialist,
  onNone,
  onBack,
  onReset,
  onExport,
  onClear,
  specialistOpen,
  setSpecialistOpen,
}: {
  result: RankResult;
  cropUrl: string | null;
  teaching: boolean;
  status: string | null;
  labelCount: number;
  onMarkCompany: (company: string) => void;
  onMarkLine: (id: string) => void;
  onUnsure: () => void;
  onSpecialist: (note: string) => void;
  onNone: () => void;
  onBack: () => void;
  onReset: () => void;
  onExport: () => void;
  onClear: () => void;
  specialistOpen: boolean;
  setSpecialistOpen: (open: boolean) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <div>
      <Disclaimer />
      {teaching ? (
        <p className="mt-3 text-sm text-brass">
          These cues came from a library schematic. They are not a reading of a patient film.
        </p>
      ) : null}
      {result.libraryUnsure ? (
        <section className="mt-4 border border-foreground/25 px-4 py-4">
          <p className="font-mono text-[11px] text-brass">Not in library / unsure</p>
          <p className="mt-2 text-sm leading-relaxed">{result.libraryUnsure.reason}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The two names below are the closest reads in this library. They are not a diagnosis.
          </p>
        </section>
      ) : null}
      {result.clusterNote ? (
        <p className="mt-4 border-l-2 border-brass pl-4 text-sm leading-relaxed">{result.clusterNote}</p>
      ) : null}
      {result.literature.length > 0 ? (
        <section className="mt-4 border-t border-foreground/15 pt-4">
          <h2 className="font-mono text-[11px] text-brass">Per the literature</h2>
          <ul className="mt-2 space-y-3">
            {result.literature.map((note) => (
              <li key={note.text} className="text-sm leading-relaxed">
                <p>{note.text}</p>
                <a href={note.url} className="mt-1 inline-block text-xs text-brass hover:underline" target="_blank" rel="noreferrer">
                  {note.cite}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {result.noEvidence ? (
        <div className="mt-6 border border-dashed border-foreground/25 px-4 py-12 text-center">
          <p className="font-heading text-4xl leading-none">No cues, no ranking.</p>
          <Button type="button" className="mt-4 h-11" onClick={onBack}>
            Go back and mark what you see
          </Button>
        </div>
      ) : (
        <>
        <p className="mt-6 max-w-xl text-sm text-muted-foreground">
          {result.flat
            ? "Two names from a tie. This is not a ranking. The note above says who else fits the same cues."
            : "Two companies. A line is named only when these cues separate it inside that company."}
        </p>
        {cropUrl ? (
          <figure className="film mt-5 w-fit p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cropUrl} alt="Your crop beside the short list" className="h-36 w-auto object-contain" />
            <figcaption className="mt-1 font-mono text-[11px] text-phosphor">Your crop</figcaption>
          </figure>
        ) : null}
        <ol className="mt-6 grid gap-10 lg:grid-cols-2" aria-live="polite">
          {result.brands.slice(0, 2).map((brand, index) => {
            const lead = brand.systems[0];
            if (!lead) return null;
            const status = result.flat
              ? "Same evidence"
              : index > 0
                ? "Also possible"
                : !brand.companySettled
                  ? "Company unsettled"
                  : !brand.lineSettled
                    ? "Company only"
                    : result.evidence === "supported"
                      ? "Clearer agreement"
                      : result.evidence === "partial"
                        ? "Partial"
                        : "Thin evidence";
            return (
              <li key={brand.company} className="border-t-2 border-foreground pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-brass">
                      {result.flat ? "Same evidence" : `0${index + 1}`}
                    </p>
                    <h2 className="font-heading text-4xl leading-none">{brand.company}</h2>
                    {brand.manufacturer ? (
                      <p className="mt-1 text-sm text-muted-foreground">Manufacturer · {brand.manufacturer}</p>
                    ) : null}
                  </div>
                  <p className="font-mono text-[11px] text-brass">{status}</p>
                </div>
                <p className="mt-2 text-sm text-foreground/80">
                  {result.flat
                    ? "Line not called. Same generic cues."
                    : brand.lineSettled
                      ? `Line: ${lineCaption(lead.system)}`
                      : `Line not settled: ${brand.systems.map((row) => lineCaption(row.system)).join(" · ")}`}
                </p>
                <div className="mt-4 max-w-sm">
                  <ConfidenceMeter
                    confidence={brand.confidence}
                    prominent={index === 0}
                    caption={
                      result.flat
                        ? "not a ranking"
                        : index > 0
                          ? brand.confidence + 0.005 < (result.brands[0]?.confidence ?? 1)
                            ? "lower on these cues"
                            : "same cap on these cues"
                          : brand.companySettled
                            ? "company agreement"
                            : "company unsettled"
                    }
                  />
                </div>
                <div className="mt-4 grid grid-cols-[5.5rem_1fr] gap-3">
                  <div className={brand.systems.length > 1 ? "space-y-2" : ""}>
                    {brand.systems.slice(0, 2).map((row) => (
                      <FixtureSchematic
                        key={row.system.id}
                        profile={row.system.schematic}
                        title={`${lineCaption(row.system)} schematic, not a radiograph`}
                        className="h-32 w-full"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed">{brand.why}</p>
                    {brand.whyNot.length > 0 ? (
                      <div className="mt-3">
                        <p className="font-mono text-[11px] text-brass">Why it may be wrong</p>
                        <ul className="mt-1 space-y-1 text-sm leading-relaxed text-muted-foreground">
                          {brand.whyNot.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted-foreground">
                      {lead.matches.map((match) => (
                        <li key={match.feature}>
                          {match.phrase}
                          {match.source === "accepted" ? " · image, accepted" : match.source === "vision" ? " · image" : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" className="h-11" onClick={() => onMarkCompany(brand.company)}>
                    This is the company I see
                  </Button>
                  {brand.lineSettled ? (
                    <Button type="button" variant="outline" className="h-11" onClick={() => onMarkLine(lead.system.id)}>
                      This line: {lead.system.system}
                    </Button>
                  ) : (
                    brand.systems.map((row) => (
                      <Button
                        key={row.system.id}
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => onMarkLine(row.system.id)}
                      >
                        Line: {row.system.system}
                      </Button>
                    ))
                  )}
                  <Link
                    href={`/library/${lead.system.id}`}
                    className="inline-flex h-11 items-center px-2 text-sm text-brass underline underline-offset-4"
                  >
                    Open in the library
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
        </>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="outline" className="h-11" onClick={onUnsure}>
          Not sure — save and browse later
        </Button>
        <Button type="button" variant="outline" className="h-11" onClick={() => setSpecialistOpen(true)}>
          Flag for a specialist
        </Button>
        <Button type="button" variant="outline" className="h-11" onClick={onNone}>
          None of these
        </Button>
        <Link href="/library" className="inline-flex h-11 items-center text-sm text-brass hover:underline">
          Browse the library
        </Link>
      </div>
      {status ? (
        <p role="status" className="mt-4 rounded-md border border-good/30 bg-good/10 px-3 py-2 text-sm">
          {status}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>{labelCount} labels on this browser</span>
        <button type="button" className="text-brass hover:underline" onClick={onExport}>
          Export JSON
        </button>
        <button type="button" className="hover:underline" onClick={onClear}>
          Clear labels
        </button>
        <button type="button" className="hover:underline" onClick={onBack}>
          Edit cues
        </button>
        <button type="button" className="hover:underline" onClick={onReset}>
          Start over
        </button>
      </div>

      <Dialog open={specialistOpen} onOpenChange={setSpecialistOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Flag for a specialist</DialogTitle>
            <DialogDescription>
              This stores a note on this browser only. It does not send the film anywhere. Bring the radiograph and the surgical record to the person who will restore it.
            </DialogDescription>
          </DialogHeader>
          <label className="text-sm">
            Note
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-1 min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="What is ambiguous, and who should see it?"
            />
          </label>
          <Button type="button" className="h-11" onClick={() => onSpecialist(note)}>
            Save the flag
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SystemPicker({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = SYSTEMS.filter((system) => {
    const haystack = `${system.brand} ${system.system} ${system.aliases.join(" ")}` .toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Which company was it?</DialogTitle>
          <DialogDescription>
            Pick the company, then the line if you know it. The correction stays on this browser. The film is not stored.
          </DialogDescription>
        </DialogHeader>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search systems" aria-label="Search systems" className="h-10" />
        <ul className="max-h-80 space-y-1 overflow-auto">
          {filtered.map((system) => (
            <li key={system.id}>
              <button
                type="button"
                className="flex w-full min-h-11 items-center justify-between rounded-md px-2 text-left text-sm hover:bg-muted"
                onClick={() => onPick(system.id)}
              >
                <span>
                  {identityOf(system).company} <span className="text-muted-foreground">{system.system}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function clampBox(box: Box): Box {
  const w = Math.min(Math.max(box.w, 0.12), 1);
  const h = Math.min(Math.max(box.h, 0.12), 1);
  return {
    w,
    h,
    x: Math.min(Math.max(box.x, 0), 1 - w),
    y: Math.min(Math.max(box.y, 0), 1 - h),
  };
}

function rasterFromCrop(image: HTMLImageElement, crop: Box): Raster {
  const sx = crop.x * image.naturalWidth;
  const sy = crop.y * image.naturalHeight;
  const sw = Math.max(1, crop.w * image.naturalWidth);
  const sh = Math.max(1, crop.h * image.naturalHeight);
  const scale = Math.min(1, 720 / sw);
  const width = Math.max(1, Math.round(sw * scale));
  const height = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return { width: 1, height: 1, data: new Uint8ClampedArray(4) };
  context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
  return { width, height, data: context.getImageData(0, 0, width, height).data };
}

function rasterToDataUrl(raster: Raster) {
  const canvas = document.createElement("canvas");
  canvas.width = raster.width;
  canvas.height = raster.height;
  const context = canvas.getContext("2d");
  if (!context) return "";
  const copy = new Uint8ClampedArray(raster.data.byteLength);
  copy.set(raster.data);
  context.putImageData(new ImageData(copy, raster.width, raster.height), 0, 0);
  return canvas.toDataURL("image/png");
}
