"use client";

/**
 * Family dashboard (docs/UI_UX.md §5.9). The left column is what the learner
 * controls; the right is exactly what the supporter receives. Switching a
 * category off removes it from the right at once (SRS FR-8.2, FR-8.6).
 */

import { useEffect, useState } from "react";
import { Link2, Lock } from "lucide-react";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { api, toApiError } from "@/lib/api";
import { useT, type I18nKey } from "@/lib/i18n";
import type { ApiErrorInfo, ConsentCategory, FamilyView } from "@/lib/types";
import { getLearnerId } from "@/lib/learner";
import { SupporterView } from "@/components/family/SupporterView";

const CATEGORIES: { id: ConsentCategory; title: I18nKey; body: I18nKey }[] = [
  { id: "skills_summary", title: "family.skills", body: "family.skillsBody" },
  { id: "difficulty_areas", title: "family.difficulty", body: "family.difficultyBody" },
  { id: "activity_timeline", title: "family.activity", body: "family.activityBody" },
];

export default function FamilyPage() {
  const t = useT();
  const [view, setView] = useState<FamilyView | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .getFamily()
      .then(setView)
      .catch((err) => setError(toApiError(err)));
  }, []);

  const toggle = async (category: ConsentCategory, granted: boolean) => {
    setError(null);
    try {
      setView(await api.setConsent(category, granted));
    } catch (err) {
      setError(toApiError(err));
    }
  };

  const share = async () => {
    const link = `${window.location.origin}/family/dashboard/${getLearnerId()}`;
    setShareLink(link);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false); // The link stays on screen to copy by hand.
    }
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

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-2xl text-on-wine sm:text-3xl">{t("family.title")}</h1>
          <p className="mt-2 max-w-2xl text-lg text-on-wine-muted">{t("family.body")}</p>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 className="text-xl text-wine">{t("family.canSee")}</h2>
            <p className="mt-1 flex items-center gap-2 text-base text-muted-foreground">
              <Lock aria-hidden className="size-4 shrink-0" />
              {t("family.onlyAmna")}
            </p>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {CATEGORIES.map((category) => {
                const on = view.consents[category.id];
                return (
                  <li key={category.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="text-lg text-ink">{t(category.title)}</p>
                      <p className="text-base text-muted-foreground">{t(category.body)}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={t(category.title)}
                      onClick={() => toggle(category.id, !on)}
                      className={`inline-flex min-h-12 min-w-20 shrink-0 items-center justify-center rounded-[12px] border-2 px-3 text-base transition-colors ${
                        on ? "border-wine bg-wine text-on-wine" : "border-border-strong text-ink hover:bg-wine-tint"
                      }`}
                    >
                      {t(on ? "family.on" : "family.off")}
                    </button>
                  </li>
                );
              })}
            </ul>
            {error ? (
              <p role="alert" className="mt-3 text-base text-caution">
                {error.message}
              </p>
            ) : null}
            <button type="button" onClick={share} className="btn-secondary mt-6 w-full">
              <Link2 aria-hidden className="me-2 size-5 shrink-0" />
              {t("family.share")}
            </button>
            {shareLink ? (
              <div role="status" className="mt-2">
                {copied ? <p className="text-base text-safe">{t("family.copied")}</p> : null}
                <p className="break-all text-base text-muted-foreground">{shareLink}</p>
              </div>
            ) : null}
          </div>

          <SupporterView view={view} />
        </div>
      </section>
    </main>
  );
}
