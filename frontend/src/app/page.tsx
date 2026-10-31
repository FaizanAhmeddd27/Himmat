"use client";

/**
 * Landing page. The brand's arc, enlarged, holds the real practice phone: the
 * first tap here starts the simulation with that choice already made.
 * The phone is the engine's own first screen, never a mock-up.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { pick, speak, useA11y } from "@/lib/a11y";
import { useT, type I18nKey } from "@/lib/i18n";
import type { ActionDef, Localized, NodePayload } from "@/lib/types";
import { ThemedLoader } from "@/components/common/ThemedLoader";
import { ChatThread } from "@/components/simulator/ChatThread";
import { PhoneFrame } from "@/components/simulator/PhoneFrame";

const SCENARIO = "fake_bank_message";

const rise = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.35, ease: "easeOut" },
} as const;

/* ---------- Hero: the phone is the first thing you can touch ---------- */

function HeroPhone() {
  const lang = useA11y((s) => s.lang);
  const router = useRouter();
  const [node, setNode] = useState<NodePayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .previewScenario(SCENARIO)
      .then(setNode)
      .catch(() => setFailed(true));
  }, []);

  const choose = (action: ActionDef) => {
    router.push(`/simulations/${SCENARIO}?play=${action.id}`);
  };

  return (
    <PhoneFrame>
      {node?.ui ? (
        <ChatThread lang={lang} ui={node.ui.props} actions={node.actions} choose={choose} />
      ) : (
        <div className="flex h-full items-center justify-center bg-white px-6">
          {failed ? null : <ThemedLoader size="sm" />}
        </div>
      )}
    </PhoneFrame>
  );
}

function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      {/* The arc starts past the text column, so it can never cover the headline. */}
      <span
        aria-hidden
        className="absolute left-[56vw] top-1/2 hidden size-[max(125vh,1000px)] -translate-y-1/2 rounded-full bg-wine md:block"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-10 pt-10 md:min-h-[calc(100svh-61px)] md:grid-cols-[minmax(0,1fr)_380px] md:px-10 md:py-8">
        <div className="md:max-w-[min(540px,calc(56vw-96px))]">
          <h1 className="text-balance text-[clamp(52px,6vw,88px)] leading-[0.98] text-wine">{t("home.title")}</h1>
          <p className="mt-6 text-base text-ink md:text-lg">{t("home.sentence")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={`/simulations/${SCENARIO}`} className="btn-primary">
              {t("home.start")}
            </Link>
            <p className="flex items-center gap-2 text-base text-ink">
              <ShieldCheck aria-hidden className="size-5 shrink-0 text-safe" />
              {t("banner.practice")}
            </p>
          </div>
        </div>
        <div className="relative">
          {/* On a phone the arc rises from behind the practice phone. */}
          <span
            aria-hidden
            className="absolute -top-8 left-1/2 size-[190vw] -translate-x-1/2 rounded-full bg-wine md:hidden"
          />
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <HeroPhone />
          </motion.div>
          <Image
            src="/himmat3.png"
            alt=""
            width={310}
            height={640}
            priority
            className="pointer-events-none absolute -bottom-2 -left-36 hidden h-72 w-auto xl:block"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- The journey: one practice account, four moments ---------- */

interface JourneyStep {
  clause: I18nKey;
  body: I18nKey;
  field: string;
  text: string;
  mascot: string;
  card: { label: I18nKey; value: I18nKey | string; note: I18nKey };
}

const JOURNEY: JourneyStep[] = [
  {
    clause: "home.j1",
    body: "home.j1b",
    field: "bg-surface",
    text: "text-ink",
    mascot: "/himmat2.png",
    card: { label: "home.balance", value: "PKR 50,000", note: "home.j1c" },
  },
  {
    clause: "home.j2",
    body: "home.j2b",
    field: "bg-wine-tint",
    text: "text-ink",
    mascot: "/himmat6.png",
    card: { label: "home.balance", value: "PKR 1,500", note: "home.j2c" },
  },
  {
    clause: "home.j3",
    body: "home.j3b",
    field: "bg-wine",
    text: "text-on-wine",
    mascot: "/himmat1.png",
    card: { label: "home.next", value: "home.j3v", note: "home.j3c" },
  },
  {
    clause: "home.j4",
    body: "home.j4b",
    field: "bg-ink",
    text: "text-sand",
    mascot: "/himmat4.png",
    card: { label: "home.hints", value: "0", note: "home.j4c" },
  },
];

function Journey() {
  const t = useT();
  return (
    <section aria-labelledby="journey-title">
      <h2 id="journey-title" className="mx-auto w-full max-w-6xl px-6 pb-8 pt-20 text-[clamp(32px,3.6vw,52px)] leading-tight text-wine md:px-10">
        {t("home.journey")}
      </h2>
      <ol className="grid md:grid-cols-2 xl:grid-cols-4">
        {JOURNEY.map((step, index) => (
          <li key={step.clause} className={`flex min-h-[560px] flex-col p-7 ${step.field} ${step.text}`}>
            <motion.div {...rise} transition={{ ...rise.transition, delay: index * 0.07 }} className="flex flex-1 flex-col">
              <p className="text-xl leading-tight">{t(step.clause)}</p>
              <p className="mt-3 text-base">{t(step.body)}</p>
              <div data-ui className="mt-6 rounded-[12px] bg-white p-4 text-ink">
                <p className="text-sm text-muted-foreground">{t(step.card.label)}</p>
                <p className="mt-0.5 text-2xl tabular-nums text-ink">
                  {step.card.value.startsWith("home.") ? t(step.card.value as I18nKey) : step.card.value}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t(step.card.note)}</p>
              </div>
              <Image src={step.mascot} alt="" width={260} height={480} className="mt-auto h-44 w-auto self-end pt-4" />
            </motion.div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Rewind: the signature feature in one comparison ---------- */

function Rewind() {
  const t = useT();
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24 md:px-10" aria-labelledby="rewind-title">
      <div className="grid items-center gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <motion.div {...rise}>
          <h2 id="rewind-title" className="text-[clamp(32px,3.6vw,52px)] leading-tight text-wine">
            {t("home.rewind")}
          </h2>
          <p className="mt-4 text-base text-ink md:text-lg">{t("home.rewindBody")}</p>
        </motion.div>

        <motion.div {...rise} data-ui className="relative">
          <svg viewBox="0 0 600 110" className="w-full" aria-hidden preserveAspectRatio="none">
            <path d="M0 8 H150 C300 8 300 8 600 8" fill="none" stroke="var(--wine)" strokeWidth="3" />
            <motion.path
              d="M150 8 C300 8 310 100 600 100"
              fill="none"
              stroke="var(--safe)"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, ease: "easeInOut", delay: 0.25 }}
            />
            <circle cx="150" cy="8" r="7" fill="var(--wine)" />
          </svg>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-lg text-muted-foreground">{t("home.choiceA")}</p>
              <p className="text-[clamp(36px,4vw,56px)] leading-none tabular-nums text-wine">PKR 1,500</p>
            </div>
            <div>
              <p className="text-lg text-muted-foreground">{t("home.choiceB")}</p>
              <p className="text-[clamp(36px,4vw,56px)] leading-none tabular-nums text-safe">PKR 50,000</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Ustad: help that never takes over ---------- */

const USTAD_HINTS: { key: I18nKey; hint: Localized }[] = [
  {
    key: "hint.nudge",
    hint: {
      en: "Take a breath. This message wants you to hurry.",
      "ur-Latn": "Aik gehri saans lein. Yeh message aap ko jaldi karwana chahta hai.",
    },
  },
  {
    key: "hint.where",
    hint: {
      en: "Look at the top of the chat. Tap the name to see who really sent it.",
      "ur-Latn": "Chat ke upar dekhein. Naam par tap kar ke dekhein asal mein kis ne bheja.",
    },
  },
  {
    key: "hint.explain",
    hint: {
      en: "A real bank never asks for your OTP through a link.",
      "ur-Latn": "Asli bank link par kabhi OTP nahi mangta.",
    },
  },
];

function Ustad() {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const [active, setActive] = useState(0);
  const hint = pick(USTAD_HINTS[active].hint, lang);

  return (
    <section className="bg-surface" aria-labelledby="ustad-title">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:px-10">
        <div className="relative mx-auto aspect-square w-full max-w-[min(78vw,430px)] rounded-full bg-wine">
          <Image src="/himmat1.png" alt="Ustad, the HIMMAT guide" width={345} height={640} className="absolute bottom-0 left-1/2 h-[112%] w-auto max-w-none -translate-x-1/2" />
        </div>
        <div>
          <h2 id="ustad-title" className="text-[clamp(32px,3.6vw,52px)] leading-tight text-wine">
            {t("home.ustad")}
          </h2>
          <p className="mt-4 text-base text-ink md:text-lg">{t("home.ustadBody")}</p>
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={t("hint.open")}>
            {USTAD_HINTS.map((item, index) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={active === index}
                onClick={() => setActive(index)}
                className={`min-h-12 rounded-[12px] border-2 px-4 text-base transition-colors ${
                  active === index ? "border-wine bg-wine text-on-wine" : "border-wine text-wine hover:bg-wine-tint"
                }`}
              >
                {t(item.key)}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="mt-4 min-h-20 text-base text-ink md:text-lg">
            {hint}
          </p>
          <button
            type="button"
            onClick={() => speak(hint)}
            className="inline-flex min-h-12 items-center text-base text-wine underline underline-offset-4"
          >
            {t("common.listen")}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Family, then the close ---------- */

function Family() {
  const t = useT();
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20 md:px-10" aria-labelledby="family-title">
      <div className="grid items-end gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <motion.div {...rise}>
          <h2 id="family-title" className="text-[clamp(32px,3.6vw,52px)] leading-tight text-wine">
            {t("home.family")}
          </h2>
          <p className="mt-4 max-w-xl text-base text-ink md:text-lg">{t("home.familyBody")}</p>
          <Link href="/family" className="btn-secondary mt-6">
            {t("home.familyLink")}
          </Link>
        </motion.div>
        <div className="flex items-end justify-center gap-2">
          <Image src="/himmat5.png" alt="" width={248} height={640} className="h-64 w-auto" />
          <Image src="/himmat7.png" alt="" width={542} height={640} className="h-64 w-auto" />
        </div>
      </div>
    </section>
  );
}

function Close() {
  const t = useT();
  return (
    <section className="hero-band px-6 py-16 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-balance text-[clamp(32px,4vw,60px)] leading-tight text-on-wine">{t("home.close")}</h2>
          <p className="mt-4 text-base text-on-wine-muted md:text-lg">{t("footer.tag")}</p>
        </div>
        <Link
          href={`/simulations/${SCENARIO}`}
          className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-[12px] bg-sand px-8 text-lg text-wine transition-colors hover:bg-surface"
        >
          {t("home.start")}
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      <Hero />
      <Journey />
      <Rewind />
      <Ustad />
      <Family />
      <Close />
    </main>
  );
}
