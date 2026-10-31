/**
 * Shared API/client types for the HIMMAT scenario engine.
 * Mirrors backend/app/engine/models.py response payloads.
 */

export type LangKey = "en" | "ur-Latn";

/** Inline localized map carried in scenario data. `en` is always present. */
export interface Localized {
  en: string;
  "ur-Latn"?: string;
  [key: string]: string | undefined;
}

export interface LocalizedContent {
  what: Localized;
  why: Localized;
  should_have: Localized;
  do_differently: Localized;
}

export interface Evidence {
  skill: string;
  value: number;
  weight: number;
}

export interface ActionDef {
  id: string;
  label: Localized;
  needs_input?: string | null;
}

export interface NodeUI {
  component: string;
  props: Record<string, unknown>;
}

export interface NodePayload {
  id: string;
  type: "screen" | "outcome";
  ui: NodeUI | null;
  actions: ActionDef[];
}

export interface OutcomeTag {
  tag: "safe" | "close_call" | "affected" | "neutral";
  consequence: LocalizedContent | null;
  recovery?: string | null;
}

export interface ChatMessage {
  from: string;
  text: Localized;
}

export interface SessionView {
  session_id: string;
  scenario_id: string;
  mode: string;
  status: "active" | "completed";
  node: NodePayload;
  state: Record<string, boolean | number | string>;
  outcome_id: string | null;
  outcome_tag: OutcomeTag["tag"] | null;
  consequence: LocalizedContent | null;
  recovery: string | null;
  events_count: number;
  hints_used: number;
}

export interface ActionResponse {
  session_id: string;
  node: NodePayload;
  state: SessionView["state"];
  consequence: LocalizedContent | null;
  outcome_id: string | null;
  outcome_tag: OutcomeTag["tag"] | null;
  recovery: string | null;
  status: string;
}

export interface HintResponse {
  level: 1 | 2 | 3;
  hint: Localized;
  hints_used: number;
}

export interface ScenarioMeta {
  id: string;
  title: Localized;
  summary: Localized;
  skills: string[];
  difficulty: number;
  is_active: boolean;
  nodes_count?: number;
}

/** Engine error shape: { error: { code, message } } surfaced by FastAPI detail. */
export interface ApiErrorInfo {
  code: string;
  message: string;
  status: number;
}
