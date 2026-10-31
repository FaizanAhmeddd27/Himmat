"use client";

/**
 * Practice list (docs/UI_UX.md §6.2). Playable scenarios come from the engine
 * catalogue; planned ones are listed quietly so the road ahead is honest.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { api } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import { useT } from "@/lib/i18n";
import type { ScenarioMeta } from "@/lib/types";

const MASCOTS: Record<string, string> = {
  fake_bank_message: "/himmat3.png",
  lucky_draw_message: "/himmat7.png",
};

const UPCOMING = [
  { en: "Send Money Safely", "ur-Latn": "Paise mehfooz tareeqe se bhejein", "ur": "محفوظ طریقے سے پیسے بھیجیں" },
  { en: "Video Call Rescue", "ur-Latn": "Video call ki mushkil", "ur": "ویڈیو کال کی مشکل" },
  { en: "Online Shopping Trap", "ur-Latn": "Online shopping ka jaal", "ur": "آن لائن خریداری کا جال" },
  { en: "Government Portal Challenge", "ur-Latn": "Sarkari portal ka form", "ur": "سرکاری پورٹل کا فارم" },
];

export default function SimulationsPage() {
  const lang = useA11y((s) => s.lang);
  const t = useT();
  const [scenarios, setScenarios] = useState<ScenarioMeta[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api
      .listScenarios()
      .then(setScenarios)
      .catch(() => setLoadError(true));
  }, []);

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 py-10 sm:px-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-2xl text-on-wine sm:text-3xl">{t("catalogue.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-on-wine-muted">{t("catalogue.body")}</p>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col">
          {loadError ? (
            <p role="alert" className="text-lg text-caution">
              {t("catalogue.loadError")}
            </p>
          ) : null}
          {scenarios === null && !loadError ? (
            <ThemedLoader />
          ) : null}

          <ul className="divide-y divide-border">
            {scenarios?.map((scenario) => {
              const mastery = scenario.kind === "mastery";
              return (
                <li key={scenario.id} className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:gap-8">
                  <Image
                    src={MASCOTS[scenario.id] ?? "/himmat1.png"}
                    alt=""
                    width={110}
                    height={120}
                    className="h-28 w-auto self-start sm:self-center"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl text-wine">{pick(scenario.title, lang)}</h2>
                    <p className="mt-2 max-w-2xl text-lg text-ink">{pick(scenario.summary, lang)}</p>
                    {mastery ? <p className="mt-1 text-base text-muted-foreground">{t("catalogue.mastery")}</p> : null}
                  </div>
                  <Link
                    href={`/simulations/${scenario.id}${mastery ? "?mode=mastery" : ""}`}
                    className={mastery ? "btn-secondary shrink-0" : "btn-primary shrink-0"}
                  >
                    {t("catalogue.start")}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 border-t-2 border-border pt-6">
            <h2 className="text-lg text-muted-foreground">{t("catalogue.soon")}</h2>
            <ul className="mt-2 grid gap-x-8 gap-y-1 text-lg text-muted-foreground sm:grid-cols-2">
              {UPCOMING.map((item) => (
                <li key={item.en}>{item[lang]}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
