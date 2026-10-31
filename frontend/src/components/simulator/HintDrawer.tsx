"use client";

/**
 * Hint drawer (docs/UI_UX.md §5.8): floating "Need a hint?" button, opens a
 * drawer with 3 levels revealed one tap at a time: Nudge → Show me where →
 * Explain. Static hints come from the engine (Phase 5 adds an AI layer).
 */

import { useState } from "react";
import { HeartHandshake, Sparkles } from "lucide-react";
import Image from "next/image";
import { pick, speak } from "@/lib/a11y";
import type { HintResponse, LangKey } from "@/lib/types";

const LEVEL_TITLES: Record<1 | 2 | 3, string> = {
  1: "Nudge",
  2: "Show me where",
  3: "Explain",
};

export function HintDrawer({
  scenarioId,
  sessionId,
  lang,
  hints,
  onReveal,
}: {
  scenarioId: string;
  sessionId: string;
  lang: LangKey;
  hints: HintResponse[]; // already revealed this session, in order
  onReveal: (next: 1 | 2 | 3, hint: HintResponse) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const nextLevel = ((hints.length + 1) as 1 | 2 | 3);
  const canReveal = hints.length < 3;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-12 items-center gap-2 rounded-[12px] border-2 border-wine px-4 text-wine transition-colors hover:bg-wine-tint"
      >
        <HeartHandshake aria-hidden className="size-5" />
        Need a hint? ({hints.length}/3)
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-end bg-black/30 p-4 sm:p-8"
          role="dialog"
          aria-label="Hints"
        >
          <button
            type="button"
            aria-label="Close hints"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[16px] border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <Image
                src="/himmat1.png"
                alt=""
                aria-hidden
                width={64}
                height={64}
                className="mix-blend-multiply"
              />
              <div>
                <p className="text-lg text-wine">Ustad is here</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No one can see your answers. Take your time.
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-3">
              {hints.map((hint) => (
                <li key={hint.level} className="rounded-[12px] border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {LEVEL_TITLES[hint.level as 1 | 2 | 3]}
                  </p>
                  <p className="mt-1 text-base text-ink">{pick(hint.hint, lang)}</p>
                  <button
                    type="button"
                    onClick={() => speak(pick(hint.hint, lang))}
                    className="mt-1 inline-flex min-h-9 items-center gap-1.5 text-sm text-wine hover:underline"
                  >
                    <Sparkles aria-hidden className="size-4" /> Listen
                  </button>
                </li>
              ))}
            </ul>

            {canReveal ? (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const { api } = await import("@/lib/api");
                    const hint = await api.requestHint(sessionId, nextLevel);
                    onReveal(nextLevel, hint);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[12px] bg-wine px-4 text-on-wine disabled:opacity-60"
              >
                {busy ? "…" : `Show me step ${nextLevel} of 3`}
              </button>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                That is every step Ustad can give. You decide from here.
              </p>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-[12px] border-2 border-wine px-4 text-wine"
            >
              Back to the practice phone
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
