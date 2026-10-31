import { ShieldCheck } from "lucide-react";

/**
 * "Practice world" banner (docs/UI_UX.md §5.2) — sticky, ink background,
 * sand text, 44px, never dismissable. Required on every simulator screen.
 */
export function PracticeBanner() {
  return (
    <div
      className="sticky top-0 z-50 flex h-11 w-full items-center justify-center gap-2 bg-ink px-4 text-sm text-sand"
      role="note"
      aria-label="Practice world. Nothing here is real."
    >
      <ShieldCheck aria-hidden className="size-5 shrink-0" />
      <span>Practice world. Nothing here is real.</span>
    </div>
  );
}
