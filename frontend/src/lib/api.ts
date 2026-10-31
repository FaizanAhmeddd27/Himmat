/**
 * Thin typed client for the HIMMAT scenario engine API (Phase 2).
 * Base URL comes from NEXT_PUBLIC_API_URL (default http://localhost:8000).
 */

import type {
  ActionDef,
  ActionResponse,
  HintResponse,
  ScenarioMeta,
  SessionView,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const V1 = `${API_BASE}/api/v1`;

/** Extract {code,message,status} from a FastAPI 4xx body. */
export async function parse_api_error(res: Response): Promise<{ code: string; message: string; status: number }> {
  let detail: unknown = null;
  try {
    detail = await res.json();
  } catch {
    // body was empty
  }
  const d = (detail as { detail?: { code?: string; message?: string } } | null)?.detail;
  return {
    code: d?.code ?? "unknown_error",
    message:
      d?.message ??
      "Something did not work. Please try again — this is a practice world, nothing can break.",
    status: res.status,
  };
}

async function fetch_json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await parse_api_error(res);
    // Surface engine errors (invalid_action, rejected_real_card, …) as a
    // typed exception the player can show calmly instead of throwing raw.
    throw Object.assign(new Error(err.message), err);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listScenarios(): Promise<ScenarioMeta[]> {
    return fetch_json<ScenarioMeta[]>(`${V1}/scenarios`);
  },

  getScenario(scenarioId: string): Promise<ScenarioMeta> {
    return fetch_json<ScenarioMeta>(`${V1}/scenarios/${scenarioId}`);
  },

  createSession(scenarioId: string, mode = "practice"): Promise<SessionView> {
    return fetch_json<SessionView>(`${V1}/sessions`, {
      method: "POST",
      body: JSON.stringify({ scenario_id: scenarioId, mode }),
    });
  },

  getSession(sessionId: string): Promise<SessionView> {
    return fetch_json<SessionView>(`${V1}/sessions/${sessionId}`);
  },

  applyAction(
    sessionId: string,
    action: Pick<ActionDef, "id"> & { input?: string | null },
  ): Promise<ActionResponse> {
    return fetch_json<ActionResponse>(`${V1}/sessions/${sessionId}/actions`, {
      method: "POST",
      body: JSON.stringify({ action_id: action.id, input: action.input ?? null }),
    });
  },

  requestHint(sessionId: string, level: 1 | 2 | 3): Promise<HintResponse> {
    return fetch_json<HintResponse>(`${V1}/sessions/${sessionId}/hint?level=${level}`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
};
