"use client";

/**
 * Accessibility store (UI_UX.md §7): language, text size, high contrast.
 * persists to localStorage and mirrors state onto <html data-*> attributes.
 */

import { create } from "zustand";
import type { LangKey } from "./types";

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
  html.dataset.text = textSize === "normal" ? "normal" : textSize;
  html.dataset.contrast = highContrast ? "high" : "normal";
  // Urdu script stays LTR in Phase 2 (ur-Latn). Script Urdu (ur, RTL) lands in
  // Phase 5 — dir switching handled there.
  html.lang = lang === "en" ? "en" : "en"; // ur-Latn renders LTR with Share Tech
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, textSize, highContrast }));
}

export const useA11y = create<A11yState>((set) => ({
  lang: "en",
  textSize: "large",
  highContrast: false,
  hydrate: () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<
        Pick<A11yState, "lang" | "textSize" | "highContrast">
      >;
      const lang = saved.lang === "ur-Latn" ? "ur-Latn" : "en";
      const textSize =
        saved.textSize === "normal" || saved.textSize === "xlarge" ? saved.textSize : "large";
      const highContrast = Boolean(saved.highContrast);
      set({ lang, textSize, highContrast });
      apply(lang, textSize, highContrast);
    } catch {
      apply("en", "large", false);
    }
  },
  setLang: (lang) => {
    set({ lang });
    apply(lang, useA11y.getState().textSize, useA11y.getState().highContrast);
  },
  setTextSize: (textSize) => {
    set({ textSize });
    apply(useA11y.getState().lang, textSize, useA11y.getState().highContrast);
  },
  toggleContrast: () => {
    const highContrast = !useA11y.getState().highContrast;
    set({ highContrast });
    apply(useA11y.getState().lang, useA11y.getState().textSize, highContrast);
  },
}));

/** Pick a string out of an inline localized map, falling back to English. */
export function pick(map: { en: string; [key: string]: string | undefined } | null | undefined, lang: LangKey): string {
  if (!map) return "";
  return map[lang] ?? map.en ?? "";
}

/** Read-aloud helper (UI_UX §5.4.1). Roman Urdu reads fine with an English voice. */
export function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en";
  window.speechSynthesis.speak(utterance);
}
