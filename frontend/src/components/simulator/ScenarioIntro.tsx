"use client";

/**
 * Scenario intro (docs/UI_UX.md §4.2 split band): wine band with the title and
 * situation, sand area with the one thing to do next.
 */

import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { pick, type LangKey } from "@/lib/a11y";
import { SKILL_NAMES, useT } from "@/lib/i18n";
import type { ScenarioMeta, SessionMode } from "@/lib/types";
import { ConfidenceRating } from "@/components/simulator/ConfidenceRating";

export function ScenarioIntro({
  scenario,
  lang,
  mode,
  onStart,
  starting,
}: {
  scenario: ScenarioMeta;
  lang: LangKey;
  mode: SessionMode;
  onStart: () => void;
  starting?: boolean;
}) {
  const t = useT();

  return (
    <section className="flex flex-1 flex-col">
      <div className="hero-band px-6 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl items-end justify-between gap-6">
          <div className="py-10 sm:py-14">
            <h1 className="text-2xl text-on-wine sm:text-3xl">{pick(scenario.title, lang)}</h1>
            <p className="mt-4 max-w-2xl text-lg text-on-wine-muted sm:text-xl">{pick(scenario.summary, lang)}</p>
          </div>
          <Image
            src="/himmat3.png"
            alt=""
            width={190}
            height={208}
            priority
            className="hidden h-52 w-auto self-end sm:block"
          />
        </div>
      </div>

      <div className="px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <p className="max-w-2xl text-lg text-ink">
            {mode === "mastery" ? t("player.bodyMastery") : t("intro.you")}
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock aria-hidden className="size-5" />
              {t("intro.time")}
            </li>
            {scenario.skills.map((skill) => (
              <li key={skill}>{pick(SKILL_NAMES[skill], lang) || skill}</li>
            ))}
          </ul>
          <ConfidenceRating scenarioId={scenario.id} phase="before" questionKey="intro.confidence" />
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStart}
              disabled={starting}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-[12px] bg-wine px-8 text-lg text-on-wine transition-colors hover:bg-wine-dark disabled:opacity-60"
            >
              {starting ? t("intro.starting") : t("intro.start")}
            </button>
            <Link href="/simulations" className="inline-flex min-h-12 items-center text-wine underline-offset-4 hover:underline">
              {t("intro.back")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
