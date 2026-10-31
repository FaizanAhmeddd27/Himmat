import type { ActionDef, ApiErrorInfo, LangKey, Localized } from "@/lib/types";

/**
 * Props every screen inside the phone receives from ScenarioPlayer.
 * The screen renders its own choices with the fake app's look; the player
 * never styles one differently to hint at risk (UI_UX §5.1).
 */
export interface ScreenProps {
  lang: LangKey;
  /** node.ui.props from the engine, passed straight through */
  ui: Record<string, unknown>;
  actions: ActionDef[];
  /** Learner picked one of the choices (input = typed text, e.g. practice OTP). */
  choose: (action: ActionDef, input?: string) => void;
  /** Last engine error, shown calmly with icon + word (UI_UX §5.10). */
  error?: ApiErrorInfo | null;
}

/** The action a fake app places in a given slot, if the node offers one. */
export function inSlot(actions: ActionDef[], slot: string): ActionDef | undefined {
  return actions.find((action) => action.slot === slot);
}

export function allInSlot(actions: ActionDef[], slot: string): ActionDef[] {
  return actions.filter((action) => action.slot === slot);
}

export const asLocalized = (value: unknown) => (value as Localized | undefined) ?? null;
