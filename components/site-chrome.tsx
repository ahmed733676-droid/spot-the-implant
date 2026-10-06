"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { buttonVariants } from "@/components/ui/button";
import { buildOutline, outlinePath } from "@/lib/silhouette";
import type { SchematicProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

const links = [
  { href: "/identify", index: "01", label: "Identify", detail: "Drop a PA, get two names" },
  { href: "/library", index: "02", label: "Library", detail: "Schematics and the sources behind them" },
  { href: "/how-it-works", index: "03", label: "How it works", detail: "Cues, then a company, then a line" },
  { href: "/about", index: "04", label: "Limits", detail: "Decision support. Not a device." },
] as const;

// = SYSTEMS["straumann-tl"].schematic (lib/systems.ts)
const MENU_FIXTURE: SchematicProfile = {
  collar: "tulip",
  body: "parallel",
  thread: "standard",
  apex: "round",
  connection: "octagon",
  platformSwitch: false,
};
const MENU_FIXTURE_D = outlinePath(buildOutline(MENU_FIXTURE).points);

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const [menuPath, setMenuPath] = useState(pathname);
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // pointerdown blurs a focused row before the click that closes the menu.
  const focusWasInsideRef = useRef(false);
  const open = state === "open";
  const present = state !== "closed";

  const closeMenu = useCallback(() => {
    setState((current) => (current === "open" ? "closing" : current));
    const active = document.activeElement;
    const inside = Boolean(panelRef.current?.contains(active));
    const onBody = !active || active === document.body || active === document.documentElement;
    if (inside || onBody || focusWasInsideRef.current) toggleRef.current?.focus();
    focusWasInsideRef.current = false;
  }, []);

  const openMenu = useCallback(() => {
    setState("open");
  }, []);

  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setState((current) => (current === "open" ? "closing" : current));
  }

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (media.matches) closeMenu();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [closeMenu]);

  useEffect(() => {
    if (!present) return;
    const scrollY = window.scrollY;
    const previousBody = document.body.style.cssText;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const content = document.getElementById("content");
    const footer = document.getElementById("site-footer");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    if (content) content.inert = true;
    if (footer) footer.inert = true;
    return () => {
      document.body.style.cssText = previousBody;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (content) content.inert = false;
      if (footer) footer.inert = false;
      window.scrollTo(0, scrollY);
    };
  }, [present]);

  useEffect(() => {
    if (!open) return;
    const header = headerRef.current;

    function focusable() {
      if (!header) return [];
      return [...header.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
        (node) => node.tabIndex !== -1 && node.getClientRects().length > 0,
      );
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
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
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  useEffect(() => {
    if (state !== "closing") return;
    const handle = window.setTimeout(() => setState("closed"), 400);
    return () => window.clearTimeout(handle);
  }, [state]);

  useEffect(() => {
    if (!present) return;
    const onPointerDown = () => {
      focusWasInsideRef.current = Boolean(panelRef.current?.contains(document.activeElement));
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [present]);

  return (
    <header ref={headerRef} className="sticky top-0 z-[70]">
      <div className={`relative z-[80] border-b border-foreground/15 ${present ? "bg-background" : "bg-background/95"}`}>
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
                  className={cn(
                    "transition-colors duration-150",
                    current
                      ? "text-brass underline decoration-brass underline-offset-4"
                      : "text-foreground/80 hover:text-brass",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button
              ref={toggleRef}
              type="button"
              className="relative grid size-11 place-items-center border border-foreground/20 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brass md:hidden"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => (open ? closeMenu() : openMenu())}
            >
              <span
                className={`absolute h-px w-4 bg-foreground transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "rotate-45" : "-translate-y-1.5"}`}
              />
              <span
                className={`absolute h-px w-4 bg-foreground transition-opacity duration-200 ease-out motion-reduce:transition-none ${open ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`absolute h-px w-4 bg-foreground transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "-rotate-45" : "translate-y-1.5"}`}
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
          ref={panelRef}
          id={menuId}
          data-state={state}
          className="menu-panel paper-rules fixed inset-0 z-[60] overflow-y-auto overscroll-none"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && state === "closing") setState("closed");
          }}
        >
          <nav
            className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 pt-20 pb-15"
            aria-label="Mobile"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeMenu();
            }}
          >
            <p className="kicker">What&apos;s my implant?</p>
            <ul className="menu-list mt-6">
              {links.map((link, index) => {
                const current = isCurrent(pathname, link.href);
                return (
                  <li key={link.href} className="menu-row" style={{ "--i": index } as CSSProperties}>
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className="flex min-h-16 items-baseline gap-4 py-3 transition-opacity duration-150 active:opacity-60"
                      onClick={closeMenu}
                    >
                      <span
                        className={cn(
                          "flex w-8 shrink-0 items-center gap-1.5 font-mono text-xs",
                          current ? "text-brass" : "text-muted-foreground",
                        )}
                      >
                        {link.index}
                        {current ? <span aria-hidden="true" className="size-1.5 rounded-full bg-brass" /> : null}
                      </span>
                      <span>
                        <span className="block font-heading text-4xl leading-none text-foreground">{link.label}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">{link.detail}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8" onClick={closeMenu}>
              <svg
                className="menu-fixture h-36 w-auto text-foreground/45 [@media(max-height:700px)]:hidden"
                viewBox="40 28 80 284"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d={MENU_FIXTURE_D}
                  pathLength={1}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              </svg>
              <p className="menu-note font-mono text-[11px] text-muted-foreground">Films stay in this browser.</p>
            </div>
            <div className="menu-cta pt-6">
              <Link href="/identify" className={cn(buttonVariants(), "h-12 w-full text-base")} onClick={closeMenu}>
                Identify an x-ray
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer id="site-footer" className="border-t border-foreground/15">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-heading text-2xl leading-none">Decision support. Not a device.</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Films stay in this browser. Do not order an abutment, a driver, or a rescue screw from this list.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-foreground/80">
          <Link href="/about" className="transition-colors duration-150 hover:text-brass">
            Limits
          </Link>
          <Link href="/how-it-works" className="transition-colors duration-150 hover:text-brass">
            Pipeline
          </Link>
          <Link href="/library" className="transition-colors duration-150 hover:text-brass">
            Library
          </Link>
        </div>
      </div>
    </footer>
  );
}
