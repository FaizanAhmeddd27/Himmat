"use client";

/**
 * Learner's home (docs/UI_UX.md §6.2): one next step, a snapshot of Digital DNA,
 * and what is due for review. The next step is the only primary action.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { api, toApiError } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import { useT } from "@/lib/i18n";
import type { ApiErrorInfo, DnaView } from "@/lib/types";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { SkillBars } from "@/components/dna/SkillCharts";
import { recommendationHref, reviewHref } from "@/components/dna/next-step";

export default function DashboardPage() {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const [view, setView] = useState<DnaView | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  useEffect(() => {
    api
      .getDna()
      .then(setView)
      .catch((err) => setError(toApiError(err)));
  }, []);

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
            <h1 className="text-2xl text-on-wine sm:text-3xl">
              {t("dashboard.hello")}{lang === "ur" ? "،" : ","} {t("common.name")}
            </h1>
            <p className="mt-2 text-lg text-on-wine-muted">{t("banner.practice")}</p>
          </div>
          <Image src="/himmat3.png" alt="" width={310} height={640} className="hidden h-40 w-auto self-end sm:block" />
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
            <Link href={recommendationHref(rec)} className="btn-primary shrink-0">
              {t("dna.startNext")}
            </Link>
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h2 className="text-xl text-wine">{t("dashboard.snapshot")}</h2>
                <Link href="/digital-dna" className="inline-flex min-h-12 items-center text-base text-wine underline underline-offset-4">
                  {t("dashboard.seeAll")}
                </Link>
              </div>
              <div className="mt-2">
                <SkillBars skills={view.skills} />
              </div>
            </div>

            <div>
              <h2 className="text-xl text-wine">{t("dashboard.reviews")}</h2>
              <p className="mt-1 text-base text-muted-foreground">{t("dashboard.reviewsBody")}</p>
              {view.reviews.length === 0 ? (
                <p className="mt-4 text-lg text-ink">{t("dashboard.noReviews")}</p>
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {view.reviews.map((review) => (
                    <li key={review.scenario_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-lg text-ink">{pick(review.title, lang)}</p>
                        <p className="flex items-center gap-1.5 text-base text-muted-foreground">
                          <CalendarClock aria-hidden className="size-5 shrink-0" />
                          {review.due
                            ? t("dashboard.dueToday")
                            : `${t("dashboard.dueIn")} ${review.days_left} ${t(review.days_left === 1 ? "dashboard.day" : "dashboard.days")}`}
                        </p>
                      </div>
                      {review.due ? (
                        <Link href={reviewHref(review)} className="btn-secondary">
                          {t("dna.startNext")}
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/simulations" className="btn-secondary mt-6 w-full sm:w-auto">
                {t("dashboard.allPractice")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
