"use client";

/**
 * Recovery Lab (docs/UI_UX.md §5.6): put the steps in order after a mistake.
 * Tap to add, tap again to remove. Feedback is per step and never red.
 */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Ban, CircleCheck, Plus, RotateCcw, TriangleAlert, X } from "lucide-react";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { api, toApiError } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import { SKILL_NAMES, useT, type I18nKey } from "@/lib/i18n";
import type { ApiErrorInfo, RecoveryResult, RecoveryStepResult, RecoveryView } from "@/lib/types";
import { PracticeBanner } from "@/components/layout/PracticeBanner";

const VERDICTS: Record<RecoveryStepResult["verdict"], { className: string; icon: typeof Ban; label: I18nKey }> = {
  good: { className: "bg-safe-tint", icon: CircleCheck, label: "recovery.good" },
  order: { className: "bg-caution-tint", icon: TriangleAlert, label: "recovery.order" },
  harmful: { className: "bg-caution-tint", icon: Ban, label: "recovery.harmful" },
  missed: { className: "bg-neutral-tint", icon: Plus, label: "recovery.add" },
};

const VERDICT_TEXT: Record<RecoveryStepResult["verdict"], string> = {
  good: "text-safe",
  order: "text-caution",
  harmful: "text-caution",
  missed: "text-neutral",
};

function ResultRow({ step, index }: { step: RecoveryStepResult; index?: number }) {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const verdict = VERDICTS[step.verdict];
  const Icon = verdict.icon;
  return (
    <li className={`rounded-[12px] p-4 ${verdict.className}`}>
      <p className="text-lg text-ink">
        {index ? <span className="tabular-nums">{index}. </span> : null}
        {pick(step.label, lang)}
      </p>
      <p className={`mt-1 flex items-center gap-1.5 text-sm ${VERDICT_TEXT[step.verdict]}`}>
        <Icon aria-hidden className="size-4 shrink-0" />
        {t(verdict.label)}
      </p>
      <p className="mt-1 text-base text-ink">{pick(step.explain, lang)}</p>
    </li>
  );
}

function Lab() {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const { recoveryId } = useParams<{ recoveryId: string }>();
  const [view, setView] = useState<RecoveryView | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [result, setResult] = useState<RecoveryResult | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getRecovery(recoveryId)
      .then(setView)
      .catch((err) => setError(toApiError(err)));
  }, [recoveryId]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      setResult(await api.submitRecovery(recoveryId, chosen));
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setBusy(false);
    }
  };

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

  const labelOf = (id: string) => view.cards.find((card) => card.id === id)?.label ?? null;
  const pool = view.cards.filter((card) => !chosen.includes(card.id));

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-lg text-on-wine-muted">{t("recovery.lab")}</p>
          <h1 className="mt-1 text-2xl text-on-wine sm:text-3xl">{pick(view.title, lang)}</h1>
          {!result ? <p className="mt-2 max-w-2xl text-lg text-on-wine-muted">{pick(view.intro, lang)}</p> : null}
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-5xl">
          {result ? (
            <div aria-live="polite" className="max-w-3xl">
              <h2 className="text-xl text-wine">{t(result.passed ? "recovery.passed" : "recovery.notYet")}</h2>
              <p className="mt-1 text-lg text-ink">
                {result.completeness}% {t("recovery.complete")}
              </p>
              <ol className="mt-5 space-y-3">
                {result.steps.map((step, index) => (
                  <ResultRow key={step.id} step={step} index={index + 1} />
                ))}
              </ol>
              {result.missed.length > 0 ? (
                <>
                  <h2 className="mt-8 text-xl text-wine">{t("recovery.missed")}</h2>
                  <ul className="mt-3 space-y-3">
                    {result.missed.map((step) => (
                      <ResultRow key={step.id} step={step} />
                    ))}
                  </ul>
                </>
              ) : null}
              {result.skill_changes.map((change) => (
                <p key={change.skill} className="mt-6 flex flex-wrap justify-between gap-x-4 text-lg text-ink">
                  <span>{pick(SKILL_NAMES[change.skill], lang)}</span>
                  <span className="tabular-nums text-wine">
                    {Math.round(change.before)}% {t("common.to")} {Math.round(change.after)}%
                  </span>
                </p>
              ))}
              <div className="mt-8 flex flex-wrap gap-3">
                {result.passed ? (
                  <Link href="/simulations/lucky_draw_message?mode=mastery" className="btn-primary">
                    {t("outcome.mastery")}
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setChosen([]);
                  }}
                  className={result.passed ? "btn-secondary" : "btn-primary"}
                >
                  <RotateCcw aria-hidden className="mr-2 size-5" />
                  {t("recovery.again")}
                </button>
                <Link href="/digital-dna" className="btn-secondary">
                  {t("outcome.skills")}
                </Link>
              </div>
            </div>
          ) : (
            <LayoutGroup>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h2 className="text-xl text-wine">{t("recovery.options")}</h2>
                  <ul className="mt-3 space-y-2">
                    <AnimatePresence initial={false}>
                      {pool.map((card) => (
                        <motion.li key={card.id} layout="position" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                          <button
                            type="button"
                            onClick={() => setChosen((prev) => [...prev, card.id])}
                            className="flex min-h-14 w-full items-center gap-3 rounded-[12px] border-2 border-border-strong bg-surface px-4 py-2 text-start text-lg text-ink transition-colors hover:border-wine"
                          >
                            <Plus aria-hidden className="size-5 shrink-0 text-wine" />
                            {pick(card.label, lang)}
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="md:sticky md:top-14 md:self-start">
                  <h2 className="text-xl text-wine">{t("recovery.yours")}</h2>
                  {chosen.length === 0 ? (
                    <p className="mt-3 rounded-[12px] border-2 border-dashed border-border-strong p-4 text-lg text-muted-foreground">
                      {t("recovery.empty")}
                    </p>
                  ) : (
                    <ol className="mt-3 space-y-2">
                      {chosen.map((id, index) => (
                        <motion.li key={id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <button
                            type="button"
                            onClick={() => setChosen((prev) => prev.filter((other) => other !== id))}
                            aria-label={`${t("recovery.remove")}: ${pick(labelOf(id), lang)}`}
                            className="flex min-h-14 w-full items-center gap-3 rounded-[12px] bg-wine-tint px-3 py-2 text-start text-lg text-ink"
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-wine text-base tabular-nums text-on-wine">
                              {index + 1}
                            </span>
                            <span className="min-w-0 flex-1">{pick(labelOf(id), lang)}</span>
                            <X aria-hidden className="size-5 shrink-0 text-wine" />
                          </button>
                        </motion.li>
                      ))}
                    </ol>
                  )}
                  {error ? (
                    <p role="alert" className="mt-3 text-base text-caution">
                      {error.message}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    disabled={chosen.length === 0 || busy}
                    onClick={submit}
                    className="btn-primary mt-4 w-full disabled:opacity-60"
                  >
                    {t("recovery.check")}
                  </button>
                </div>
              </div>
            </LayoutGroup>
          )}
        </div>
      </section>
    </main>
  );
}

export default function RecoveryPage() {
  return (
    <>
      <PracticeBanner />
      <Suspense>
        <Lab />
      </Suspense>
    </>
  );
}
