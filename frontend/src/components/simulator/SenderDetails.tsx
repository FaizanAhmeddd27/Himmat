"use client";

/**
 * SenderDetails: the contact-info screen in the fictional ChatLine app. It
 * shows facts, not conclusions, so the learner does the spotting.
 */

import { ArrowLeft, BadgeCheck, CreditCard, Globe, Phone, User } from "lucide-react";
import { pick } from "@/lib/a11y";
import { translate } from "@/lib/i18n";
import type { Localized } from "@/lib/types";
import { FakeStatusBar } from "@/components/simulator/PhoneFrame";
import { allInSlot, asLocalized, inSlot, type ScreenProps } from "@/components/simulator/screen-props";

const ROW_ICONS = { phone: Phone, badge: BadgeCheck, link: Globe, card: CreditCard } as const;

interface Row {
  icon: keyof typeof ROW_ICONS;
  label: Localized;
  value: Localized;
}

export function SenderDetails({ lang, ui, actions, choose }: ScreenProps) {
  const rows = (ui.rows as Row[] | undefined) ?? [];
  const back = inSlot(actions, "back");
  const primary = allInSlot(actions, "primary");

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="bg-[#0E7490]">
        <FakeStatusBar dark />
        <div className="flex items-center gap-1 pb-1 ps-1 pe-3 text-white">
          <button
            type="button"
            disabled={!back}
            onClick={() => back && choose(back)}
            aria-label={back ? pick(back.label, lang) : undefined}
            className="tap-spot flex size-12 shrink-0 items-center justify-center rounded-xl active:bg-white/10"
          >
            <ArrowLeft aria-hidden className="size-6 rtl:-scale-x-100" />
          </button>
          <span className="text-base text-white">{translate("phone.contact", lang)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-black/10 px-4 py-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E9EEF0] text-ink/70">
            <User aria-hidden className="size-5" />
          </span>
          <p className="text-base text-ink">{pick(asLocalized(ui.sender_name), lang)}</p>
        </div>
        <ul>
          {rows.map((row, index) => {
            const Icon = ROW_ICONS[row.icon] ?? Globe;
            return (
              <li key={index} className="flex items-start gap-3 border-b border-black/10 px-4 py-1.5">
                <Icon aria-hidden className="mt-1 size-5 shrink-0 text-[#0E7490]" />
                <span className="min-w-0">
                  <span className="block text-xs leading-tight text-ink/70">{pick(row.label, lang)}</span>
                  <span dir="auto" className="block break-words text-start text-sm leading-snug text-ink">{pick(row.value, lang)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-2 border-t border-black/10 px-3 py-3">
        {primary.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => choose(action)}
            className="tap-spot flex min-h-12 w-full items-center justify-center rounded-xl border border-[#0E7490] px-3 text-center text-sm text-[#0B5F77] active:bg-[#0E7490]/10"
          >
            {pick(action.label, lang)}
          </button>
        ))}
      </div>
    </div>
  );
}
