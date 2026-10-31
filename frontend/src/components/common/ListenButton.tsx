"use client";

/**
 * Read aloud (UI_UX §5.4.1), only with a voice that can really pronounce the text.
 * Urdu needs an Urdu voice on the device. Roman Urdu has no voice that reads it
 * well, so it offers no button.
 */

import { Volume2 } from "lucide-react";
import { speak, useA11y, useHasUrduVoice } from "@/lib/a11y";
import { useT } from "@/lib/i18n";

const STYLES = {
  quiet: "inline-flex min-h-12 items-center gap-2 text-sm text-wine underline-offset-4 hover:underline",
  wine: "inline-flex min-h-12 items-center gap-2 rounded-[12px] border-2 border-on-wine-muted/70 px-4 text-on-wine hover:bg-white/10",
} as const;

export function ListenButton({
  text,
  tone = "quiet",
  className = "",
  noteIfNoVoice = false,
}: {
  text: string;
  tone?: keyof typeof STYLES;
  className?: string;
  /** Explain a missing Urdu voice here. Off by default so it never repeats down a page. */
  noteIfNoVoice?: boolean;
}) {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const hasUrduVoice = useHasUrduVoice();

  if (lang === "ur-Latn") return null;
  if (lang === "ur" && !hasUrduVoice) {
    if (!noteIfNoVoice) return null;
    return (
      <p className={`text-sm ${tone === "wine" ? "text-on-wine-muted" : "text-muted-foreground"} ${className}`}>
        {t("common.noVoice")}
      </p>
    );
  }
  return (
    <button type="button" onClick={() => speak(text, lang)} className={`${STYLES[tone]} ${className}`}>
      <Volume2 aria-hidden className="size-5" />
      {t("common.listen")}
    </button>
  );
}
