"use client";

/**
 * What-if comparison (FR-4.4): the shared path, then the thread forks. The first
 * try runs straight on; the new try curves away beside it, and the practice
 * money at the end of each path shows what the one different choice was worth.
 */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { api, toApiError } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import { useT, type I18nKey } from "@/lib/i18n";
import type { ApiErrorInfo, CompareView, ReplayOutcome, ReplayStep } from "@/lib/types";
import { PracticeBanner } from "@/components/layout/PracticeBanner";
import { OutcomeBead, StartBead, StepBead, Thread, type ThreadTone } from "@/components/replay/PathThread";

const money = (value: number) => `PKR ${value.toLocaleString("en-PK")}`;

function Column({
  titleKey,
  tone,
  steps,
  firstIndex,
  outcome,
}: {
  titleKey: I18nKey;
  tone: ThreadTone;
  steps: ReplayStep[];
  firstIndex: number;
  outcome: ReplayOutcome | null;
}) {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  return (
    <div className="min-w-0">
      <h2 className={`mb-4 text-xl ${tone === "wine" ? "text-wine" : "text-safe"}`}>{t(titleKey)}</h2>
      <Thread tone={tone}>
        {steps.map((step, index) => (
          <StepBead key={step.step_no} step={step} index={firstIndex + index} lang={lang} tone={tone} />
        ))}
        {outcome ? <OutcomeBead outcome={outcome} lang={lang} tone={tone} /> : null}
      </Thread>
      {outcome?.practice_balance != null ? (
        <p className="mt-5 pl-12">
          <span className="block text-base text-muted-foreground">{t("compare.balance")}</span>
          <span className={`block text-3xl tabular-nums ${tone === "wine" ? "text-wine" : "text-safe"}`}>
            {money(outcome.practice_balance)}
          </span>
        </p>
      ) : null}
    </div>
  );
}

function Compare() {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const { sessionId, branchId } = useParams<{ sessionId: string; branchId: string }>();
  const [view, setView] = useState<CompareView | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  useEffect(() => {
    api
      .compare(sessionId, branchId)
      .then(setView)
      .catch((err) => setError(toApiError(err)));
  }, [sessionId, branchId]);

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

  const shared = view.original.steps.slice(0, view.shared_steps);
  const originalRest = view.original.steps.slice(view.shared_steps);
  const branchRest = view.branch.steps.slice(view.shared_steps);
  const firstIndex = view.shared_steps + 1;
  const recovery = view.original.outcome?.recovery;

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-lg text-on-wine-muted">{pick(view.scenario_title, lang)}</p>
          <h1 className="mt-1 text-2xl text-on-wine sm:text-3xl">{t("compare.title")}</h1>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <Thread>
            <StartBead text={pick(view.start, lang)} />
            {shared.map((step, index) => (
              <StepBead key={step.step_no} step={step} index={index + 1} lang={lang} />
            ))}
          </Thread>

          {/* The fork: runs from the shared thread to the second column. */}
          <div aria-hidden className="relative -mt-4 mb-1 hidden h-24 md:block">
            <span className="absolute inset-y-0 left-[15px] w-0.5 bg-wine" />
            <svg
              className="absolute inset-y-0 left-4 h-full w-[calc(50%+16px)] overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M0 0 C0 90, 100 10, 100 100"
                fill="none"
                stroke="var(--safe)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: "easeInOut", delay: 0.2 }}
              />
            </svg>
          </div>

          <div className="grid gap-10 md:grid-cols-2 md:gap-8">
            <Column
              titleKey="compare.first"
              tone="wine"
              steps={originalRest}
              firstIndex={firstIndex}
              outcome={view.original.outcome}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Column
                titleKey="compare.new"
                tone="fork"
                steps={branchRest}
                firstIndex={firstIndex}
                outcome={view.branch.outcome}
              />
            </motion.div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
            {recovery ? (
              <Link href={`/recovery/${recovery}`} className="btn-primary">
                {t("outcome.recovery")}
              </Link>
            ) : null}
            <Link
              href="/simulations/lucky_draw_message?mode=mastery"
              className={recovery ? "btn-secondary" : "btn-primary"}
            >
              {t("outcome.mastery")}
            </Link>
            <Link href={`/sessions/${sessionId}/replay`} className="btn-secondary">
              {t("compare.back")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ComparePage() {
  return (
    <>
      <PracticeBanner />
      <Suspense>
        <Compare />
      </Suspense>
    </>
  );
}
