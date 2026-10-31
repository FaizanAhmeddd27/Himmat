"use client";

/**
 * Guest learner identity (SRS FR-1.2). No sign-up and no personal data: a random
 * id kept in this browser links sessions and skills to one practice profile.
 * Signing in reuses the same id, so nothing practised as a guest is lost.
 */

const KEY = "himmat.learner";
const SESSION_PREFIX = "himmat.session.";

export function getLearnerId(): string {
  if (typeof window === "undefined") return "guest";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "guest";
  }
}

function forgetSavedSessions() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(SESSION_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}

/** Switch this browser to a profile, dropping sessions saved for the old one. */
export function setLearnerId(id: string) {
  try {
    if (localStorage.getItem(KEY) !== id) forgetSavedSessions();
    localStorage.setItem(KEY, id);
  } catch {
    // Private mode: the profile lasts for this visit only.
  }
}

/** A brand-new profile, for the demo and after deleting data. */
export function startFreshLearner(): string {
  const id = crypto.randomUUID();
  setLearnerId(id);
  return id;
}
