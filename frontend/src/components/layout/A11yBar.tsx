"use client";

/**
 * A11yBar (UI_UX.md §7): text size, contrast and language controls.
 * Always visible; changes mirror onto <html data-text / data-contrast>.
 *
 * Renders nothing server-side until hydration (preferences come from
 * localStorage), so the server default in layout.tsx stands first.
 */

import { useEffect, useState } from "react";
import { Contrast, Languages } from "lucide-react";
import { useA11y } from "@/lib/a11y";

const SIZE_LABELS: Record<"normal" | "large" | "xlarge", string> = {
  normal: "18px",
  large: "20px",
  xlarge: "24px",
};

export function A11yBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    useA11y.getState().hydrate();
    setMounted(true);
  }, []);

  const lang = useA11y((s) => s.lang);
  const textSize = useA11y((s) => s.textSize);
  const highContrast = useA11y((s) => s.highContrast);
  const { setLang, setTextSize, toggleContrast } = useA11y.getState();

  if (!mounted) return null;

  const nextLang = lang === "en" ? "ur-Latn" : "en";

  return (
    <div className="flex items-center justify-end gap-1 px-4 py-1.5 text-sm">
      <button
        type="button"
        onClick={() => setLang(nextLang)}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-[10px] px-3 text-wine underline-offset-4 hover:bg-wine-tint hover:underline"
      >
        <Languages aria-hidden className="size-5" />
        {lang === "en" ? "اردو (Roman)" : "English"}
      </button>

      <div className="flex items-center gap-1" role="group" aria-label="Text size">
        {(["normal", "large", "xlarge"] as const).map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setTextSize(size)}
            aria-pressed={textSize === size}
            aria-label={`Text size ${SIZE_LABELS[size]}`}
            className={
              "inline-flex min-h-9 min-w-9 items-center justify-center rounded-[10px] px-2 transition-colors " +
              (textSize === size
                ? "bg-wine text-on-wine"
                : "text-wine hover:bg-wine-tint")
            }
          >
            {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleContrast}
        aria-pressed={highContrast}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-[10px] px-3 text-wine hover:bg-wine-tint"
      >
        <Contrast aria-hidden className="size-5" />
        {highContrast ? "Contrast: high" : "High contrast"}
      </button>
    </div>
  );
}
