import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/library", label: "Library" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="min-w-0">
          <span className="kicker block leading-none">What&apos;s my implant?</span>
          <span className="font-heading text-lg leading-none tracking-tight text-foreground">
            Spot the Implant
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-md border border-border px-3 py-2 text-sm">
              Menu
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-44 rounded-md border border-border bg-popover p-2 shadow-lg">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="block rounded-md px-3 py-2 text-sm hover:bg-muted">
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/identify" className={cn(buttonVariants(), "h-10 px-3.5")}>
            Identify
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-end md:justify-between">
        <p className="max-w-xl leading-relaxed">
          Spot the Implant is decision support for dentists. It does not diagnose, measure, or clear a component.
          Films stay in this browser.
        </p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-foreground">
            Disclaimer
          </Link>
          <Link href="/how-it-works" className="hover:text-foreground">
            Architecture
          </Link>
          <Link href="/library" className="hover:text-foreground">
            Reference library
          </Link>
        </div>
      </div>
    </footer>
  );
}
