"use client";

/**
 * Family dashboard (docs/UI_UX.md §5.9). The left column is what the learner
 * controls; the right is exactly what the supporter receives. Switching a
 * category off removes it from the right at once (SRS FR-8.2, FR-8.6).
 */

import { useEffect, useState } from "react";
import { EyeOff, Lock } from "lucide-react";
import { api, toApiError } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import { useT, type I18nKey } from "@/lib/i18n";
import type { ApiErrorInfo, ConsentCategory, FamilyView } from "@/lib/types";
import { SkillTrend } from "@/components/dna/SkillCharts";

const CATEGORIES: { id: ConsentCategory; title: I18nKey; body: I18nKey }[] = [
  { id: "skills_summary", title: "family.skills", body: "family.skillsBody" },
  { id: "difficulty_areas", title: "family.difficulty", body: "family.difficultyBody" },
  { id: "activity_timeline", title: "family.activity", body: "family.activityBody" },
];

function Hidden({ label }: { label: string }) {
  const t = useT();
  return (
    <p className="flex items-center gap-2 text-base text-muted-foreground">
      <EyeOff aria-hidden className="size-5 shrink-0" />
      {label}: {t("family.hidden")}
    </p>
  );
}

export default function FamilyPage() {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const [view, setView] = useState<FamilyView | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  useEffect(() => {
    api
      .getFamily()
      .then(setView)
      .catch((err) => setError(toApiError(err)));
  }, []);

  const toggle = async (category: ConsentCategory, granted: boolean) => {
    setError(null);
    try {
      setView(await api.setConsent(category, granted));
    } catch (err) {
      setError(toApiError(err));
    }
  };

  if (!view) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <p role={error ? "alert" : undefined} className="max-w-xl text-center text-lg text-muted-foreground">
          {error ? error.message : t("common.loading")}
        </p>
      </main>
    );
  }

  const mastered = view.skills_summary?.filter((skill) => skill.mastery >= 50 && skill.practised) ?? [];

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-2xl text-on-wine sm:text-3xl">{t("family.title")}</h1>
          <p className="mt-2 max-w-2xl text-lg text-on-wine-muted">{t("family.body")}</p>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 className="text-xl text-wine">{t("family.canSee")}</h2>
            <p className="mt-1 flex items-center gap-2 text-base text-muted-foreground">
              <Lock aria-hidden className="size-4 shrink-0" />
              {t("family.onlyAmna")}
            </p>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {CATEGORIES.map((category) => {
                const on = view.consents[category.id];
                return (
                  <li key={category.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="text-lg text-ink">{t(category.title)}</p>
                      <p className="text-base text-muted-foreground">{t(category.body)}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={t(category.title)}
                      onClick={() => toggle(category.id, !on)}
                      className={`inline-flex min-h-12 min-w-20 shrink-0 items-center justify-center rounded-[12px] border-2 px-3 text-base transition-colors ${
                        on ? "border-wine bg-wine text-on-wine" : "border-border-strong text-ink hover:bg-wine-tint"
                      }`}
                    >
                      {t(on ? "family.on" : "family.off")}
                    </button>
                  </li>
                );
              })}
            </ul>
            {error ? (
              <p role="alert" className="mt-3 text-base text-caution">
                {error.message}
              </p>
            ) : null}
          </div>

          <div className="rounded-[16px] border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-xl text-wine">{t("family.bilalSees")}</h2>
            <p className="mt-1 text-lg text-ink">{t("family.neutral")}</p>

            <div className="mt-6 space-y-6">
              {view.skills_summary ? (
                <div>
                  <h3 className="text-lg text-wine">{t("family.mastered")}</h3>
                  {mastered.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {mastered.map((skill) => (
                        <li key={skill.id} className="flex justify-between gap-4 text-lg text-ink">
                          <span>{pick(skill.name, lang)}</span>
                          <span className="tabular-nums">{skill.mastery}%</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-base text-muted-foreground">{t("family.noneYet")}</p>
                  )}
                  {view.history ? <div className="mt-3"><SkillTrend history={view.history} /></div> : null}
                </div>
              ) : (
                <Hidden label={t("family.skills")} />
              )}

              {view.difficulty_areas ? (
                <div>
                  <h3 className="text-lg text-wine">{t("family.help")}</h3>
                  {view.difficulty_areas.length === 0 ? (
                    <p className="mt-1 text-base text-muted-foreground">{t("family.noHelp")}</p>
                  ) : null}
                  <ul className="mt-2 space-y-3">
                    {view.difficulty_areas.map((area) => (
                      <li key={area.skill.id}>
                        <p className="text-lg text-ink">{pick(area.skill.name, lang)}</p>
                        <p className="text-base text-muted-foreground">{pick(area.tip, lang)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Hidden label={t("family.difficulty")} />
              )}

              {view.activity_timeline ? (
                <div>
                  <h3 className="text-lg text-wine">{t("family.activity")}</h3>
                  {view.activity_timeline.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {view.activity_timeline.map((item) => (
                        <li key={item.label} className="text-base text-ink">
                          {pick(item.text, lang)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-base text-muted-foreground">{t("family.noneYet")}</p>
                  )}
                </div>
              ) : (
                <Hidden label={t("family.activity")} />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
