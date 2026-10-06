"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/identify", index: "01", label: "Identify", detail: "Drop a PA, get two names" },
  { href: "/library", index: "02", label: "Library", detail: "Schematics and the sources behind them" },
  { href: "/how-it-works", index: "03", label: "How it works", detail: "Cues, then a company, then a line" },
  { href: "/about", index: "04", label: "Limits", detail: "Decision support. Not a device." },
] as const;

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setOpen(false);
    setVisible(false);
  }

  function openMenu() {
    setPresent(true);
    setOpen(true);
    window.requestAnimationFrame(() => setVisible(true));
  }

  function closeMenu() {
    setOpen(false);
    setVisible(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPresent(false);
  }

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (media.matches) closeMenu();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!present) return;
    const header = headerRef.current;
    const scrollY = window.scrollY;
    const previous = document.body.style.cssText;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    function focusable() {
      if (!header) return [];
      return [...header.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
        (node) => node.tabIndex !== -1 && node.getClientRects().length > 0,
      );
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        closeRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !open) return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.cssText = previous;
      window.scrollTo(0, scrollY);
    };
  }, [present, open]);

  return (
    <header ref={headerRef} className="sticky top-0 z-[70]">
      <div className={`relative z-[80] border-b border-foreground/15 ${open || present ? "bg-background" : "bg-background/95"}`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-baseline gap-3">
          <span className="font-mono text-[11px] text-brass">PA</span>
          <span className="font-heading text-[1.35rem] leading-none tracking-tight text-foreground">
            Spot the Implant
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex" aria-label="Primary">
          {links.map((link) => {
            const current = isCurrent(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={current ? "text-brass underline decoration-brass underline-offset-4" : "text-foreground/80 hover:text-brass"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button
            ref={closeRef}
            type="button"
            className="relative grid size-11 place-items-center border border-foreground/20 md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => (open ? closeMenu() : openMenu())}
          >
            <span
              className={`absolute h-px w-4 bg-foreground transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-45" : "-translate-y-1.5"}`}
            />
            <span
              className={`absolute h-px w-4 bg-foreground transition-opacity duration-200 motion-reduce:transition-none ${open ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute h-px w-4 bg-foreground transition-transform duration-200 motion-reduce:transition-none ${open ? "-rotate-45" : "translate-y-1.5"}`}
            />
          </button>
          <Link href="/identify" className={cn(buttonVariants(), "hidden h-10 px-3.5 md:inline-flex")}>
            Read a film
          </Link>
        </div>
      </div>
      </div>
      {present ? (
        <div
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`paper-rules fixed inset-0 z-[60] overflow-y-auto overscroll-none transition-opacity duration-200 motion-reduce:transition-none ${
            visible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onTransitionEnd={() => {
            if (!open) setPresent(false);
          }}
        >
          <nav
            className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 pt-20 pb-8"
            aria-label="Mobile"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeMenu();
            }}
          >
            <p className="kicker">What&apos;s my implant?</p>
            <ul className="mt-6 border-t border-foreground/15">
              {links.map((link) => {
                const current = isCurrent(pathname, link.href);
                return (
                  <li key={link.href} className="border-b border-foreground/15">
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className="flex min-h-16 items-baseline gap-4 py-3"
                      onClick={closeMenu}
                    >
                      <span className={`w-8 shrink-0 font-mono text-xs ${current ? "text-brass" : "text-muted-foreground"}`}>
                        {link.index}
                      </span>
                      <span>
                        <span className={`block font-heading text-4xl leading-none ${current ? "text-brass" : "text-foreground"}`}>
                          {link.label}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">{link.detail}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto pt-10">
              <Link
                href="/identify"
                className={cn(buttonVariants(), "h-12 w-full text-base")}
                onClick={closeMenu}
              >
                Identify an x-ray
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">Films stay in this browser.</p>
            </div>
          </nav>
        </div>
      ) : null}
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
