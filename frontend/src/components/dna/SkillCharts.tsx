"use client";

/**
 * Digital DNA charts (docs/UI_UX.md §5.7). A single series, so wine carries it
 * and no legend is needed. Bars state the exact values; the radar shows the
 * overall shape; the trend shows change over tries.
 */

import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { pick, useA11y } from "@/lib/a11y";
import { useT } from "@/lib/i18n";
import type { DnaHistoryPoint, DnaSkill } from "@/lib/types";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--c-border-strong)",
  borderRadius: 8,
  color: "var(--ink)",
  fontSize: 16,
};

export function SkillRadar({ skills }: { skills: DnaSkill[] }) {
  const lang = useA11y((s) => s.lang);
  const t = useT();
  const data = skills.map((skill) => ({ name: pick(skill.name, lang), mastery: skill.mastery }));

  return (
    <div role="img" aria-label={t("dna.radarLabel")} className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <PolarGrid stroke="var(--c-border)" />
          <PolarAngleAxis dataKey="name" tick={{ fill: "var(--ink)", fontSize: 15 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, t("dna.mastery")]} />
          <Radar
            dataKey="mastery"
            stroke="var(--wine)"
            strokeWidth={2}
            fill="var(--wine)"
            fillOpacity={0.15}
            dot={{ r: 4, fill: "var(--wine)", strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillBars({ skills }: { skills: DnaSkill[] }) {
  const lang = useA11y((s) => s.lang);
  const t = useT();
  return (
    <ul className="space-y-4">
      {skills.map((skill) => (
        <li key={skill.id}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-lg text-ink">{pick(skill.name, lang)}</span>
            <span className="text-lg tabular-nums text-ink">{skill.mastery}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={skill.mastery}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={pick(skill.name, lang)}
            className="mt-1 h-2 rounded-full bg-[var(--c-border)]"
          >
            <div className="h-full rounded-full bg-wine" style={{ width: `${skill.mastery}%` }} />
          </div>
          {!skill.practised ? <p className="mt-1 text-sm text-muted-foreground">{t("dna.estimate")}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function SkillTrend({ history }: { history: DnaHistoryPoint[] }) {
  const t = useT();
  return (
    <div role="img" aria-label={t("dna.trendLabel")} className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="var(--c-border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 14 }} tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, 100]}
            width={36}
            tick={{ fill: "var(--text-muted)", fontSize: 14 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, t("dna.average")]} />
          <Line
            type="monotone"
            dataKey="average"
            stroke="var(--wine)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--wine)", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
