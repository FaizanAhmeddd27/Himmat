"use client";

/**
 * Simulations catalogue (docs/UI_UX.md §6.2). Real scenario cards come from
 * the engine catalogue API; other cards are labelled Coming soon.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import { api } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import type { ScenarioMeta } from "@/lib/types";

/** Static mascot + tagline casting per scenario id (Phase 2 ships #1). */
const CASTING: Record<string, { mascot: string; blurb: Record<string, string> }> = {
  fake_bank_message: {
    mascot: "/himmat2.png",
    blurb: {
      en: "A message that looks like your bank asks for a code. Pause, check, decide.",
      "ur-Latn":
        "Aik message jo bank jaisa lagta hai code mangta hai. Rukein, check karein, faisla karein.",
    },
  },
};

const UPCOMING = [
  { mascot: "/himmat5.png", title: "Send Money Safely" },
  { mascot: "/himmat6.png", title: "Wrong Number Transfer" },
  { mascot: "/himmat7.png", title: "The Prize Call" },
];

export default function SimulationsPage() {
  const hydrate = useA11y((s) => s.hydrate);
  const lang = useA11y((s) => s.lang);
  const [scenarios, setScenarios] = useState<ScenarioMeta[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
    api
      .listScenarios()
      .then(setScenarios)
      .catch(() =>
        setLoadError(
          "The practice world engine is not reachable right now. Start the backend, then refresh.",
        ),
      );
  }, [hydrate]);

  return (
    <div className="flex flex-1 flex-col">
      {/* wine band */}
      <section className="hero-band px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto w-full max-w-5xl">
          <p className="hero-label text-sm text-on-wine-muted">Simulations</p>
          <h1 className="mt-3 text-2xl text-on-wine sm:text-3xl">
            Practise everyday digital situations
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-on-wine-muted">
            Short stories inside a practice phone. You choose at each step, see what happens, and
            learn the recovery too. Nothing is real; nothing can break.
          </p>
        </div>
      </section>

      {/* sand area */}
      <section className="px-6 py-12 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          {loadError ? (
            <p role="status" className="card-meta text-lg text-ink">
              {loadError}
            </p>
          ) : null}

          {scenarios === null && !loadError ? (
            <p className="text-lg text-muted-foreground">Loading the practice world…</p>
          ) : null}

          {scenarios?.map((scenario) => {
            const casting = CASTING[scenario.id];
            return (
              <a
                key={scenario.id}
                href={`/simulations/${scenario.id}`}
                className="card-meta group flex flex-wrap items-center gap-6 transition-colors hover:border-wine"
              >
                {casting ? (
                  <Image
                    src={casting.mascot}
                    alt=""
                    aria-hidden
                    width={120}
                    height={120}
                    className="mix-blend-multiply"
                  />
                ) : null}
                <div className="min-w-64 flex-1">
                  <p className="text-lg text-wine">{pick(scenario.title, lang)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {casting ? casting.blurb[lang] ?? casting.blurb.en : ""}
                    {" | "}
                    Level: {scenario.difficulty === 1 ? "Easy" : `Level ${scenario.difficulty}`}
                  </p>
                  <p className="mt-3 text-xl text-ink">{pick(scenario.summary, lang)}</p>
                  <p className="mt-4 inline-flex h-14 min-w-48 items-center justify-center rounded-[12px] bg-wine px-8 text-lg text-on-wine group-hover:bg-wine-dark">
                    Start practising
                  </p>
                </div>
              </a>
            );
          })}

          <div>
            <p className="hero-label text-sm text-muted-foreground">Coming soon</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              {UPCOMING.map((item) => (
                <div key={item.title} className="card-meta opacity-80">
                  <Image
                    src={item.mascot}
                    alt=""
                    aria-hidden
                    width={96}
                    height={96}
                    className="mix-blend-multiply"
                  />
                  <p className="mt-2 flex items-center gap-2 text-base text-ink">
                    <Lock aria-hidden className="size-4 text-text-subtle" />
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Unlocks in a future phase.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
