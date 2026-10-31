"use client";

/**
 * Hints (docs/UI_UX.md §5.8): three levels revealed one tap at a time, inline
 * beside the phone so the screen stays visible while reading. Nothing here can
 * do the task for the learner.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Volume2 } from "lucide-react";
import Image from "next/image";
import { api, toApiError } from "@/lib/api";
import { pick, speak } from "@/lib/a11y";
import { useT, type I18nKey } from "@/lib/i18n";
import type { ApiErrorInfo, HintResponse, LangKey } from "@/lib/types";

const LEVEL_TITLES: Record<1 | 2 | 3, I18nKey> = {
  1: "hint.nudge",
  2: "hint.where",
  3: "hint.explain",
};

export function HintDrawer({
  sessionId,
  lang,
  hints,
  onReveal,
}: {
  sessionId: string;
  lang: LangKey;
  hints: HintResponse[]; // revealed on this screen, in order
  onReveal: (hint: HintResponse) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  const nextLevel = (hints.length + 1) as 1 | 2 | 3;

  const reveal = async () => {
    setBusy(true);
    setError(null);
    try {
      onReveal(await api.requestHint(sessionId, nextLevel, lang));
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-14 w-full items-center justify-between gap-2 text-start text-lg text-wine"
      >
        <span className="flex items-center gap-3">
          <Image src="/himmat1.png" alt="" width={40} height={44} className="h-11 w-auto" />
          {t("hint.open")}
        </span>
        <ChevronDown aria-hidden className={`size-6 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4">
              <p className="text-sm text-muted-foreground">{t("hint.private")}</p>
              <ol className="mt-3 space-y-3">
                {hints.map((hint) => {
                  const text = hint.ai_text || pick(hint.hint, lang);
                  return (
                    <li key={hint.level} className="rounded-[12px] bg-neutral-tint p-3">
                      <p className="text-sm text-muted-foreground">{t(LEVEL_TITLES[hint.level])}</p>
                      <p className="mt-1 text-base text-ink">{text}</p>
                      <button
                        type="button"
                        onClick={() => speak(text)}
                        className="mt-1 inline-flex min-h-12 items-center gap-2 text-sm text-wine underline-offset-4 hover:underline"
                      >
                        <Volume2 aria-hidden className="size-5" />
                        {t("common.listen")}
                      </button>
                    </li>
                  );
                })}
              </ol>
              {hints.length < 3 ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={reveal}
                  className="mt-3 inline-flex min-h-12 items-center justify-center rounded-[12px] border-2 border-wine px-4 text-base text-wine hover:bg-wine-tint disabled:opacity-60"
                >
                  {t("hint.next")}
                </button>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{t("hint.done")}</p>
              )}
              {error ? (
                <p role="status" className="mt-2 text-sm text-caution">
                  {error.message}
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
