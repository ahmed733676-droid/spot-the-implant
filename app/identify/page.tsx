import type { Metadata } from "next";
import { Suspense } from "react";
import { Workstation } from "@/components/identify/workstation";

export const metadata: Metadata = {
  title: "Identify",
  description: "Crop a fixture, confirm radiographic cues, and read a capped short list.",
};

export default function IdentifyPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted-foreground">Setting the bench…</p>}>
      <Workstation />
    </Suspense>
  );
}
