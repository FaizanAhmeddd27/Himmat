import type { ActionDef, ChatMessage, LangKey, Localized } from "@/lib/types";

/**
 * Props every screen inside the phone receives from ScenarioPlayer.
 * The screen renders its own choices with the fake app's look —
 * the player never styles one differently to hint at risk (UI_UX §5.1).
 */
export interface ScreenProps {
  lang: LangKey;
  /** node.ui.props from the engine, passed straight through */
  ui: Record<string, unknown>;
  actions: ActionDef[];
  /** Learner picked one of the choices (input = typed text, e.g. practice OTP). */
  choose: (action: ActionDef, input?: string) => void;
  /** Last engine error, shown calmly with icon + word (UI_UX §5.10). */
  error?: { code: string; message: string; status: number } | null;
}

/** Pick the localized string for the current language. */
export function pickText(map: Localized | undefined | null, lang: LangKey): string {
  if (!map) return "";
  return map[lang] ?? map.en ?? "";
}

export function chatMessagesOf(ui: Record<string, unknown>, lang: LangKey): ChatMessage[] {
  const raw = (ui.messages as ChatMessage[] | undefined) ?? [];
  return raw;
}

export function senderNameOf(ui: Record<string, unknown>, lang: LangKey): string {
  return pickText((ui.sender_name as Localized | undefined) ?? null, lang);
}
