"use client";

/**
 * OfficialCall and BankAlert: the phone's own screens. A call to the number on
 * the bank card, and the alert that shows what a shared OTP cost.
 */

import { motion } from "framer-motion";
import { Landmark, PhoneOff, ShieldCheck } from "lucide-react";
import { pick } from "@/lib/a11y";
import { translate } from "@/lib/i18n";
import type { Localized } from "@/lib/types";
import { FakeStatusBar } from "@/components/simulator/PhoneFrame";
import { asLocalized, inSlot, type ScreenProps } from "@/components/simulator/screen-props";

export function OfficialCall({ lang, ui, actions, choose }: ScreenProps) {
  const lines = (ui.lines as Localized[] | undefined) ?? [];
  const primary = inSlot(actions, "primary");

  return (
    <div className="flex h-full flex-col bg-[#111827] text-white">
      <FakeStatusBar dark />
      <div className="flex flex-col items-center gap-1 px-4 pb-4 pt-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-white/10">
          <Landmark aria-hidden className="size-8" />
        </span>
        <p className="mt-2 text-center text-lg text-white">{pick(asLocalized(ui.caller), lang)}</p>
        <p dir="ltr" className="text-sm text-white/80">{(ui.number as string | undefined) ?? ""}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4">
        {lines.map((line, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.5, duration: 0.2 }}
            className="rounded-2xl rounded-ss-sm bg-white/10 px-3.5 py-2.5 text-sm leading-relaxed text-white"
          >
            {pick(line, lang)}
          </motion.p>
        ))}
      </div>
      {primary ? (
        <div className="p-3">
          <button
            type="button"
            onClick={() => choose(primary)}
            className="tap-spot flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-center text-sm text-[#111827] active:bg-white/80"
          >
            <PhoneOff aria-hidden className="size-4 shrink-0" />
            {pick(primary.label, lang)}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function BankAlert({ lang, ui, actions, choose }: ScreenProps) {
  const primary = inSlot(actions, "primary");

  return (
    <div className="flex h-full flex-col bg-[#1F2937] text-white">
      <FakeStatusBar dark />
      <p dir="ltr" className="mt-10 text-center text-5xl tabular-nums text-white">1:05</p>
      <p className="mt-1 text-center text-sm text-white/80" aria-hidden>
        {translate("phone.today", lang)}
      </p>
      <motion.div
        role="alert"
        initial={{ y: -36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
        className="mx-3 mt-8 rounded-2xl bg-white p-4 text-ink"
      >
        <p className="flex items-center gap-2 text-sm text-[#1E3A8A]">
          <Landmark aria-hidden className="size-5 shrink-0" />
          {pick(asLocalized(ui.alert_from), lang)}
        </p>
        <p className="mt-2 text-base leading-snug text-ink">{pick(asLocalized(ui.alert_text), lang)}</p>
      </motion.div>
      <p className="mx-4 mt-5 flex items-start gap-2 text-sm text-white/90">
        <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
        {pick(asLocalized(ui.note), lang)}
      </p>
      <div className="mt-auto p-3">
        {primary ? (
          <button
            type="button"
            onClick={() => choose(primary)}
            className="tap-spot flex min-h-12 w-full items-center justify-center rounded-full bg-white px-4 text-base text-[#111827] active:bg-white/80"
          >
            {pick(primary.label, lang)}
          </button>
        ) : null}
      </div>
    </div>
  );
}
