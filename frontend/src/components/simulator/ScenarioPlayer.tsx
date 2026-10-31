"use client";

/**
 * ScenarioPlayer orchestrates the practice phone and the coach panel
 * (docs/UI_UX.md §6.3). Choices happen on the phone itself; the panel only
 * guides. Progress survives a refresh: the session id lives in localStorage and
 * the engine keeps state server-side.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { api, toApiError } from "@/lib/api";
import { useA11y } from "@/lib/a11y";
import { useT } from "@/lib/i18n";
import type { ActionDef, ApiErrorInfo, HintResponse, ScenarioMeta, SessionMode, SessionView } from "@/lib/types";
import { PracticeBanner } from "@/components/layout/PracticeBanner";
import { PhoneFrame } from "@/components/simulator/PhoneFrame";
import { ChatThread } from "@/components/simulator/ChatThread";
import { SenderDetails } from "@/components/simulator/SenderDetails";
import { FakeVerifyPage } from "@/components/simulator/FakeVerifyPage";
import { BankAlert, OfficialCall } from "@/components/simulator/PhoneScreens";
import { ConsequencePanel } from "@/components/simulator/ConsequencePanel";
import { HintDrawer } from "@/components/simulator/HintDrawer";
import { ScenarioIntro } from "@/components/simulator/ScenarioIntro";
import type { ScreenProps } from "@/components/simulator/screen-props";

/** node.ui.component -> React component (engine stays UI-agnostic) */
export const SCREENS: Record<string, (props: ScreenProps) => React.ReactNode> = {
  "ChatLine/ChatThread": ChatThread,
  "ChatLine/SenderDetails": SenderDetails,
  "ChatLine/FakeVerifyPage": FakeVerifyPage,
  "Phone/OfficialCall": OfficialCall,
  "Phone/BankAlert": BankAlert,
};

export function ScenarioPlayer({
  scenario,
  mode,
  branchSessionId,
  firstAction,
}: {
  scenario: ScenarioMeta;
  mode: SessionMode;
  /** Set when playing on from a What-if rewind. */
  branchSessionId?: string;
  /** Set when the learner already tapped something on the landing page phone. */
  firstAction?: string;
}) {
  const lang = useA11y((s) => s.lang);
  const t = useT();

  const [session, setSession] = useState<SessionView | null>(null);
  const [resuming, setResuming] = useState(true);
  const [hints, setHints] = useState<HintResponse[]>([]);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [starting, setStarting] = useState(false);
  const [reveal, setReveal] = useState(false);
  const busy = useRef(false);

  const storageKey = `himmat.session.${scenario.id}.${mode}`;

  const start = useCallback(
    async (thenAction?: string) => {
      setStarting(true);
      setError(null);
      setHints([]);
      setReveal(false);
      try {
        let view = await api.createSession(scenario.id, mode);
        localStorage.setItem(storageKey, view.session_id);
        if (thenAction) {
          await api.applyAction(view.session_id, thenAction);
          view = await api.getSession(view.session_id);
        }
        setSession(view);
      } catch (err) {
        setError(toApiError(err));
      } finally {
        setStarting(false);
      }
    },
    [mode, scenario.id, storageKey],
  );

  // Resume a saved session (refresh mid-game), a branch, or start from a landing tap.
  useEffect(() => {
    const open = async () => {
      if (firstAction) {
        await start(firstAction);
        return;
      }
      const savedId = branchSessionId ?? localStorage.getItem(storageKey);
      if (!savedId) return;
      try {
        setSession(await api.getSession(savedId));
      } catch {
        // Session gone or server unreachable: the intro offers a fresh start.
        localStorage.removeItem(storageKey);
      }
    };
    open().finally(() => setResuming(false));
  }, [branchSessionId, firstAction, start, storageKey]);

  const choose = useCallback(
    async (action: ActionDef, input?: string) => {
      if (!session || busy.current) return;
      busy.current = true;
      setError(null);
      try {
        const result = await api.applyAction(session.session_id, action.id, input);
        if (result.status === "completed") {
          setSession(await api.getSession(session.session_id));
        } else {
          setSession({ ...session, node: result.node, state: result.state });
        }
        setHints([]);
        setReveal(false);
      } catch (err) {
        setError(toApiError(err));
      } finally {
        busy.current = false;
      }
    },
    [session],
  );

  if (resuming) {
    return (
      <>
        <PracticeBanner />
        <main className="flex flex-1 items-center justify-center px-6 py-24">
          <p className="text-lg text-muted-foreground">{t("common.loading")}</p>
        </main>
      </>
    );
  }

  if (session?.status === "completed") {
    return (
      <>
        <PracticeBanner />
        <main className="flex flex-1 flex-col">
          <ConsequencePanel lang={lang} session={session} onPlayAgain={() => start()} />
        </main>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <PracticeBanner />
        <main className="flex flex-1 flex-col">
          <ScenarioIntro scenario={scenario} lang={lang} mode={mode} onStart={() => start()} starting={starting} />
          {error ? (
            <p role="alert" className="mx-auto mb-8 flex max-w-5xl items-start gap-2 px-6 text-base text-caution">
              <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0" />
              {error.message}
            </p>
          ) : null}
        </main>
      </>
    );
  }

  const Screen = SCREENS[session.node.ui?.component ?? ""];
  const inlineError = session.node.actions.some((action) => action.needs_input);

  return (
    <>
      <PracticeBanner />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-14">
        <div className="w-full lg:sticky lg:top-14 lg:w-[360px] lg:shrink-0">
          <PhoneFrame reveal={reveal}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={session.node.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="h-full"
              >
                {Screen ? (
                  <Screen
                    lang={lang}
                    ui={session.node.ui?.props ?? {}}
                    actions={session.node.actions}
                    choose={choose}
                    error={error}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </PhoneFrame>
        </div>

        <aside className="flex min-w-0 flex-1 flex-col gap-4 lg:pt-6">
          <div>
            <h1 className="text-xl text-wine sm:text-2xl">{t("player.title")}</h1>
            <p className="mt-2 max-w-md text-lg text-ink">
              {mode === "mastery" ? t("player.bodyMastery") : t("player.body")}
            </p>
            {session.parent_session_id ? (
              <p className="mt-2 max-w-md text-base text-muted-foreground">{t("player.branchNote")}</p>
            ) : null}
            <button
              type="button"
              aria-pressed={reveal}
              onClick={() => setReveal((value) => !value)}
              className="mt-4 inline-flex min-h-12 items-center rounded-[12px] border-2 border-wine px-4 text-base text-wine transition-colors hover:bg-wine-tint"
            >
              {reveal ? t("player.hideTaps") : t("player.showTaps")}
            </button>
          </div>

          {error && !inlineError ? (
            <p role="alert" className="flex items-start gap-2 text-base text-caution">
              <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0" />
              {error.message}
            </p>
          ) : null}

          {mode !== "mastery" && session.node.has_hints ? (
            <HintDrawer
              key={session.node.id}
              sessionId={session.session_id}
              lang={lang}
              hints={hints}
              onReveal={(hint) => setHints((prev) => [...prev, hint])}
            />
          ) : null}

          <div className="flex flex-wrap items-center gap-x-6 border-t border-border pt-2">
            {!session.parent_session_id ? (
              <button
                type="button"
                onClick={() => start()}
                className="inline-flex min-h-12 items-center text-base text-wine underline-offset-4 hover:underline"
              >
                {t("player.restart")}
              </button>
            ) : null}
            <Link
              href="/simulations"
              className="inline-flex min-h-12 items-center text-base text-wine underline-offset-4 hover:underline"
            >
              {t("player.exit")}
            </Link>
          </div>
        </aside>
      </main>
    </>
  );
}
