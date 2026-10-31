"use client";

/**
 * The path: HIMMAT's replay motif (docs/UI_UX.md §5.5). Steps sit as numbered
 * beads on one thread; a What-if is a second thread that forks away from it.
 */

import type { ReactNode } from "react";
import { CircleDot, ShieldCheck, TriangleAlert } from "lucide-react";
import { pick, type LangKey } from "@/lib/a11y";
import { useT, type I18nKey } from "@/lib/i18n";
import type { OutcomeTagName, ReplayOutcome, ReplayStep, StepTag } from "@/lib/types";
import { TAG_META } from "@/components/simulator/ConsequencePanel";

const STEP_TAGS: Record<StepTag, { className: string; icon: typeof ShieldCheck; label: I18nKey }> = {
  safe: { className: "bg-safe-tint text-safe", icon: ShieldCheck, label: "tag.safe" },
  risky: { className: "bg-caution-tint text-caution", icon: TriangleAlert, label: "tag.risky" },
  neutral: { className: "bg-neutral-tint text-neutral", icon: CircleDot, label: "tag.neutral" },
};

export type ThreadTone = "wine" | "fork";

const LINE: Record<ThreadTone, string> = {
  wine: "bg-wine",
  fork: "bg-[repeating-linear-gradient(to_bottom,var(--safe)_0_8px,transparent_8px_14px)]",
};

const BEAD: Record<ThreadTone, string> = {
  wine: "bg-wine text-on-wine",
  fork: "bg-safe text-white",
};

/** The vertical thread behind a list of beads. */
export function Thread({ tone = "wine", children }: { tone?: ThreadTone; children: ReactNode }) {
  return (
    <div className="relative">
      <span aria-hidden className={`absolute bottom-6 left-[15px] top-2 w-0.5 ${LINE[tone]}`} />
      {children}
    </div>
  );
}

export function StartBead({ text, tone = "wine" }: { text: string; tone?: ThreadTone }) {
  return (
    <div className="relative flex gap-4 pb-6">
      <span aria-hidden className={`mt-1 size-8 shrink-0 rounded-full border-4 border-sand ${BEAD[tone]}`} />
      <p className="min-w-0 pt-1 text-lg text-muted-foreground">{text}</p>
    </div>
  );
}

export function StepBead({
  step,
  index,
  lang,
  tone = "wine",
  children,
}: {
  step: ReplayStep;
  index: number;
  lang: LangKey;
  tone?: ThreadTone;
  children?: ReactNode;
}) {
  const t = useT();
  const tag = STEP_TAGS[step.tag];
  const TagIcon = tag.icon;
  return (
    <div className="relative flex gap-4 pb-7">
      <span
        aria-hidden
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-base tabular-nums ${BEAD[tone]}`}
      >
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-lg text-ink">{pick(step.text, lang)}</p>
        <p className="mt-1 flex flex-wrap items-start gap-x-3 gap-y-1 text-base text-muted-foreground">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm ${tag.className}`}>
            <TagIcon aria-hidden className="size-4" />
            {t(tag.label)}
          </span>
          <span className="min-w-0 flex-1 basis-56">{pick(step.reason, lang)}</span>
        </p>
        {children}
      </div>
    </div>
  );
}

export function OutcomeBead({
  outcome,
  lang,
  tone = "wine",
}: {
  outcome: ReplayOutcome;
  lang: LangKey;
  tone?: ThreadTone;
}) {
  const t = useT();
  const meta = TAG_META[outcome.tag as OutcomeTagName];
  const Icon = meta.icon;
  return (
    <div className="relative flex gap-4">
      {/* The outcome ends the path: hide the thread below this bead. */}
      <span aria-hidden className="absolute -bottom-6 left-[15px] top-8 w-0.5 bg-background" />
      <span
        aria-hidden
        className={`relative flex size-8 shrink-0 items-center justify-center rounded-full ${BEAD[tone]}`}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${meta.chip}`}>
          {t(meta.label)}
        </span>
        <p className="mt-2 text-xl text-wine">{pick(outcome.headline, lang)}</p>
      </div>
    </div>
  );
}
