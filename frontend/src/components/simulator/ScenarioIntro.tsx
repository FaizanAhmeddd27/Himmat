"use client";

/**
 * Scenario intro (docs/UI_UX.md §4.2 split band, §6.2):
 * wine band with title + summary; sand area with mascots, skills
 * and the single primary action.
 */

import Image from "next/image";
import { Clock, Users } from "lucide-react";
import { pick, type LangKey } from "@/lib/a11y";
import type { ScenarioMeta } from "@/lib/types";

const SKILL_LABELS: Record<string, string> = {
  stop_before_clicking: "Pause before tapping",
  verify_sender: "Check the sender",
  never_share_otp: "Never share an OTP",
  report_fraud: "Report and block",
};

export function ScenarioIntro({
  scenario,
  lang,
  onStart,
  starting,
}: {
  scenario: ScenarioMeta;
  lang: LangKey;
  onStart: () => void;
  starting?: boolean;
}) {
  const skills = scenario.skills.filter(Boolean);

  return (
    <section className="flex flex-1 flex-col">
      {/* wine band */}
      <div className="hero-band px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto w-full max-w-5xl">
          <p className="hero-label text-sm text-on-wine-muted">Simulation</p>
          <h1 className="mt-3 text-2xl text-on-wine sm:text-3xl">{pick(scenario.title, lang)}</h1>
          <p className="mt-4 max-w-2xl text-lg text-on-wine-muted sm:text-xl">
            {pick(scenario.summary, lang)}
          </p>
        </div>
      </div>

      {/* sand area */}
      <div className="px-6 py-10 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <div className="flex flex-wrap items-end gap-6">
            <Image
              src="/himmat3.png"
              alt="Amma practises on her phone"
              width={150}
              height={150}
              className="mix-blend-multiply"
            />
            <div className="min-w-64 flex-1">
              <p className="text-lg text-ink">
                You play as Amma, practising in a safe world. Ustad is beside you whenever you want
                a hint — nothing here can touch your real money or accounts.
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock aria-hidden className="size-4" />
                About 5 minutes,
                <Users aria-hidden className="ml-2 size-4" />
                one learner, one coach
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-wine"
              >
                {SKILL_LABELS[skill] ?? skill}
              </span>
            ))}
            <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted-foreground">
              Level: {scenario.difficulty === 1 ? "Easy" : `Level ${scenario.difficulty}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStart}
              disabled={starting}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-[12px] bg-wine px-8 text-lg text-on-wine transition-colors hover:bg-wine-dark disabled:opacity-60"
            >
              {starting ? "Opening the practice phone…" : "Start practising"}
            </button>
            <a href="/simulations" className="text-wine underline-offset-4 hover:underline">
              Back to simulations
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
