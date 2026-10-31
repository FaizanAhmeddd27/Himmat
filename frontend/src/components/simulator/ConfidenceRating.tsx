"use client";

/**
 * 1-5 self-rating before and after a scenario (SRS FR-6.6). Skill and confidence
 * move separately, so HIMMAT measures both.
 */

import { useState } from "react";
import { api } from "@/lib/api";
import { useA11y } from "@/lib/a11y";
import { useT, type I18nKey } from "@/lib/i18n";

const LABELS = {
  en: ["Not at all", "A little", "Somewhat", "Quite sure", "Very sure"],
  "ur-Latn": ["Bilkul nahi", "Thora sa", "Kuch had tak", "Kafi", "Bohat zyada"],
};

export function ConfidenceRating({
  scenarioId,
  phase,
  questionKey,
  tone = "sand",
}: {
  scenarioId: string;
  phase: "before" | "after";
  questionKey: I18nKey;
  tone?: "sand" | "wine";
}) {
  const t = useT();
  const [rating, setRating] = useState<number | null>(null);
  const labels = LABELS[useA11y((s) => s.lang)];

  const choose = (value: number) => {
    setRating(value);
    // Rating is optional: a failed save never blocks the learner.
    api.rateConfidence(scenarioId, phase, value).catch(() => undefined);
  };

  const wine = tone === "wine";
  return (
    <fieldset>
      <legend className={`text-base ${wine ? "text-on-wine" : "text-ink"}`}>{t(questionKey)}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {labels.map((label, index) => {
          const value = index + 1;
          const selected = rating === value;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={selected}
              onClick={() => choose(value)}
              className={`min-h-12 rounded-[12px] border-2 px-3 text-sm transition-colors ${
                wine
                  ? selected
                    ? "border-sand bg-sand text-wine"
                    : "border-on-wine-muted/70 text-on-wine hover:bg-white/10"
                  : selected
                    ? "border-wine bg-wine text-on-wine"
                    : "border-border-strong text-ink hover:bg-wine-tint"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {rating ? (
        <p role="status" className={`mt-2 text-sm ${wine ? "text-on-wine-muted" : "text-muted-foreground"}`}>
          {t("outcome.thanks")}
        </p>
      ) : null}
    </fieldset>
  );
}
