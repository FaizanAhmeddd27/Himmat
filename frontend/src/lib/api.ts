/**
 * Thin typed client for the HIMMAT scenario engine API.
 * Base URL comes from NEXT_PUBLIC_API_URL (default http://localhost:8000).
 */

import { useA11y } from "./a11y";
import { translate, type I18nKey } from "./i18n";
import { getLearnerId } from "./learner";
import type {
  ActionResponse,
  ApiErrorInfo,
  AssessmentView,
  CompareView,
  ConsentCategory,
  DnaView,
  FamilyView,
  HintResponse,
  LangKey,
  NodePayload,
  RecoveryResult,
  RecoveryView,
  ReplayView,
  ScenarioMeta,
  SessionMode,
  SessionView,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const V1 = `${API_BASE}/api/v1`;

const NETWORK_ERROR: ApiErrorInfo = {
  code: "network_error",
  message: "The practice phone could not connect. Check that the server is running, then try again.",
  status: 0,
};

/** Extract {code,message,status} from a FastAPI error body. */
async function parseApiError(res: Response): Promise<ApiErrorInfo> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // body was empty
  }
  const detail = (body as { detail?: { code?: string; message?: string } } | null)?.detail;
  return {
    code: detail?.code ?? "unknown_error",
    message: detail?.message ?? "That did not work. Please try again.",
    status: res.status,
  };
}

/** Normalize anything thrown by the client into the calm error shape. */
export function toApiError(err: unknown): ApiErrorInfo {
  const e = err as Partial<ApiErrorInfo> | null;
  const info = e?.code && e.message ? { code: e.code, message: e.message, status: e.status ?? 0 } : NETWORK_ERROR;
  // Engine errors arrive in English: show them in the learner's language.
  const known = translate(`error.${info.code}` as I18nKey, useA11y.getState().lang);
  return known ? { ...info, message: known } : info;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${V1}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Learner-Id": getLearnerId(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    // Engine errors (rejected_real_card, wrong_practice_code, ...) carry a calm
    // message the screens show as-is.
    throw Object.assign(new Error("api_error"), await parseApiError(res));
  }
  return res.json() as Promise<T>;
}

function post<T>(path: string, body: unknown = {}): Promise<T> {
  return fetchJson<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export const api = {
  listScenarios: () => fetchJson<ScenarioMeta[]>("/scenarios"),
  getScenario: (id: string) => fetchJson<ScenarioMeta>(`/scenarios/${id}`),
  previewScenario: (id: string) => fetchJson<NodePayload>(`/scenarios/${id}/preview`),

  createSession: (scenarioId: string, mode: SessionMode = "practice") =>
    post<SessionView>("/sessions", { scenario_id: scenarioId, mode }),
  getSession: (id: string) => fetchJson<SessionView>(`/sessions/${id}`),
  applyAction: (id: string, actionId: string, input?: string | null) =>
    post<ActionResponse>(`/sessions/${id}/actions`, { action_id: actionId, input: input ?? null }),
  requestHint: (id: string, level: 1 | 2 | 3) =>
    post<HintResponse>(`/sessions/${id}/hint?level=${level}`),
  askMentor: (id: string, question: string, lang: LangKey) =>
    post<{ text: string | null }>(`/sessions/${id}/ask`, { question, lang }),

  getReplay: (id: string) => fetchJson<ReplayView>(`/sessions/${id}/replay`),
  createBranch: (id: string, fromStep: number, actionId: string) =>
    post<SessionView>(`/sessions/${id}/branch`, { from_step: fromStep, action_id: actionId }),
  compare: (id: string, branchId: string) =>
    fetchJson<CompareView>(`/sessions/${id}/compare/${branchId}`),

  getRecovery: (id: string) => fetchJson<RecoveryView>(`/recovery/${id}`),
  submitRecovery: (id: string, steps: string[]) =>
    post<RecoveryResult>(`/recovery/${id}/submit`, { steps }),

  getDna: () => fetchJson<DnaView>("/skills/dna"),
  rateConfidence: (scenarioId: string, phase: "before" | "after", rating: number) =>
    post<{ ok: boolean }>("/skills/confidence", { scenario_id: scenarioId, phase, rating }),
  resetLearner: () => post<{ ok: boolean }>("/skills/reset"),

  getAssessment: () => fetchJson<AssessmentView>("/assessment"),
  submitAssessment: (answers: Record<string, string>) =>
    post<DnaView>("/assessment/submit", { answers }),
  skipAssessment: () => post<{ ok: boolean }>("/assessment/skip"),
  deleteAccount: () => fetchJson<{ ok: boolean }>("/account", { method: "DELETE" }),
  seedDemo: () => post<{ ok: boolean }>("/demo/seed"),

  getFamily: () => fetchJson<FamilyView>("/family/dashboard"),
  getSupporterView: (learnerId: string) =>
    fetchJson<FamilyView>(`/family/dashboard/${encodeURIComponent(learnerId)}`),
  setConsent: (category: ConsentCategory, granted: boolean) =>
    fetchJson<FamilyView>("/family/consents", {
      method: "PUT",
      body: JSON.stringify({ category, granted }),
    }),
};
