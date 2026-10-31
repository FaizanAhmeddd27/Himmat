"use client";

/**
 * What a family supporter receives (docs/UI_UX.md §5.9). Only what the server sent
 * can appear: categories the learner keeps private arrive empty.
 */

import { EyeOff } from "lucide-react";
import { pick, useA11y } from "@/lib/a11y";
import { useT } from "@/lib/i18n";
import type { FamilyView } from "@/lib/types";
import { SkillTrend } from "@/components/dna/SkillCharts";

function Hidden({ label }: { label: string }) {
  const t = useT();
  return (
    <p className="flex items-center gap-2 text-base text-muted-foreground">
      <EyeOff aria-hidden className="size-5 shrink-0" />
      {label}: {t("family.hidden")}
    </p>
  );
}

export function SupporterView({ view }: { view: FamilyView }) {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const mastered = view.skills_summary?.filter((skill) => skill.mastery >= 50 && skill.practised) ?? [];

  return (
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
            {view.history ? (
              <div className="mt-3">
                <SkillTrend history={view.history} />
              </div>
            ) : null}
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
  );
}
