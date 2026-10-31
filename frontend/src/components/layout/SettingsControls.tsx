"use client";

/** Language, text size and contrast at full size, for onboarding and settings. */

import { useA11y, type LangKey, type TextSize } from "@/lib/a11y";
import { useT, type I18nKey } from "@/lib/i18n";

const LANGUAGES: { id: LangKey; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ur-Latn", label: "Roman Urdu" },
];

const SIZES: { id: TextSize; label: I18nKey }[] = [
  { id: "normal", label: "settings.sizeNormal" },
  { id: "large", label: "settings.sizeLarge" },
  { id: "xlarge", label: "settings.sizeXl" },
];

const choice = (selected: boolean) =>
  `inline-flex min-h-14 items-center justify-center rounded-[12px] border-2 px-5 text-base transition-colors ${
    selected ? "border-wine bg-wine text-on-wine" : "border-border-strong text-ink hover:bg-wine-tint"
  }`;

export function SettingsControls() {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const textSize = useA11y((s) => s.textSize);
  const highContrast = useA11y((s) => s.highContrast);
  const setLang = useA11y((s) => s.setLang);
  const setTextSize = useA11y((s) => s.setTextSize);
  const toggleContrast = useA11y((s) => s.toggleContrast);

  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="text-lg text-wine">{t("settings.language")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={lang === item.id}
              onClick={() => setLang(item.id)}
              className={choice(lang === item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-lg text-wine">{t("a11y.textSize")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIZES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={textSize === item.id}
              onClick={() => setTextSize(item.id)}
              className={choice(textSize === item.id)}
            >
              {t(item.label)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-lg text-wine">{t("a11y.contrast")}</legend>
        <p className="text-base text-muted-foreground">{t("settings.contrastBody")}</p>
        <div className="mt-2">
          <button type="button" aria-pressed={highContrast} onClick={toggleContrast} className={choice(highContrast)}>
            {t(highContrast ? "settings.on" : "settings.off")}
          </button>
        </div>
      </fieldset>
    </div>
  );
}
