import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="kicker">Missing</p>
      <h1 className="mt-3 font-heading text-4xl">That page is not on the bench.</h1>
      <p className="mt-3 text-muted-foreground">The library and the identify flow are the two working rooms.</p>
      <Link href="/" className="mt-6 inline-block text-brass hover:underline">
        Return home
      </Link>
    </div>
  );
}
