"use client";

/**
 * Result screen (docs/UI_UX.md §5.4, §4.2). The wine band states the outcome;
 * the four questions read as one continuous sheet. Calm tone, always a way
 * forward, and exactly one primary action.
 */

import Link from "next/link";
import { CircleHelp, Compass, Lightbulb, ShieldCheck, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";
import { ListenButton } from "@/components/common/ListenButton";
import { pick, type LangKey } from "@/lib/a11y";
import { SKILL_NAMES, useT, type I18nKey } from "@/lib/i18n";
import type { OutcomeTagName, SessionView } from "@/lib/types";
import { ConfidenceRating } from "@/components/simulator/ConfidenceRating";

export const TAG_META: Record<OutcomeTagName, { chip: string; icon: typeof ShieldCheck; label: I18nKey }> = {
  safe: { chip: "bg-safe-tint text-safe", icon: ShieldCheck, label: "outcome.safe" },
  close_call: { chip: "bg-caution-tint text-caution", icon: Lightbulb, label: "outcome.close_call" },
  affected: { chip: "bg-caution text-on-wine", icon: TriangleAlert, label: "outcome.affected" },
  neutral: { chip: "bg-neutral-tint text-neutral", icon: Compass, label: "outcome.neutral" },
};

const QUESTIONS = [
  { key: "what", title: "outcome.q.what" },
  { key: "why", title: "outcome.q.why" },
  { key: "should_have", title: "outcome.q.should" },
  { key: "do_differently", title: "outcome.q.different" },
] as const;

const secondary =
  "inline-flex min-h-14 items-center justify-center rounded-[12px] border-2 border-wine px-6 text-center text-base text-wine transition-colors hover:bg-wine-tint";
const primary =
  "inline-flex min-h-14 items-center justify-center rounded-[12px] bg-wine px-8 text-center text-lg text-on-wine transition-colors hover:bg-wine-dark";

export function ConsequencePanel({
  lang,
  session,
  onPlayAgain,
}: {
  lang: LangKey;
  session: SessionView;
  onPlayAgain: () => void;
}) {
  const t = useT();
  const consequence = session.consequence;
  const tag = session.outcome_tag;
  if (!consequence || !tag) return null;

  const meta = TAG_META[tag];
  const TagIcon = meta.icon;
  const mastery = session.mode === "mastery";
  const isBranch = Boolean(session.parent_session_id);
  const replayHref = `/sessions/${session.session_id}/replay`;

  const readOut = QUESTIONS.map((q) => `${t(q.title)} ${pick(consequence[q.key], lang)}`).join(" ");

  return (
    <section aria-live="polite" className="flex flex-1 flex-col">
      <div className="hero-band px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm ${meta.chip}`}
          >
            <TagIcon aria-hidden className="size-5" />
            {t(meta.label)}
          </motion.span>
          <h1 className="mt-4 text-2xl text-on-wine sm:text-3xl">{pick(session.headline, lang)}</h1>
          {mastery && tag !== "safe" ? (
            <p className="mt-2 text-lg text-on-wine-muted">{t("outcome.notYet")}</p>
          ) : null}
          <ListenButton text={readOut} tone="wine" className="mt-5" noteIfNoVoice />
        </div>
      </div>

      <div className="px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <dl className="divide-y divide-border rounded-[16px] border border-border bg-surface">
            {QUESTIONS.map((question) => (
              <div key={question.key} className="p-5 sm:px-8 sm:py-6">
                <dt className="flex items-center gap-2 text-base text-wine">
                  <CircleHelp aria-hidden className="size-5" />
                  {t(question.title)}
                </dt>
                <dd className="mt-1 text-lg text-ink">{pick(consequence[question.key], lang)}</dd>
              </div>
            ))}
          </dl>

          {session.skill_changes.length > 0 ? (
            <div className="mt-6">
              <p className="text-base text-muted-foreground">{t("outcome.moved")}</p>
              <ul className="mt-1 space-y-1">
                {session.skill_changes.map((change) => (
                  <li key={change.skill} className="flex flex-wrap justify-between gap-x-4 text-lg text-ink">
                    <span>{pick(SKILL_NAMES[change.skill], lang) || change.skill}</span>
                    <span className="tabular-nums text-wine">
                      <span dir="ltr">{Math.round(change.before)}%</span> {t("common.to")}{" "}
                      <span dir="ltr">{Math.round(change.after)}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {mastery && !isBranch ? (
            <div className="mt-6">
              <ConfidenceRating scenarioId={session.scenario_id} phase="after" questionKey="outcome.afterConfidence" />
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {isBranch ? (
              <Link
                href={`/sessions/${session.parent_session_id}/compare/${session.session_id}`}
                className={primary}
              >
                {t("outcome.compare")}
              </Link>
            ) : mastery ? (
              <Link href="/digital-dna" className={primary}>
                {t("outcome.skills")}
              </Link>
            ) : (
              <Link href={replayHref} className={primary}>
                {t("outcome.replay")}
              </Link>
            )}
            {session.recovery ? (
              <Link href={`/recovery/${session.recovery}`} className={secondary}>
                {t("outcome.recovery")}
              </Link>
            ) : null}
            {!mastery && !isBranch && tag === "safe" ? (
              <Link href="/simulations/lucky_draw_message?mode=mastery" className={secondary}>
                {t("outcome.mastery")}
              </Link>
            ) : null}
            {!isBranch ? (
              <button type="button" onClick={onPlayAgain} className={secondary}>
                {t("outcome.again")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
