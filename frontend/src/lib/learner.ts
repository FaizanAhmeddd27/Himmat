"use client";

/**
 * Guest learner identity (SRS FR-1.2). No sign-up and no personal data: a random
 * id kept in this browser links sessions and skills to one practice profile.
 */

const KEY = "himmat.learner";

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
