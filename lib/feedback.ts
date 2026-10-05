import type { Observation } from "@/lib/types";

const KEY = "spot-the-implant.feedback.v1";

export type Verdict = "correct" | "wrong" | "unsure" | "specialist";

export type FeedbackEntry = {
  id: string;
  at: string;
  verdict: Verdict;
  topSystemId: string | null;
  correctedSystemId: string | null;
  topCompany?: string | null;
  correctedCompany?: string | null;
  observation: Observation;
  note: string;
  teachingSchematic: boolean;
};

export function loadFeedback(): FeedbackEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as FeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveFeedback(entry: FeedbackEntry): FeedbackEntry[] {
  const next = [entry, ...loadFeedback()].slice(0, 200);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearFeedback() {
  localStorage.removeItem(KEY);
}

export function newFeedbackId() {
  return `case-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
