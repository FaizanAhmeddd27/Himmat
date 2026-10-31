import type { ReactNode } from "react";
import { BatteryMedium, SignalHigh, Wifi } from "lucide-react";

/**
 * Phone frame (UI_UX.md §5.3): ink bezel, white inner screen, "PRACTICE" tag on
 * the bezel in sand text. `reveal` outlines every tappable spot equally, so it
 * helps people find controls without hinting which choice is risky.
 */
export function PhoneFrame({ children, reveal = false }: { children: ReactNode; reveal?: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[360px]" data-reveal={reveal ? "true" : undefined}>
      <div className="rounded-[34px] bg-ink px-2.5 pb-3 pt-1 shadow-[0_18px_40px_-18px_rgba(42,10,16,0.55)]">
        <p aria-hidden className="py-1 text-center text-[10px] tracking-[0.3em] text-on-wine-muted">
          PRACTICE
        </p>
        <div className="h-[640px] overflow-hidden rounded-[24px] bg-white">{children}</div>
      </div>
    </div>
  );
}

/** Shared fake-app status bar shown on top of every screen inside the phone. */
export function FakeStatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-4 pb-1 pt-2 text-xs ${dark ? "text-white/90" : "text-ink/80"}`}
      aria-hidden
    >
      <span>1:04 PM</span>
      <span className="flex items-center gap-1">
        <SignalHigh className="size-4" />
        <Wifi className="size-4" />
        <BatteryMedium className="size-4" />
      </span>
    </div>
  );
}
