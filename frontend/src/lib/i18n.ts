"use client";

/**
 * Interface strings for English and Roman Urdu (SRS FR-10.1).
 * Scenario text lives in the scenario JSON; everything around it lives here.
 */

import { useCallback } from "react";
import { useA11y } from "./a11y";
import type { LangKey } from "./types";

const en = {
  "nav.practise": "Practise",
  "nav.skills": "My skills",
  "nav.family": "Family",
  "a11y.switchLang": "Roman Urdu",
  "a11y.textSize": "Text size",
  "a11y.contrast": "High contrast",
  "a11y.settings": "Language and text settings",
  "banner.practice": "Practice world. Nothing here is real.",
  "common.listen": "Listen",
  "common.loading": "Opening the practice phone...",
  "common.retry": "Try again",
  "common.level": "Level",
  "common.easy": "Easy",

  "player.title": "What would you like to do?",
  "player.body": "Read the screen, then tap anything on the phone. There is no time limit.",
  "player.bodyMastery": "Try this one on your own. No hints this time, and no time limit.",
  "player.showTaps": "Show me what I can tap",
  "player.hideTaps": "Hide the markers",
  "player.restart": "Start over",
  "player.exit": "Back to practice list",
  "player.branchNote": "You are trying a different choice. Your first try is saved.",

  "hint.open": "Need a hint?",
  "hint.nudge": "Nudge",
  "hint.where": "Show me where",
  "hint.explain": "Explain",
  "hint.next": "Show the next hint",
  "hint.done": "Those are all the hints for this screen. The choice is yours.",
  "hint.who": "Ustad is here",
  "hint.private": "Take your time. Using a hint is fine.",
  "hint.ask": "Ask Ustad a question",
  "hint.askPlaceholder": "Type your question here",
  "hint.askSend": "Ask",
  "hint.askNote": "Ustad explains. You make the choice.",

  "intro.you": "You are Amma today. Ustad stays beside you if you want a hint, and nothing here can touch your real money or accounts.",
  "intro.time": "About 3 minutes",
  "intro.start": "Open the practice phone",
  "intro.starting": "Opening...",
  "intro.confidence": "How sure do you feel about messages like this?",
  "intro.back": "Back to practice list",

  "outcome.safe": "Safe",
  "outcome.close_call": "Close call",
  "outcome.affected": "Practice account affected",
  "outcome.neutral": "You got help",
  "outcome.q.what": "What happened?",
  "outcome.q.why": "Why did it happen?",
  "outcome.q.should": "What should have happened?",
  "outcome.q.different": "What can you do differently?",
  "outcome.replay": "Replay my choices",
  "outcome.recovery": "Practise what to do next",
  "outcome.mastery": "Try a new one on your own",
  "outcome.skills": "See my skills",
  "outcome.again": "Play this again",
  "outcome.compare": "Compare both tries",
  "outcome.moved": "Your skills changed",
  "outcome.passed": "You spotted it on your own",
  "outcome.notYet": "Not yet. You can try again",
  "outcome.afterConfidence": "How sure do you feel now?",
  "outcome.thanks": "Saved. Thank you.",

  "catalogue.title": "Practise everyday digital situations",
  "catalogue.body": "Short stories inside a practice phone. You choose at each step, see what happens, and learn what to do next.",
  "catalogue.start": "Start practising",
  "catalogue.soon": "Coming later",
  "catalogue.loadError": "The practice phone could not connect. Check that the server is running, then refresh.",
  "catalogue.mastery": "New situation, no hints",

  "footer.tag": "Learn it. Break it. Recover from it. Master it.",
} as const;

export type I18nKey = keyof typeof en;

const urLatn: Partial<Record<I18nKey, string>> = {
  "nav.practise": "Practice",
  "nav.skills": "Meri salahiyat",
  "nav.family": "Ghar wale",
  "a11y.switchLang": "English",
  "a11y.textSize": "Likhai ka size",
  "a11y.contrast": "Zyada wazeh rang",
  "a11y.settings": "Zaban aur likhai ki settings",
  "banner.practice": "Practice world. Yahan kuch bhi asli nahi.",
  "common.listen": "Sunein",
  "common.loading": "Practice phone khul raha hai...",
  "common.retry": "Dobara koshish karein",
  "common.level": "Darja",
  "common.easy": "Aasan",

  "player.title": "Aap kya karna chahengi?",
  "player.body": "Screen parhein, phir phone par jahan chahein tap karein. Koi waqt ki pabandi nahi.",
  "player.bodyMastery": "Yeh khud try karein. Is dafa koi hint nahi, aur waqt ki koi pabandi nahi.",
  "player.showTaps": "Dikhayein main kahan tap kar sakti hoon",
  "player.hideTaps": "Nishan chhupayein",
  "player.restart": "Shuru se karein",
  "player.exit": "Practice list par wapis",
  "player.branchNote": "Aap aik mukhtalif faisla try kar rahi hain. Pehli koshish mehfooz hai.",

  "hint.open": "Hint chahiye?",
  "hint.nudge": "Ishara",
  "hint.where": "Dikhayein kahan",
  "hint.explain": "Samjhayein",
  "hint.next": "Agla hint dikhayein",
  "hint.done": "Is screen ke saare hints yehi hain. Faisla aap ka hai.",
  "hint.who": "Ustad yahan hain",
  "hint.private": "Aaram se karein. Hint lena bilkul theek hai.",
  "hint.ask": "Ustad se sawal poochein",
  "hint.askPlaceholder": "Apna sawal yahan likhein",
  "hint.askSend": "Poochein",
  "hint.askNote": "Ustad samjhate hain. Faisla aap karti hain.",

  "intro.you": "Aaj aap Amma hain. Ustad aap ke saath hain agar hint chahiye, aur yahan kuch bhi aap ke asli paison ya account ko nahi chhu sakta.",
  "intro.time": "Taqreeban 3 minute",
  "intro.start": "Practice phone kholein",
  "intro.starting": "Khul raha hai...",
  "intro.confidence": "Aise messages ke baare mein aap kitni pur-aitmaad hain?",
  "intro.back": "Practice list par wapis",

  "outcome.safe": "Mehfooz",
  "outcome.close_call": "Bal bal bachay",
  "outcome.affected": "Practice account mutasir hua",
  "outcome.neutral": "Madad mil gayi",
  "outcome.q.what": "Kya hua?",
  "outcome.q.why": "Aisa kyun hua?",
  "outcome.q.should": "Kya hona chahiye tha?",
  "outcome.q.different": "Aap agli dafa kya kar sakti hain?",
  "outcome.replay": "Apne faisle dobara dekhein",
  "outcome.recovery": "Seekhein ab kya karna hai",
  "outcome.mastery": "Naya wala khud try karein",
  "outcome.skills": "Meri salahiyat dekhein",
  "outcome.again": "Dobara khelein",
  "outcome.compare": "Dono koshishein mila kar dekhein",
  "outcome.moved": "Aap ki salahiyat badli",
  "outcome.passed": "Aap ne khud pehchan liya",
  "outcome.notYet": "Abhi nahi. Dobara koshish kar sakti hain",
  "outcome.afterConfidence": "Ab aap kitni pur-aitmaad hain?",
  "outcome.thanks": "Mehfooz ho gaya. Shukriya.",

  "catalogue.title": "Rozmarra ke digital halaat ki practice karein",
  "catalogue.body": "Practice phone ke andar chhoti kahaniyan. Har qadam par aap faisla karti hain, dekhti hain kya hota hai, aur seekhti hain aage kya karna hai.",
  "catalogue.start": "Practice shuru karein",
  "catalogue.soon": "Baad mein aayega",
  "catalogue.loadError": "Practice phone connect nahi ho saka. Server check karein, phir page refresh karein.",
  "catalogue.mastery": "Naya mauqa, koi hint nahi",

  "footer.tag": "Seekhein. Ghalti karein. Sambhlein. Mahir banein.",
};

export function translate(key: I18nKey, lang: LangKey): string {
  return (lang === "ur-Latn" ? urLatn[key] : undefined) ?? en[key];
}

/** Hook returning t(key) bound to the learner's current language. */
export function useT() {
  const lang = useA11y((s) => s.lang);
  return useCallback((key: I18nKey) => translate(key, lang), [lang]);
}

/** Skill names shown across the app, keyed by the backend taxonomy. */
export const SKILL_NAMES: Record<string, { en: string; "ur-Latn": string }> = {
  scam_detection: { en: "Spotting a scam", "ur-Latn": "Dhoka pehchanna" },
  otp_safety: { en: "Keeping your OTP safe", "ur-Latn": "OTP mehfooz rakhna" },
  reporting: { en: "Reporting and blocking", "ur-Latn": "Report aur block karna" },
  account_recovery: { en: "Recovering after a mistake", "ur-Latn": "Ghalti ke baad sambhalna" },
  online_payments: { en: "Sending money", "ur-Latn": "Paise bhejna" },
  video_calls: { en: "Video calls", "ur-Latn": "Video call" },
};
