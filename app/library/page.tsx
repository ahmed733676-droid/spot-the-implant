import type { Metadata } from "next";
import { Suspense } from "react";
import { LibraryBrowser } from "@/components/library-browser";

export const metadata: Metadata = {
  title: "Reference library",
  description: "Filter common implant systems by neck, connection, and body. Schematics only — not radiographs.",
};

export default function LibraryPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted-foreground">Opening the library…</p>}>
      <LibraryBrowser />
    </Suspense>
  );
}
