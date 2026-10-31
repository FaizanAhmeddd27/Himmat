"use client";

import { ShieldCheck } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * "Practice world" banner (docs/UI_UX.md §5.2): sticky, ink background,
 * sand text, 44px, never dismissable. Required on every simulator screen.
 */
export function PracticeBanner() {
  const t = useT();
  return (
    <div
      className="sticky top-0 z-40 flex min-h-11 w-full items-center justify-center gap-2 bg-ink px-4 py-1 text-sm text-sand"
      role="note"
    >
      <ShieldCheck aria-hidden className="size-5 shrink-0" />
      <span>{t("banner.practice")}</span>
    </div>
  );
}
