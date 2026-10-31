"use client";

/**
 * Consequence Panel + result screen (docs/UI_UX.md §5.4, §4.2).
 * Split band: wine band carries the outcome tag chip; sand area carries the
 * four questions as stacked meta cards. Calm tone, always a way forward.
 */

import Image from "next/image";
import { GitBranch, Lightbulb, ShieldCheck, TriangleAlert, Volume2, Compass } from "lucide-react";
import { pick, speak, type LangKey } from "@/lib/a11y";
import type { LocalizedContent, Localized } from "@/lib/types";

const TAG_META = {
  safe: {
    chip: "bg-safe-tint text-safe",
    icon: ShieldCheck,
    iconColor: "text-safe",
    label: "Safe",
    mascot: "/himmat4.png",
    mascotAlt: "A family member gives an approving nod",
  },
  close_call: {
    chip: "bg-caution-tint text-caution",
    icon: Lightbulb,
    iconColor: "text-caution",
    label: "Close call",
    mascot: "/himmat4.png",
    mascotAlt: "A family member gives an approving nod",
  },
  affected: {
    chip: "bg-caution text-on-wine",
    icon: TriangleAlert,
    iconColor: "text-caution",
    label: "Practice account affected",
    mascot: "/himmat1.png",
    mascotAlt: "Ustad the mentor listens calmly",
  },
  neutral: {
    chip: "bg-neutral-tint text-neutral",
    icon: Compass,
    iconColor: "text-neutral",
    label: "Practised",
    mascot: "/himmat1.png",
    mascotAlt: "Ustad the mentor listens calmly",
  },
} as const;

const QUESTIONS = [
  { key: "what", title: "What happened?" },
  { key: "why", title: "Why did it happen?" },
  { key: "should_have", title: "What should have happened?" },
  { key: "do_differently", title: "What can you do differently?" },
] as const;

export function ConsequencePanel({
  lang,
  consequence,
  outcomeId,
  outcomeTag,
  recovery,
  onPlayAgain,
}: {
  lang: LangKey;
  consequence: LocalizedContent;
  outcomeId: string;
  outcomeTag: "safe" | "close_call" | "affected" | "neutral";
  recovery: string | null;
  onPlayAgain: () => void;
}) {
  const meta = TAG_META[outcomeTag];
  const TagIcon = meta.icon;

  const readOut = QUESTIONS.map((q) => `${q.title} ${pick(consequence[q.key], lang)}`).join(" ");

  return (
    <section aria-live="polite" className="flex flex-1 flex-col">
      {/* wine band — big outcome screen (§4.2) */}
      <div className="hero-band px-6 py-10 sm:px-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
          <Image
            src={meta.mascot}
            alt={meta.mascotAlt}
            width={120}
            height={120}
            className="rounded-2xl bg-white/15"
          />
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm ${meta.chip}`}
          >
            {outcomeTag === "affected" ? (
              <TriangleAlert aria-hidden className="size-4" />
            ) : (
              <TagIcon aria-hidden className="size-4" />
            )}
            {meta.label}
          </span>
          <h2 className="text-xl text-on-wine sm:text-2xl">{pick(consequence.what, lang)}</h2>
          <button
            type="button"
            onClick={() => speak(readOut)}
            className="inline-flex min-h-12 items-center gap-2 rounded-[12px] border-2 border-on-wine/60 px-4 text-on-wine hover:bg-white/10"
          >
            <Volume2 aria-hidden className="size-5" />
            Listen
          </button>
        </div>
      </div>

      {/* sand area — four questions (§5.4) */}
      <div className="px-6 py-10 sm:px-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {QUESTIONS.map((question, index) => (
            <div key={question.key} className="card-meta">
              <p className="hero-label text-xs text-wine">
                {index + 1}. {question.title}
              </p>
              <p className="mt-2 text-lg text-ink">{pick(consequence[question.key], lang)}</p>
            </div>
          ))}

          {recovery ? (
            <div className="card-meta flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-start gap-2 text-base text-ink">
                <GitBranch aria-hidden className="mt-1 size-5 shrink-0 text-caution" />
                <span>
                  In real life the story does not end here — money can often still be saved. The
                  Recovery Lab (coming next) will walk you through the recovery steps.
                </span>
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-[12px] bg-wine px-8 text-lg text-on-wine transition-colors hover:bg-wine-dark"
            >
              Try again
            </button>
            <p className="text-base text-muted-foreground">
              Same message, different choices — every try teaches something.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
