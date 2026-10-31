"use client";

/**
 * A11yControls (UI_UX.md §7): language, text size and contrast, reachable from
 * every page. Changes mirror onto <html data-text / data-contrast>.
 */

import { Contrast, Languages } from "lucide-react";
import { useA11y, type LangKey, type TextSize } from "@/lib/a11y";
import { useT } from "@/lib/i18n";

const LANGUAGES: { id: LangKey; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ur-Latn", label: "Roman Urdu" },
  { id: "ur", label: "اردو" },
];

const SIZES: { id: TextSize; glyph: string; px: string }[] = [
  { id: "normal", glyph: "A", px: "18px" },
  { id: "large", glyph: "A+", px: "20px" },
  { id: "xlarge", glyph: "A++", px: "24px" },
];

const control =
  "inline-flex min-h-8 sm:min-h-9 items-center justify-center rounded-[8px] px-2 text-xs font-medium transition-colors sm:px-2.5";
const idle = "text-wine hover:bg-wine-tint";
const active = "bg-wine text-on-wine hover:bg-wine-dark shadow-xs";

export function A11yControls() {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const textSize = useA11y((s) => s.textSize);
  const highContrast = useA11y((s) => s.highContrast);
  const setLang = useA11y((s) => s.setLang);
  const setTextSize = useA11y((s) => s.setTextSize);
  const toggleContrast = useA11y((s) => s.toggleContrast);

  return (
    <div className="flex items-center gap-1 sm:gap-1.5" role="group" aria-label={t("a11y.settings")}>
      <div className="flex items-center gap-0.5 rounded-lg bg-sand/30 p-0.5" role="group" aria-label={t("settings.language")}>
        <Languages aria-hidden className="mx-1 size-3.5 text-wine/70 shrink-0 hidden sm:block" />
        {LANGUAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            lang={item.id}
            onClick={() => setLang(item.id)}
            aria-pressed={lang === item.id}
            className={`${control} whitespace-nowrap ${lang === item.id ? active : idle}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-0.5 rounded-lg bg-sand/30 p-0.5" role="group" aria-label={t("a11y.textSize")}>
        {SIZES.map((size) => (
          <button
            key={size.id}
            type="button"
            onClick={() => setTextSize(size.id)}
            dir="ltr"
            aria-pressed={textSize === size.id}
            aria-label={`${t("a11y.textSize")} ${size.px}`}
            className={`${control} min-w-8 ${textSize === size.id ? active : idle}`}
          >
            {size.glyph}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleContrast}
        aria-pressed={highContrast}
        aria-label={t("a11y.contrast")}
        title={t("a11y.contrast")}
        className={`${control} min-w-8 gap-1.5 ${highContrast ? active : idle}`}
      >
        <Contrast aria-hidden className="size-4 shrink-0" />
        <span className="hidden xl:inline">{t("a11y.contrast")}</span>
      </button>
    </div>
  );
}
