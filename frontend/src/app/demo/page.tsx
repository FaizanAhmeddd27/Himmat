"use client";

/**
 * Entry point for judges (SRS FR-1.2). Two starts: a fresh practice phone, or a
 * learner who already practised. That learner's progress comes from the real
 * engine playing scripted choices, so the numbers follow the normal rules.
 */

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, toApiError } from "@/lib/api";
import { useT, type I18nKey } from "@/lib/i18n";
import { startFreshLearner } from "@/lib/learner";
import type { ApiErrorInfo } from "@/lib/types";

const TOUR: I18nKey[] = ["demo.t1", "demo.t2", "demo.t3", "demo.t4", "demo.t5"];

export default function DemoPage() {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  const tryIt = () => {
    startFreshLearner();
    router.push("/simulations/fake_bank_message");
  };

  const seeProgress = async () => {
    setBusy(true);
    setError(null);
    startFreshLearner();
    try {
      await api.seedDemo();
      router.push("/dashboard");
    } catch (err) {
      setError(toApiError(err));
      setBusy(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl items-end justify-between gap-6">
          <div className="py-10">
            <h1 className="text-2xl text-on-wine sm:text-3xl">{t("demo.title")}</h1>
            <p className="mt-2 max-w-2xl text-lg text-on-wine-muted">{t("demo.body")}</p>
          </div>
          <Image src="/himmat1.png" alt="" width={345} height={640} className="hidden h-44 w-auto self-end sm:block" />
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={tryIt} className="btn-primary">
              {t("demo.try")}
            </button>
            <button type="button" disabled={busy} onClick={seeProgress} className="btn-secondary disabled:opacity-60">
              {t("demo.progress")}
            </button>
          </div>
          {error ? (
            <p role="alert" className="mt-3 text-base text-caution">
              {error.message}
            </p>
          ) : null}

          <h2 className="mt-10 text-xl text-wine">{t("demo.tourTitle")}</h2>
          <ol className="mt-3 max-w-2xl list-decimal space-y-2 ps-6 text-lg text-ink">
            {TOUR.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
