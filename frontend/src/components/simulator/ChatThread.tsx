"use client";

/**
 * ChatThread: the fictional ChatLine app (UI_UX.md §2.5). Choices live where
 * they would in a real chat: tap the sender's name, tap the link, call someone.
 * All of them share the same quiet styling, so nothing hints at risk (§5.1).
 */

import { ArrowLeft, ChevronRight, Landmark, Paperclip, Phone, Send, Video } from "lucide-react";
import { pick } from "@/lib/a11y";
import type { ChatMessage } from "@/lib/types";
import { FakeStatusBar } from "@/components/simulator/PhoneFrame";
import { allInSlot, asLocalized, inSlot, type ScreenProps } from "@/components/simulator/screen-props";

export function ChatThread({ lang, ui, actions, choose, error }: ScreenProps) {
  const senderName = pick(asLocalized(ui.sender_name), lang);
  const senderNumber = (ui.sender_number as string | undefined) ?? "";
  const messages = (ui.messages as ChatMessage[] | undefined) ?? [];
  const sender = inSlot(actions, "sender");
  const link = inSlot(actions, "link");
  const quick = allInSlot(actions, "quick");

  return (
    <div className="flex h-full flex-col bg-[#E9EEF0]">
      <div className="bg-[#0E7490]">
        <FakeStatusBar dark />
        <div className="flex items-center gap-1 pb-2 pl-2 pr-3 text-white">
          <ArrowLeft aria-hidden className="size-6 shrink-0 opacity-70" />
          <button
            type="button"
            disabled={!sender}
            onClick={() => sender && choose(sender)}
            aria-label={sender ? `${senderName}, ${senderNumber}. ${pick(sender.label, lang)}` : undefined}
            className="tap-spot flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl px-1.5 text-start active:bg-white/10"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Landmark aria-hidden className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base leading-tight text-white">{senderName}</span>
              <span className="block truncate text-xs text-white/85">{senderNumber}</span>
            </span>
            {sender ? <ChevronRight aria-hidden className="size-5 shrink-0 opacity-80" /> : null}
          </button>
          <Phone aria-hidden className="ml-1 size-5 shrink-0 opacity-70" />
          <Video aria-hidden className="ml-2 size-5 shrink-0 opacity-70" />
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        <p className="text-center text-xs text-ink/60" aria-hidden>
          Today
        </p>
        {messages.map((message, index) => (
          <div key={index} className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5">
            <p className="text-sm leading-relaxed text-ink">{pick(message.text, lang)}</p>
            {message.link ? (
              <button
                type="button"
                disabled={!link}
                onClick={() => link && choose(link)}
                aria-label={link ? `${pick(link.label, lang)}: ${message.link}` : undefined}
                className="tap-spot mt-1 -mx-1 block min-h-11 max-w-full break-all rounded-md px-1 text-start text-sm text-[#0E5F8A] underline underline-offset-2 active:bg-[#0E7490]/10"
              >
                {message.link}
              </button>
            ) : null}
            <p className="mt-1 text-right text-xs text-ink/60" aria-hidden>
              1:04 PM
            </p>
          </div>
        ))}
        {error ? (
          <p role="status" className="rounded-xl bg-white px-3 py-2 text-sm text-caution">
            {error.message}
          </p>
        ) : null}
      </div>

      <div className="bg-white px-3 pb-3 pt-2">
        {quick.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => choose(action)}
            className="tap-spot mb-2 flex min-h-12 w-full items-center gap-2 rounded-xl border border-black/15 px-3 text-start text-sm text-ink active:bg-black/5"
          >
            <Phone aria-hidden className="size-4 shrink-0" />
            {pick(action.label, lang)}
          </button>
        ))}
        <div className="flex items-center gap-2 text-ink/60" aria-hidden>
          <Paperclip className="size-5 shrink-0" />
          <span className="min-h-9 flex-1 rounded-full bg-[#E9EEF0] px-3 py-1.5 text-sm">Message</span>
          <Send className="size-5 shrink-0" />
        </div>
      </div>
    </div>
  );
}
