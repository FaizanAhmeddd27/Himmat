"use client";

/**
 * Mistake Replay + What-if (docs/UI_UX.md §5.5, §6.4), the signature feature.
 * The learner reads their path and can rewind any decision. Choosing a What-if
 * plays a short rewind: later steps fold away, then the phone reopens.
 */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GitFork, TriangleAlert } from "lucide-react";
import { api, toApiError } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import { useT } from "@/lib/i18n";
import type { ApiErrorInfo, ReplayAlternative, ReplayView } from "@/lib/types";
import { PracticeBanner } from "@/components/layout/PracticeBanner";
import { OutcomeBead, StartBead, StepBead, Thread } from "@/components/replay/PathThread";

const REWIND_MS = 650;

function WhatIf({
  alternatives,
  disabled,
  onPick,
}: {
  alternatives: ReplayAlternative[];
  disabled: boolean;
  onPick: (alternative: ReplayAlternative) => void;
}) {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-12 items-center gap-2 rounded-[12px] border-2 border-wine px-4 text-base text-wine transition-colors hover:bg-wine-tint"
      >
        <GitFork aria-hidden className="size-5" />
        {t("replay.whatIf")}
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            {alternatives.map((alternative) => (
              <li key={alternative.action_id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(alternative)}
                  className="flex min-h-12 w-full items-center rounded-[12px] bg-wine-tint px-4 py-2 text-start text-base text-ink transition-colors hover:bg-[#e2c0b1] disabled:opacity-60"
                >
                  {pick(alternative.what_if, lang)}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Replay() {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [view, setView] = useState<ReplayView | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [rewindTo, setRewindTo] = useState<number | null>(null);

  useEffect(() => {
    api
      .getReplay(sessionId)
      .then(setView)
      .catch((err) => setError(toApiError(err)));
  }, [sessionId]);

  const pickWhatIf = async (stepNo: number, alternative: ReplayAlternative) => {
    if (!view) return;
    setRewindTo(stepNo);
    setError(null);
    try {
      const [branch] = await Promise.all([
        api.createBranch(sessionId, stepNo, alternative.action_id),
        new Promise((resolve) => setTimeout(resolve, REWIND_MS)),
      ]);
      router.push(
        branch.status === "completed"
          ? `/sessions/${sessionId}/compare/${branch.session_id}`
          : `/simulations/${view.scenario_id}?session=${branch.session_id}`,
      );
    } catch (err) {
      setRewindTo(null);
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

  const affected = view.outcome?.tag === "affected";
  const hasWhatIf = view.steps.some((step) => step.alternatives.length > 0);

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-lg text-on-wine-muted">{pick(view.scenario_title, lang)}</p>
          <h1 className="mt-1 text-2xl text-on-wine sm:text-3xl">{t("replay.title")}</h1>
          <p className="mt-2 max-w-2xl text-lg text-on-wine-muted">
            {hasWhatIf ? t("replay.body") : t("replay.bodyNoFork")}
          </p>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-3xl">
          {error ? (
            <p role="alert" className="mb-4 flex items-start gap-2 text-base text-caution">
              <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0" />
              {error.message}
            </p>
          ) : null}

          <Thread>
            <StartBead text={pick(view.start, lang)} />
            {view.steps.map((step, index) => {
              const folding = rewindTo !== null && step.step_no > rewindTo;
              return (
                <motion.div
                  key={step.step_no}
                  animate={folding ? { opacity: 0, height: 0 } : { opacity: 1, height: "auto" }}
                  transition={{
                    duration: 0.22,
                    ease: "easeIn",
                    delay: folding ? (view.steps.length - index) * 0.08 : 0,
                  }}
                  className={folding ? "overflow-hidden" : undefined}
                >
                  <StepBead step={step} index={index + 1} lang={lang}>
                    {step.alternatives.length > 0 ? (
                      <WhatIf
                        alternatives={step.alternatives}
                        disabled={rewindTo !== null}
                        onPick={(alternative) => pickWhatIf(step.step_no, alternative)}
                      />
                    ) : null}
                  </StepBead>
                </motion.div>
              );
            })}
            {view.outcome ? (
              <motion.div animate={{ opacity: rewindTo !== null ? 0 : 1 }} transition={{ duration: 0.15 }}>
                <OutcomeBead outcome={view.outcome} lang={lang} />
              </motion.div>
            ) : null}
          </Thread>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
            {view.outcome?.recovery ? (
              <Link href={`/recovery/${view.outcome.recovery}`} className="btn-primary">
                {t("outcome.recovery")}
              </Link>
            ) : null}
            <Link
              href="/simulations/lucky_draw_message?mode=mastery"
              className={affected ? "btn-secondary" : "btn-primary"}
            >
              {t("outcome.mastery")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ReplayPage() {
  return (
    <>
      <PracticeBanner />
      <Suspense>
        <Replay />
      </Suspense>
    </>
  );
}
