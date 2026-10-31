import type { ReactNode } from "react";

/**
 * Phone frame (UI_UX.md §5.3): 12px ink bezel, white inner screen,
 * "PRACTICE" tag on the bezel in sand text. Content scrolls internally.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      {/* bezel */}
      <div className="relative rounded-[30px] bg-ink p-3 shadow-lg">
        <span
          aria-hidden
          className="absolute left-1/2 top-1 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-on-wine-muted"
        >
          Practice
        </span>
        {/* screen */}
        <div className="h-[600px] overflow-hidden rounded-[20px] bg-white sm:h-[660px]">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Shared fake-app status bar shown on top of every screen inside the phone. */
export function FakeStatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={
        "flex items-center justify-between px-4 pb-1 pt-2 text-xs " +
        (dark ? "text-white/90" : "text-ink/80")
      }
      aria-hidden
    >
      <span>1:04 PM</span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden>▲</span>
        <span aria-hidden>▮</span>
        <span>82%</span>
      </span>
    </div>
  );
}
