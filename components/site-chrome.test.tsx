// @vitest-environment happy-dom
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children?: ReactNode }) =>
    createElement("a", { href, ...props }, children),
}));

import { SiteHeader } from "@/components/site-chrome";

describe("phone menu focus return", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(createElement(SiteHeader));
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function toggle() {
    const button = container.querySelector("button");
    if (!button) throw new Error("menu toggle missing");
    return button;
  }

  function openMenu() {
    act(() => {
      toggle().click();
    });
  }

  function row() {
    const link = container.querySelector('.menu-panel a[href="/identify"]');
    if (!(link instanceof HTMLAnchorElement)) throw new Error("menu row missing");
    return link;
  }

  function band() {
    const note = container.querySelector(".menu-note");
    const parent = note?.parentElement;
    if (!(parent instanceof HTMLElement)) throw new Error("empty band missing");
    return parent;
  }

  it("returns focus to the toggle after an empty-space click blurs the row", () => {
    openMenu();
    const button = toggle();
    const empty = band();
    act(() => {
      row().focus();
    });
    expect(document.activeElement).toBe(row());

    act(() => {
      empty.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    expect(document.activeElement).toBe(document.body);

    act(() => {
      empty.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    expect(document.activeElement).toBe(button);
  });

  it("returns focus to the toggle on Escape and on Enter", () => {
    openMenu();
    const button = toggle();
    act(() => {
      row().focus();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(document.activeElement).toBe(button);

    openMenu();
    const link = row();
    act(() => {
      link.focus();
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    expect(document.activeElement).toBe(button);
  });
});
