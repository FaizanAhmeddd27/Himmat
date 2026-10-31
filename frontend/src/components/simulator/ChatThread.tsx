"use client";

/**
 * ChatThread — the fake ChatLine app screen (UI_UX.md §2.5).
 * Teal-blue #0E7490 header, white bubbles on a light-grey chat background.
 * Choices render as plain neutral buttons inside the chat input area.
 */

import { ArrowLeft, Paperclip, Phone, Send, Video } from "lucide-react";
import { FakeStatusBar } from "@/components/simulator/PhoneFrame";
import { chatMessagesOf, pickText, senderNameOf, type ScreenProps } from "@/components/simulator/screen-props";

export function ChatThread({ lang, ui, actions, choose, error }: ScreenProps) {
  const senderName = senderNameOf(ui, lang);
  const senderNumber = (ui.sender_number as string | undefined) ?? "";
  const messages = chatMessagesOf(ui, lang);

  return (
    <div className="flex h-full flex-col bg-[#ECE5DD]">
      <div className="bg-[#0E7490]">
        <FakeStatusBar dark />
        <div className="flex items-center gap-3 px-3 pb-3 text-white">
          <ArrowLeft aria-hidden className="size-6" />
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg"
          >
            🏦
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base text-white">{senderName}</span>
            <span className="block truncate text-xs text-white/80">{senderNumber}</span>
          </span>
          <Phone aria-hidden className="size-6" />
          <Video aria-hidden className="size-6" />
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        <p className="text-center text-xs text-ink/50" aria-hidden>
          Today
        </p>
        {messages.map((message, index) => (
          <div key={index} className="max-w-[85%] rounded-xl rounded-bl-sm bg-white px-3 py-2 shadow-sm">
            <p className="text-sm leading-relaxed text-ink/90">{pickText(message.text, lang)}</p>
            <p className="mt-1 text-right text-[10px] text-ink/40">1:04 PM</p>
          </div>
        ))}
      </div>

      {/* choices — identical neutral styling, no risk hints (UI_UX §5.1) */}
      <div className="border-t border-black/5 bg-white px-3 py-3">
        {error ? (
          <p role="status" className="mb-2 flex items-start gap-1.5 text-sm text-caution">
            <Send aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>{error.message}</span>
          </p>
        ) : null}
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => choose(action)}
            className="mb-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-4 text-sm text-ink/85 active:scale-[0.98]"
          >
            <Paperclip aria-hidden className="size-4" />
            {pickText(action.label, lang)}
          </button>
        ))}
        <div className="flex items-center gap-2 text-ink/40">
          <span className="min-h-9 flex-1 rounded-full bg-[#F5EBD0]/60 px-3 py-2 text-xs">Message</span>
          <Send aria-hidden className="size-5" />
        </div>
      </div>
    </div>
  );
}
