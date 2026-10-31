"use client";

/**
 * FakeVerifyPage: the scam page in a fake browser (UI_UX §2.5). The practice OTP
 * arrives as a phone notification, the same way a real one does, carrying the
 * real warning that scammers count on people missing.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, MessageSquareText, RotateCcw, TriangleAlert } from "lucide-react";
import { pick } from "@/lib/a11y";
import { FakeStatusBar } from "@/components/simulator/PhoneFrame";
import { asLocalized, inSlot, type ScreenProps } from "@/components/simulator/screen-props";

export function FakeVerifyPage({ lang, ui, actions, choose, error }: ScreenProps) {
  const pageUrl = (ui.page_url as string | undefined) ?? "";
  const enterOtp = actions.find((action) => action.needs_input);
  const close = inSlot(actions, "close");
  const [value, setValue] = useState("");

  return (
    <div className="relative flex h-full flex-col bg-white">
      <FakeStatusBar />
      <div className="flex items-center gap-2 border-b border-black/10 px-3 py-2">
        <ArrowLeft aria-hidden className="size-5 shrink-0 text-ink/60" />
        <span className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-black/5 px-3 py-1.5 text-xs text-ink">
          <Lock aria-hidden className="size-3 shrink-0" />
          <span className="truncate">{pageUrl}</span>
        </span>
        <RotateCcw aria-hidden className="size-5 shrink-0 text-ink/60" />
      </div>

      <motion.div
        role="status"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.25, ease: "easeOut" }}
        className="mx-2 mt-2 flex gap-2 rounded-2xl bg-[#1F2937] px-3 py-2.5 text-white"
      >
        <MessageSquareText aria-hidden className="mt-0.5 size-5 shrink-0" />
        <p className="text-sm leading-snug">{pick(asLocalized(ui.otp_sms), lang)}</p>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-5 py-4 text-center">
        <span aria-hidden className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#1E3A8A]">
          <Lock className="size-5 text-white" />
        </span>
        <p className="mt-2 text-lg text-[#1E3A8A]">{pick(asLocalized(ui.page_title), lang)}</p>
        <p className="mt-1 text-sm leading-snug text-ink">{pick(asLocalized(ui.page_body), lang)}</p>

        <label htmlFor="practice-otp" className="mt-3 block text-start text-sm text-ink">
          {pick(asLocalized(ui.field_label), lang)}
        </label>
        <input
          id="practice-otp"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="otp-digits mt-1 min-h-12 w-full rounded-[10px] border-2 border-[#1E3A8A]/60 bg-white px-3 text-center text-lg text-ink focus:border-[#1E3A8A]"
        />
        {error ? (
          <p role="alert" className="mt-2 flex items-start gap-1.5 text-start text-sm text-caution">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>{error.message}</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-2 border-t border-black/10 px-3 py-3">
        {enterOtp ? (
          <button
            type="button"
            onClick={() => choose(enterOtp, value)}
            className="tap-spot flex min-h-12 w-full items-center justify-center rounded-[10px] bg-[#1E3A8A] px-4 text-base text-white active:bg-[#172E6E]"
          >
            {pick(enterOtp.label, lang)}
          </button>
        ) : null}
        {close ? (
          <button
            type="button"
            onClick={() => choose(close)}
            className="tap-spot flex min-h-12 w-full items-center justify-center rounded-[10px] border border-black/25 px-4 text-base text-ink active:bg-black/5"
          >
            {pick(close.label, lang)}
          </button>
        ) : null}
      </div>
    </div>
  );
}
