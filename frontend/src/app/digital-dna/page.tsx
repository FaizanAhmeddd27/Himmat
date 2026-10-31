"use client";

/**
 * Digital DNA (docs/UI_UX.md §5.7): where the learner stands, what to do next,
 * and how sure they feel, since skill and confidence are measured separately.
 */

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { api, toApiError } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import { useT } from "@/lib/i18n";
import type { ApiErrorInfo, DnaView, Recommendation } from "@/lib/types";
import { SkillBars, SkillRadar, SkillTrend } from "@/components/dna/SkillCharts";

function hrefFor(rec: Recommendation): string {
  if (rec.kind === "recovery") return `/recovery/${rec.target}`;
  if (rec.kind === "mastery") return `/simulations/${rec.target}?mode=mastery`;
  return `/simulations/${rec.target}`;
}

function ConfidenceMeter({ label, value }: { label: string; value: number | null }) {
  const t = useT();
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-lg text-ink">{label}</span>
      {value === null ? (
        <span className="text-base text-muted-foreground">{t("dna.notRated")}</span>
      ) : (
        <span className="flex items-center gap-3">
          <span className="flex gap-1" aria-hidden>
            {[1, 2, 3, 4, 5].map((point) => (
              <span
                key={point}
                className={`h-5 w-3 rounded-sm ${point <= value ? "bg-wine" : "bg-[var(--c-border)]"}`}
              />
            ))}
          </span>
          <span className="text-lg tabular-nums text-ink">{value} / 5</span>
        </span>
      )}
    </div>
  );
}

export default function DigitalDnaPage() {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const [view, setView] = useState<DnaView | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  const load = useCallback(() => {
    api
      .getDna()
      .then(setView)
      .catch((err) => setError(toApiError(err)));
  }, []);

  useEffect(load, [load]);

  if (!view) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        {error ? (
          <p role="alert" className="max-w-xl text-center text-lg text-caution">
            {error.message}
          </p>
        ) : (
          <ThemedLoader />
        )}
      </main>
    );
  }

  const rec = view.recommendation;

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl items-end justify-between gap-6">
          <div className="py-8 sm:py-10">
            <h1 className="text-2xl text-on-wine sm:text-3xl">{t("dna.title")}</h1>
            <p className="mt-2 max-w-2xl text-lg text-on-wine-muted">{t("dna.body")}</p>
          </div>
          <Image src="/himmat4.png" alt="" width={110} height={160} className="hidden h-40 w-auto self-end sm:block" />
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col gap-4 rounded-[16px] border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="min-w-0">
              <p className="text-base text-muted-foreground">{t("dna.next")}</p>
              <h2 className="mt-1 text-xl text-wine">{pick(rec.title, lang)}</h2>
              <p className="mt-1 max-w-xl text-lg text-ink">{pick(rec.reason, lang)}</p>
            </div>
            <Link href={hrefFor(rec)} className="btn-primary shrink-0">
              {t("dna.startNext")}
            </Link>
          </div>

          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <SkillRadar skills={view.skills} />
            <SkillBars skills={view.skills} />
          </div>

          <div className="mt-10 grid gap-10 border-t border-border pt-8 md:grid-cols-2">
            <div>
              <h2 className="text-xl text-wine">{t("dna.confidenceTitle")}</h2>
              <p className="mt-1 text-base text-muted-foreground">{t("dna.confidenceBody")}</p>
              <div className="mt-4 space-y-3">
                <ConfidenceMeter label={t("dna.before")} value={view.confidence.before} />
                <ConfidenceMeter label={t("dna.after")} value={view.confidence.after} />
              </div>
            </div>
            <div>
              <h2 className="text-xl text-wine">{t("dna.trendTitle")}</h2>
              <SkillTrend history={view.history} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => api.resetLearner().then(load).catch((err) => setError(toApiError(err)))}
            className="mt-8 inline-flex min-h-12 items-center text-base text-wine underline-offset-4 hover:underline"
          >
            {t("dna.reset")}
          </button>
        </div>
      </section>
    </main>
  );
}
