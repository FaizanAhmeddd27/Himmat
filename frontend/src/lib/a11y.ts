"use client";

/**
 * Accessibility store (UI_UX.md §7): language, text size, high contrast.
 * Persists to localStorage and mirrors state onto <html data-*> attributes.
 */

import { create } from "zustand";
import type { LangKey, Localized } from "./types";

export type { LangKey } from "./types";

export type TextSize = "normal" | "large" | "xlarge";

interface A11yState {
  lang: LangKey;
  textSize: TextSize;
  highContrast: boolean;
  /** Rehydrate from localStorage and apply attributes. Safe to call on mount. */
  hydrate: () => void;
  setLang: (lang: LangKey) => void;
  setTextSize: (size: TextSize) => void;
  toggleContrast: () => void;
}

const STORAGE_KEY = "himmat.a11y";

function apply(lang: LangKey, textSize: TextSize, highContrast: boolean) {
  const html = document.documentElement;
  html.dataset.text = textSize;
  html.dataset.contrast = highContrast ? "high" : "normal";
  html.lang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, textSize, highContrast }));
  } catch {
    // Private mode: settings still apply for this visit.
  }
}

export const useA11y = create<A11yState>((set, get) => ({
  lang: "en",
  textSize: "large",
  highContrast: false,
  hydrate: () => {
    let saved: Partial<Pick<A11yState, "lang" | "textSize" | "highContrast">> = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      // Unreadable settings: fall back to the defaults below.
    }
    const lang = saved.lang === "ur-Latn" ? "ur-Latn" : "en";
    const textSize =
      saved.textSize === "normal" || saved.textSize === "xlarge" ? saved.textSize : "large";
    const highContrast = Boolean(saved.highContrast);
    set({ lang, textSize, highContrast });
    apply(lang, textSize, highContrast);
  },
  setLang: (lang) => {
    set({ lang });
    apply(lang, get().textSize, get().highContrast);
  },
  setTextSize: (textSize) => {
    set({ textSize });
    apply(get().lang, textSize, get().highContrast);
  },
  toggleContrast: () => {
    const highContrast = !get().highContrast;
    set({ highContrast });
    apply(get().lang, get().textSize, highContrast);
  },
}));

/** Pick a string out of an inline localized map, falling back to English. */
export function pick(map: Localized | null | undefined, lang: LangKey): string {
  if (!map) return "";
  return map[lang] ?? map.en ?? "";
}

/** An English voice cannot pronounce Roman Urdu, so read-aloud stays off for it. */
export function canReadAloud(lang: LangKey): boolean {
  return lang === "en";
}

/** Read-aloud helper (UI_UX §5.4.1). */
export function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en";
  window.speechSynthesis.speak(utterance);
}
