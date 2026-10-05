"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { Disclaimer } from "@/components/disclaimer";
import { FixtureSchematic } from "@/components/schematic";
import { Badge } from "@/components/ui/badge";
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
  const result = useMemo(() => rankSystems(observation), [observation]);

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
          <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">Read the fixture.</h1>
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
                  className={`min-h-10 rounded-full border px-3 text-sm ${
                    step.id === stage
                      ? "border-brass bg-brass text-primary-foreground"
                      : "border-border text-muted-foreground disabled:opacity-40"
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
