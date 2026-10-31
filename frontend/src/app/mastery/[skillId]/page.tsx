"use client";

/**
 * Mastery test by skill (docs/UI_UX.md §6.5): sends each skill to the unaided
 * scenario that tests it. Skills with no test yet say so.
 */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { api, toApiError } from "@/lib/api";
import type { ApiErrorInfo, ScenarioMeta } from "@/lib/types";

function Mastery() {
  const t = useT();
  const router = useRouter();
  const { skillId } = useParams<{ skillId: string }>();
  const [scenario, setScenario] = useState<ScenarioMeta | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  useEffect(() => {
    api
      .listScenarios()
      .then((scenarios) => {
        const match = scenarios.find((item) => item.kind === "mastery" && item.skills.includes(skillId));
        if (match) setScenario(match);
      })
      .catch((err) => setError(toApiError(err)));
  }, [skillId]);

  useEffect(() => {
    if (scenario) router.replace(`/simulations/${scenario.id}?mode=mastery`);
  }, [router, scenario]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      {error ? (
        <p role="alert" className="max-w-xl text-lg text-caution">{error.message}</p>
      ) : scenario ? (
        <ThemedLoader />
      ) : (
        <>
          <p className="max-w-xl text-lg text-ink">{t("mastery.noTest")}</p>
          <Link href="/simulations" className="btn-primary">
            {t("player.exit")}
          </Link>
        </>
      )}
    </main>
  );
}

export default function MasteryPage() {
  return (
    <Suspense>
      <Mastery />
    </Suspense>
  );
}
