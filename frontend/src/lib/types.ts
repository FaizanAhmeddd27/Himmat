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

export interface ActionDef {
  id: string;
  label: Localized;
  slot: string;
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
  has_hints?: boolean;
}

export type OutcomeTagName = "safe" | "close_call" | "affected" | "neutral";
export type StepTag = "safe" | "risky" | "neutral";
export type SessionMode = "practice" | "mastery";

export interface ChatMessage {
  from: string;
  text: Localized;
  link?: string;
}

export interface SkillChange {
  skill: string;
  before: number;
  after: number;
}

export interface SessionView {
  session_id: string;
  scenario_id: string;
  mode: string;
  status: "active" | "completed";
  node: NodePayload;
  state: Record<string, boolean | number | string>;
  outcome_id: string | null;
  outcome_tag: OutcomeTagName | null;
  headline: Localized | null;
  consequence: LocalizedContent | null;
  recovery: string | null;
  events_count: number;
  hints_used: number;
  parent_session_id: string | null;
  skill_changes: SkillChange[];
}

export interface ActionResponse {
  session_id: string;
  node: NodePayload;
  state: SessionView["state"];
  status: string;
}

export interface HintResponse {
  level: 1 | 2 | 3;
  hint: Localized;
  hints_used: number;
}

export interface ScenarioMeta {
  id: string;
  kind?: "practice" | "mastery";
  title: Localized;
  summary: Localized;
  skills: string[];
  difficulty: number;
  is_active: boolean;
  nodes_count?: number;
}

export interface ApiErrorInfo {
  code: string;
  message: string;
  status: number;
}

// ---- Replay and What-if ----------------------------------------------------

export interface ReplayAlternative {
  action_id: string;
  what_if: Localized;
}

export interface ReplayStep {
  step_no: number;
  text: Localized;
  reason: Localized;
  tag: StepTag;
  alternatives: ReplayAlternative[];
}

export interface ReplayOutcome {
  id: string;
  tag: OutcomeTagName;
  headline: Localized;
  recovery: string | null;
  practice_balance: number | null;
}

export interface ReplayView {
  session_id: string;
  scenario_id: string;
  scenario_title: Localized;
  start: Localized;
  steps: ReplayStep[];
  outcome: ReplayOutcome | null;
  parent_session_id: string | null;
  branch_from_step: number | null;
}

export interface CompareView {
  scenario_title: Localized;
  start: Localized;
  shared_steps: number;
  original: { session_id: string; steps: ReplayStep[]; outcome: ReplayOutcome | null };
  branch: { session_id: string; steps: ReplayStep[]; outcome: ReplayOutcome | null };
}

// ---- Recovery Lab ----------------------------------------------------------

export interface RecoveryCard {
  id: string;
  label: Localized;
}

export interface RecoveryView {
  id: string;
  title: Localized;
  intro: Localized;
  cards: RecoveryCard[];
}

export interface RecoveryStepResult {
  id: string;
  label: Localized;
  verdict: "good" | "order" | "harmful" | "missed";
  explain: Localized;
}

export interface RecoveryResult {
  passed: boolean;
  completeness: number;
  steps: RecoveryStepResult[];
  missed: RecoveryStepResult[];
  skill_changes: SkillChange[];
}

// ---- Digital DNA -----------------------------------------------------------

export interface DnaSkill {
  id: string;
  name: Localized;
  mastery: number;
  practised: boolean;
}

export interface DnaHistoryPoint {
  label: string;
  average: number;
}

export interface Recommendation {
  kind: "scenario" | "recovery" | "mastery" | "done";
  target: string | null;
  skill: string | null;
  title: Localized;
  reason: Localized;
}

export interface ReviewItem {
  scenario_id: string;
  kind: "practice" | "mastery";
  title: Localized;
  due: boolean;
  days_left: number;
}

export interface AssessmentView {
  questions: {
    id: string;
    situation: Localized;
    options: { id: string; label: Localized }[];
  }[];
}

export interface DnaView {
  assessed: boolean;
  onboarded: boolean;
  reviews: ReviewItem[];
  learner_id: string;
  name: string;
  skills: DnaSkill[];
  history: DnaHistoryPoint[];
  confidence: { before: number | null; after: number | null };
  recommendation: Recommendation;
}

// ---- Family dashboard ------------------------------------------------------

export type ConsentCategory = "skills_summary" | "difficulty_areas" | "activity_timeline";

export interface FamilyView {
  learner_name: string;
  supporter_name: string;
  consents: Record<ConsentCategory, boolean>;
  skills_summary: DnaSkill[] | null;
  difficulty_areas: { skill: DnaSkill; tip: Localized }[] | null;
  activity_timeline: { label: string; text: Localized }[] | null;
  history: DnaHistoryPoint[] | null;
}
