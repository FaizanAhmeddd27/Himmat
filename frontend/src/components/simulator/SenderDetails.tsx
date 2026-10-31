"use client";

/**
 * SenderDetails — "who sent this?" contact-info screen, still inside the
 * fake ChatLine app (teal header). Lists the scam signs as info rows.
 */

import { ArrowLeft, Globe, Phone, ShieldAlert, Ban, ChevronRight } from "lucide-react";
import { FakeStatusBar } from "@/components/simulator/PhoneFrame";
import { pickText, type ScreenProps } from "@/components/simulator/screen-props";
import type { Localized } from "@/lib/types";

const ROW_ICONS = [Phone, Globe, ShieldAlert];

export function SenderDetails({ lang, ui, actions, choose }: ScreenProps) {
  const points = ((ui.points as Localized[] | undefined) ?? []).map((p, i) => ({
    icon: ROW_ICONS[i % ROW_ICONS.length],
    text: pickText(p, lang),
  }));

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="bg-[#0E7490]">
        <FakeStatusBar dark />
        <div className="flex items-center gap-3 px-3 pb-3 text-white">
          <ArrowLeft aria-hidden className="size-6" />
          <span className="text-base text-white">Contact info</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-4 py-4">
        <p className="text-sm text-ink/60">What we can see about this sender</p>
        <ul className="mt-3 divide-y divide-black/10 rounded-xl border border-black/10">
          {points.map((point, index) => (
            <li key={index} className="flex items-start gap-3 px-3 py-3">
              <point.icon aria-hidden className="mt-0.5 size-5 shrink-0 text-ink/70" />
              <span className="text-sm leading-relaxed text-ink/90">{point.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-black/5 bg-white px-3 py-3">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => choose(action)}
            className="mb-2 inline-flex min-h-12 w-full items-center justify-start gap-2 rounded-xl border border-black/15 bg-white px-4 text-sm text-ink/85 active:scale-[0.98]"
          >
            <Ban aria-hidden className="size-4" />
            <span className="flex-1 text-start">{pickText(action.label, lang)}</span>
            <ChevronRight aria-hidden className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
