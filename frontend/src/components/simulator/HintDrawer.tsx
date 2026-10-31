"use client";

/**
 * Hints (docs/UI_UX.md §5.8): three levels revealed one tap at a time, inline
 * beside the phone so the screen stays visible while reading. Nothing here can
 * do the task for the learner.
 */

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Volume2 } from "lucide-react";
import Image from "next/image";
import { api, toApiError } from "@/lib/api";
import { canReadAloud, pick, speak } from "@/lib/a11y";
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
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  const nextLevel = (hints.length + 1) as 1 | 2 | 3;

  const reveal = async () => {
    setBusy(true);
    setError(null);
    try {
      onReveal(await api.requestHint(sessionId, nextLevel));
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const ask = async (event: FormEvent) => {
    event.preventDefault();
    if (!question.trim() || asking) return;
    setAsking(true);
    setError(null);
    setAnswer(null);
    try {
      const reply = await api.askMentor(sessionId, question, lang);
      setAnswer(reply.text ?? t("hint.askFallback"));
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setAsking(false);
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
                  const text = pick(hint.hint, lang);
                  return (
                    <li key={hint.level} className="rounded-[12px] bg-neutral-tint p-3">
                      <p className="text-sm text-muted-foreground">{t(LEVEL_TITLES[hint.level])}</p>
                      <p className="mt-1 text-base text-ink">{text}</p>
                      {canReadAloud(lang) ? (
                      <button
                        type="button"
                        onClick={() => speak(text)}
                        className="mt-1 inline-flex min-h-12 items-center gap-2 text-sm text-wine underline-offset-4 hover:underline"
                      >
                        <Volume2 aria-hidden className="size-5" />
                        {t("common.listen")}
                      </button>
                      ) : null}
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
              <form onSubmit={ask} className="mt-5 border-t border-border pt-4">
                <label htmlFor="ask-ustad" className="block text-base text-ink">
                  {t("hint.ask")}
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <input
                    id="ask-ustad"
                    value={question}
                    maxLength={300}
                    autoComplete="off"
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder={t("hint.askPlaceholder")}
                    className="min-h-12 min-w-0 flex-1 basis-48 rounded-[12px] border-2 border-border-strong bg-surface px-3 text-base text-ink placeholder:text-text-subtle focus:border-wine"
                  />
                  <button
                    type="submit"
                    disabled={asking || !question.trim()}
                    className="min-h-12 rounded-[12px] border-2 border-wine px-4 text-base text-wine hover:bg-wine-tint disabled:opacity-60"
                  >
                    {asking ? "..." : t("hint.askSend")}
                  </button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t("hint.askNote")}</p>
                {answer ? (
                  <div aria-live="polite" className="mt-3 rounded-[12px] bg-neutral-tint p-3">
                    <p className="text-base text-ink">{answer}</p>
                    {canReadAloud(lang) ? (
                    <button
                      type="button"
                      onClick={() => speak(answer)}
                      className="mt-1 inline-flex min-h-12 items-center gap-2 text-sm text-wine underline-offset-4 hover:underline"
                    >
                      <Volume2 aria-hidden className="size-5" />
                      {t("common.listen")}
                    </button>
                    ) : null}
                  </div>
                ) : null}
              </form>
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
