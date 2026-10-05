import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/identify", label: "Identify" },
  { href: "/library", label: "Library" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "Limits" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-baseline gap-3">
          <span className="font-mono text-[11px] text-brass">PA</span>
          <span className="font-heading text-[1.35rem] leading-none tracking-tight text-foreground">
            Spot the Implant
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-foreground/80 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brass">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none border border-foreground/20 px-3 py-2 text-sm">
              Menu
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-48 border border-foreground/15 bg-popover p-1 shadow-none">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm hover:bg-secondary">
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/identify" className={cn(buttonVariants(), "hidden h-10 px-3.5 md:inline-flex")}>
            Read a film
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/15">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-heading text-2xl leading-none">Decision support. Not a device.</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Films stay in this browser. Do not order an abutment, a driver, or a rescue screw from this list.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-foreground/80">
          <Link href="/about" className="hover:text-brass">
            Limits
          </Link>
          <Link href="/how-it-works" className="hover:text-brass">
            Pipeline
          </Link>
          <Link href="/library" className="hover:text-brass">
            Library
          </Link>
        </div>
      </div>
    </footer>
  );
}
