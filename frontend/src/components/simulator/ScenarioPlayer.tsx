"use client";

/**
 * ScenarioPlayer — orchestrates the practice phone and the side panel
 * (docs/UI_UX.md §6.3). Layout: phone frame left, "What would you like to
 * do?" + hints right. On mobile everything stacks.
 *
 * Progress survives a refresh: the session id lives in localStorage and the
 * engine store keeps state server-side; GET /sessions/{id} resumes exactly.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, parse_api_error } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import type {
  ActionDef,
  HintResponse,
  ScenarioMeta,
  SessionView,
} from "@/lib/types";
import { PhoneFrame } from "@/components/simulator/PhoneFrame";
import { ChatThread } from "@/components/simulator/ChatThread";
import { SenderDetails } from "@/components/simulator/SenderDetails";
import { FakeVerifyPage } from "@/components/simulator/FakeVerifyPage";
import { ConsequencePanel } from "@/components/simulator/ConsequencePanel";
import { HintDrawer } from "@/components/simulator/HintDrawer";
import { ScenarioIntro } from "@/components/simulator/ScenarioIntro";
import type { ScreenProps } from "@/components/simulator/screen-props";

const MASCOT_SCREEN_TITLE = "What would you like to do?";

/** node.ui.component -> React component (engine stays UI-agnostic) */
const SCREENS: Record<string, (props: ScreenProps) => React.ReactNode> = {
  "ChatLine/ChatThread": ChatThread,
  "ChatLine/SenderDetails": SenderDetails,
  "ChatLine/FakeVerifyPage": FakeVerifyPage,
};

type Phase = "intro" | "play" | "outcome";

export function ScenarioPlayer({ scenario }: { scenario: ScenarioMeta }) {
  const lang = useA11y((s) => s.lang);
  const hydrate = useA11y((s) => s.hydrate);

  const [phase, setPhase] = useState<Phase>("intro");
  const [session, setSession] = useState<SessionView | null>(null);
  const [hints, setHints] = useState<HintResponse[]>([]);
  const [error, setError] = useState<ScreenProps["error"]>(null);
  const [starting, setStarting] = useState(false);
  const [busy, setBusy] = useState(false);
  const outcome = useRef<{
    consequence: NonNullable<SessionView["consequence"]>;
    outcomeTag: NonNullable<SessionView["outcome_tag"]>;
    recovery: string | null;
  } | null>(null);

  const storageKey = `himmat.session.${scenario.id}`;

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    outcome.current = null;
    setSession(null);
    setHints([]);
    setError(null);
  }, [storageKey]);

  // hydrate a11y prefs + resume a saved session (refresh mid-game)
  useEffect(() => {
    hydrate();
    const savedId = localStorage.getItem(storageKey);
    if (!savedId) return;
    api
      .getSession(savedId)
      .then((view) => {
        setSession(view);
        if (view.status === "completed" && view.consequence && view.outcome_tag) {
          outcome.current = {
            consequence: view.consequence,
            outcomeTag: view.outcome_tag,
            recovery: view.recovery,
          };
          setPhase("outcome");
        } else {
          setPhase("play");
        }
      })
      .catch(() => {
        // session gone or server unreachable — start fresh
        localStorage.removeItem(storageKey);
      });
  }, [hydrate, storageKey]);

  const start = useCallback(async () => {
    setStarting(true);
    setError(null);
    try {
      reset();
      const view = await api.createSession(scenario.id);
      localStorage.setItem(storageKey, view.session_id);
      setSession(view);
      setPhase("play");
    } catch (err) {
      setError(err as ScreenProps["error"]);
    } finally {
      setStarting(false);
    }
  }, [reset, scenario.id, storageKey]);

  const choose = useCallback(
    async (action: ActionDef, input?: string) => {
      if (!session || busy) return;
      setBusy(true);
      setError(null);
      try {
        const result = await api.applyAction(session.session_id, {
          id: action.id,
          input: input ?? null,
        });
        if (result.outcome_tag && result.consequence) {
          outcome.current = {
            consequence: result.consequence,
            outcomeTag: result.outcome_tag,
            recovery: result.recovery,
          };
          setPhase("outcome");
        } else {
          // append the fresh node view into the session snapshot
          setSession({
            ...session,
            node: result.node,
            state: result.state,
            events_count: session.events_count + 1,
          });
        }
      } catch (err) {
        const info = await parse_api_error_from(err);
        setError(info);
      } finally {
        setBusy(false);
      }
    },
    [busy, session],
  );

  const screens = useMemo(() => phase === "play" && session ? SCREENS[session.node.ui?.component ?? ""] : undefined, [phase, session]);
  const Screen = screens;

  // ---- outcome screen ------------------------------------------------------
  if (phase === "outcome" && outcome.current) {
    return (
      <ConsequencePanel
        lang={lang}
        consequence={outcome.current.consequence}
        outcomeId={session?.outcome_id ?? ""}
        outcomeTag={outcome.current.outcomeTag}
        recovery={outcome.current.recovery}
        onPlayAgain={start}
      />
    );
  }

  // ---- intro ---------------------------------------------------------------
  if (phase === "intro") {
    return <ScenarioIntro scenario={scenario} lang={lang} onStart={start} starting={starting} />;
  }

  // ---- play ----------------------------------------------------------------
  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="text-lg text-muted-foreground">Opening the practice phone…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-start">
      {/* phone */}
      <div className="w-full lg:w-[400px] lg:shrink-0">
        {Screen ? (
          <PhoneFrame>
            <Screen lang={lang} ui={session.node.ui?.props ?? {}} actions={session.node.actions} choose={choose} error={error} />
          </PhoneFrame>
        ) : (
          <PhoneFrame>
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-white px-6 text-center">
              <p className="text-ink">This screen is not wired yet: {session.node.id}</p>
            </div>
          </PhoneFrame>
        )}
      </div>

      {/* side panel */}
      <div className="flex flex-1 flex-col gap-4">
        <div className="card-meta">
          <p className="hero-label text-xs text-wine">{MASCOT_SCREEN_TITLE}</p>
          <p className="mt-2 text-base text-ink">
            Read the screen, then choose. There is no time limit and no wrong button — every
            choice teaches something.
          </p>

          {/* choices echoed outside the phone, for screen readers and the a11y path */}
          <div className="mt-4 flex flex-col gap-3" aria-label={`${MASCOT_SCREEN_TITLE} choices`}>
            {session.node.actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => choose(action)}
                disabled={busy}
                className="inline-flex min-h-12 items-center justify-start gap-2 rounded-[12px] border-2 border-wine px-4 text-wine transition-colors hover:bg-wine-tint disabled:opacity-60"
              >
                {pick(action.label, lang)}
              </button>
            ))}
          </div>

          {error ? (
            <p role="status" className="mt-4 flex items-start gap-2 rounded-[12px] bg-caution-tint p-3 text-base text-caution">
              <span aria-hidden>⚠</span>
              <span>{error.message}</span>
            </p>
          ) : null}
        </div>

        <HintDrawer
          scenarioId={scenario.id}
          sessionId={session.session_id}
          lang={lang}
          hints={hints}
          onReveal={(next, hint) => setHints((prev) => [...prev, hint])}
        />

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={start}
            className="inline-flex min-h-12 items-center rounded-[12px] border-2 border-wine px-4 text-wine hover:bg-wine-tint"
          >
            Restart from the beginning
          </button>
          <span>Session progress saves itself — you can refresh any time.</span>
        </div>
      </div>
    </div>
  );
}

/** Normalize thrown api errors into the calm ScreenProps error shape. */
async function parse_api_error_from(err: unknown): Promise<{ code: string; message: string; status: number }> {
  const e = err as { code?: string; message?: string; status?: number };
  if (e && e.code && e.message) return { code: e.code, message: e.message, status: e.status ?? 0 };
  return { code: "network_error", message: "The practice phone could not be reached. Make sure the backend is running, then try again.", status: 0 };
}
