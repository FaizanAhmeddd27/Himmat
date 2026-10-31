"use client";

/**
 * Scenario 1 — The Fake Bank Message (docs/UI_UX.md §6.3).
 * Practice banner stays sticky; the player fills the rest.
 */

import { useEffect, useState } from "react";
import { PracticeBanner } from "@/components/layout/PracticeBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { A11yBar } from "@/components/layout/A11yBar";
import { ScenarioPlayer } from "@/components/simulator/ScenarioPlayer";
import { api } from "@/lib/api";
import { useA11y } from "@/lib/a11y";
import type { ScenarioMeta } from "@/lib/types";

const SCENARIO_ID = "fake_bank_message";

const FALLBACK: ScenarioMeta = {
  id: SCENARIO_ID,
  title: { en: "The Fake Bank Message" },
  summary: {
    en: "A message that looks like your bank says your account will be blocked today unless you confirm a code.",
  },
  skills: ["stop_before_clicking", "verify_sender", "never_share_otp", "report_fraud"],
  difficulty: 1,
  is_active: true,
};

export default function FakeBankMessagePage() {
  const hydrate = useA11y((s) => s.hydrate);
  const [scenario, setScenario] = useState<ScenarioMeta | null>(null);

  useEffect(() => {
    hydrate();
    api
      .getScenario(SCENARIO_ID)
      .then(setScenario)
      .catch(() => setScenario(FALLBACK)); // engine down: intro still readable
  }, [hydrate]);

  if (!scenario) {
    return (
      <>
        <A11yBar />
        <PracticeBanner />
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-6 py-24">
          <p className="text-lg text-muted-foreground">Loading the practice phone…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <A11yBar />
      <PracticeBanner />
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <ScenarioPlayer scenario={scenario} />
      </main>
      <footer className="px-6 py-6 text-center text-sm text-muted-foreground">
        HIMMAT — Learn it. Break it. Recover from it. Master it.
      </footer>
    </>
  );
}
