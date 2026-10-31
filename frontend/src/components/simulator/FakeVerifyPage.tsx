"use client";

/**
 * FakeVerifyPage — fake browser screen of the scam page (UI_UX §2.5).
 * The learner types the practice OTP right on the page (like the real scam
 * would ask) and presses Confirm — that fires the enter_otp action.
 * The practice code is shown on the page itself so typing real-looking data
 * is never needed.
 */

import { useState } from "react";
import { ArrowLeft, Lock, RotateCcw, TriangleAlert, X } from "lucide-react";
import { FakeStatusBar } from "@/components/simulator/PhoneFrame";
import { pickText, type ScreenProps } from "@/components/simulator/screen-props";
import type { Localized } from "@/lib/types";

export function FakeVerifyPage({ lang, ui, actions, choose, error }: ScreenProps) {
  const pageTitle = pickText((ui.page_title as Localized | undefined) ?? null, lang);
  const pageBody = pickText((ui.page_body as Localized | undefined) ?? null, lang);
  const pageUrl = (ui.page_url as string | undefined) ?? "";
  const practiceOtp = (ui.practice_otp as string | undefined) ?? "";

  const enterOtp = actions.find((a) => a.needs_input === "otp");
  const closeAction = actions.find((a) => a.needs_input == null);

  const [value, setValue] = useState("");

  return (
    <div className="flex h-full flex-col bg-white">
      <FakeStatusBar />
      {/* fake browser chrome */}
      <div className="flex items-center gap-2 border-b border-black/10 px-3 py-2">
        <ArrowLeft aria-hidden className="size-5 text-ink/50" />
        <span className="min-w-0 flex-1 truncate rounded-full bg-black/5 px-3 py-1.5 text-xs text-ink/70">
          <Lock aria-hidden className="mr-1 inline size-3" />
          {pageUrl}
        </span>
        <RotateCcw aria-hidden className="size-5 text-ink/50" />
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-6 py-8 text-center">
        <span
          aria-hidden
          className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#0E7490]"
        >
          <Lock className="size-7 text-white" />
        </span>
        <p className="mt-4 text-lg text-ink">{pageTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">{pageBody}</p>

        <label
          htmlFor="practice-otp"
          className="mt-6 block text-start text-sm font-normal text-ink/80"
        >
          Practice code (shown for the exercise):
        </label>
        <input
          id="practice-otp"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={practiceOtp.split("").join(" ")}
          className="otp-digits mt-2 min-h-12 w-full rounded-[12px] border-2 border-[#0E7490]/50 bg-white px-4 text-lg text-ink focus:border-[#0E7490] focus:outline-none"
        />
        <p className="mt-2 text-start text-xs text-ink/50">
          Example practice code: {practiceOtp}.
        </p>

        {error ? (
          <p role="status" className="mt-3 flex items-start gap-1.5 text-start text-sm text-caution">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>{error.message}</span>
          </p>
        ) : null}
      </div>

      <div className="border-t border-black/5 bg-white px-3 py-3">
        {enterOtp ? (
          <button
            type="button"
            onClick={() => choose(enterOtp, value)}
            className="mb-2 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#0E7490] px-4 text-base text-white active:scale-[0.98]"
          >
            {pickText(enterOtp.label, lang)}
          </button>
        ) : null}
        {closeAction ? (
          <button
            type="button"
            onClick={() => choose(closeAction)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-4 text-base text-ink/85 active:scale-[0.98]"
          >
            <X aria-hidden className="size-4" />
            {pickText(closeAction.label, lang)}
          </button>
        ) : null}
      </div>
    </div>
  );
}
