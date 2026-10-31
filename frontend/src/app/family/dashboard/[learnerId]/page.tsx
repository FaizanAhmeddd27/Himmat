"use client";

/** Supporter view from a shared link (SRS FR-8.3): read-only and consent-filtered. */

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, toApiError } from "@/lib/api";
import { useT } from "@/lib/i18n";
import type { ApiErrorInfo, FamilyView } from "@/lib/types";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { SupporterView } from "@/components/family/SupporterView";

function Supporter() {
  const t = useT();
  const { learnerId } = useParams<{ learnerId: string }>();
  const [view, setView] = useState<FamilyView | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  useEffect(() => {
    api
      .getSupporterView(learnerId)
      .then(setView)
      .catch((err) => setError(toApiError(err)));
  }, [learnerId]);

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

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="text-2xl text-on-wine sm:text-3xl">{t("family.supporterTitle")}</h1>
          <p className="mt-2 text-lg text-on-wine-muted">{t("family.supporterBody")}</p>
        </div>
      </section>
      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <SupporterView view={view} />
        </div>
      </section>
    </main>
  );
}

export default function SupporterPage() {
  return (
    <Suspense>
      <Supporter />
    </Suspense>
  );
}
