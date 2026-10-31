"use client";

/**
 * Onboarding (docs/UI_UX.md §6.1, SRS FR-1.3 to 1.5): choose how the app looks and
 * reads, then a short first check that sets real starting scores. One question per
 * screen, and nothing moves on without a tap.
 */

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { api, toApiError } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import { useT } from "@/lib/i18n";
import type { ApiErrorInfo, AssessmentView } from "@/lib/types";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { SettingsControls } from "@/components/layout/SettingsControls";

function Onboarding() {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const router = useRouter();
  const again = useSearchParams().get("again") !== null;
  const [view, setView] = useState<AssessmentView | null>(null);
  const [step, setStep] = useState<"setup" | number>("setup");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.getDna(), api.getAssessment()])
      .then(([dna, assessment]) => {
        // Already set up: go straight to the learner's home.
        if (dna.onboarded && !again) router.replace("/dashboard");
        else setView(assessment);
      })
      .catch((err) => setError(toApiError(err)));
  }, [again, router]);

  const finish = async (run: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await run();
      router.push("/dashboard");
    } catch (err) {
      setError(toApiError(err));
      setBusy(false);
    }
  };

  const answer = (questionId: string, optionId: string) => {
    if (!view || busy || typeof step !== "number") return;
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    if (step + 1 < view.questions.length) setStep(step + 1);
    else finish(() => api.submitAssessment(next));
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

  const question = typeof step === "number" ? view.questions[step] : null;

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 sm:px-10">
        <div className="mx-auto flex w-full max-w-3xl items-end justify-between gap-6">
          <div className="py-8">
            <h1 className="text-2xl text-on-wine sm:text-3xl">
              {question ? t("onboarding.checkTitle") : t("onboarding.title")}
            </h1>
            <p className="mt-2 max-w-xl text-lg text-on-wine-muted">
              {question ? t("onboarding.checkBody") : t("onboarding.body")}
            </p>
          </div>
          <Image src="/himmat2.png" alt="" width={260} height={480} className="hidden h-36 w-auto self-end sm:block" />
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-3xl">
          {question && typeof step === "number" ? (
            <div>
              <p className="text-base text-muted-foreground">
                {t("onboarding.question")} {step + 1} / {view.questions.length}
              </p>
              <h2 className="mt-1 text-xl text-wine">{pick(question.situation, lang)}</h2>
              <ul className="mt-5 space-y-2">
                {question.options.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => answer(question.id, option.id)}
                      className="flex min-h-14 w-full items-center rounded-[12px] border-2 border-border-strong bg-surface px-4 py-2 text-start text-lg text-ink transition-colors hover:border-wine disabled:opacity-60"
                    >
                      {pick(option.label, lang)}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setStep(step === 0 ? "setup" : step - 1)}
                className="mt-4 inline-flex min-h-12 items-center gap-2 text-base text-wine underline-offset-4 hover:underline"
              >
                <ArrowLeft aria-hidden className="size-5" />
                {t("onboarding.back")}
              </button>
            </div>
          ) : (
            <div>
              <SettingsControls />
              <button type="button" onClick={() => setStep(0)} className="btn-primary mt-8 w-full sm:w-auto">
                {t("onboarding.next")}
              </button>
            </div>
          )}

          {error ? (
            <p role="alert" className="mt-4 flex items-start gap-2 text-base text-caution">
              <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0" />
              {error.message}
            </p>
          ) : null}

          <button
            type="button"
            disabled={busy}
            onClick={() => finish(() => api.skipAssessment())}
            className="mt-6 block min-h-12 text-base text-wine underline underline-offset-4 disabled:opacity-60"
          >
            {t("onboarding.skip")}
          </button>
        </div>
      </section>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <Onboarding />
    </Suspense>
  );
}
