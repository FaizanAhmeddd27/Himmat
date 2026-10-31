"use client";

/**
 * Scenario player route (docs/ARCH.md §19). Query params:
 *   mode=mastery   unaided test, hints off
 *   session=<id>   continue a What-if branch
 *   play=<action>  first tap made on the landing page phone
 */

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PracticeBanner } from "@/components/layout/PracticeBanner";
import { ScenarioPlayer } from "@/components/simulator/ScenarioPlayer";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { api, toApiError } from "@/lib/api";
import type { ApiErrorInfo, ScenarioMeta } from "@/lib/types";

function Player() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const search = useSearchParams();
  const [scenario, setScenario] = useState<ScenarioMeta | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  useEffect(() => {
    api
      .getScenario(scenarioId)
      .then(setScenario)
      .catch((err) => setError(toApiError(err)));
  }, [scenarioId]);

  if (!scenario) {
    return (
      <>
        <PracticeBanner />
        <main className="flex flex-1 items-center justify-center px-6 py-24">
          {error ? (
            <p role="alert" className="max-w-xl text-center text-lg text-caution">
              {error.message}
            </p>
          ) : (
            <ThemedLoader />
          )}
        </main>
      </>
    );
  }

  return (
    <ScenarioPlayer
      key={search.get("session") ?? scenario.id}
      scenario={scenario}
      mode={search.get("mode") === "mastery" ? "mastery" : "practice"}
      branchSessionId={search.get("session") ?? undefined}
      firstAction={search.get("play") ?? undefined}
    />
  );
}

export default function ScenarioPage() {
  return (
    <Suspense>
      <Player />
    </Suspense>
  );
}
