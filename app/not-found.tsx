import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <p className="kicker">Missing page</p>
      <h1 className="mt-3 font-heading text-5xl leading-[0.92] tracking-tight">That page is not on the bench.</h1>
      <p className="mt-4 text-muted-foreground">The library and Identify are the two working rooms.</p>
      <Link href="/" className="mt-6 inline-block text-sm underline decoration-brass underline-offset-4">
        Return home
      </Link>
    </div>
  );
}
