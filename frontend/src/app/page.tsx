"use client";

/**
 * Landing page. The brand's arc, enlarged, holds the real practice phone: the
 * first tap here starts the simulation with that choice already made.
 * The phone is the engine's own first screen, never a mock-up.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type UseScrollOptions,
} from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { pick, useA11y } from "@/lib/a11y";
import { useT, type I18nKey } from "@/lib/i18n";
import type { ActionDef, Localized, NodePayload } from "@/lib/types";
import { ListenButton } from "@/components/common/ListenButton";
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
        className="absolute start-[56vw] top-1/2 hidden size-[max(125vh,1000px)] -translate-y-1/2 rounded-full bg-wine md:block"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-10 pt-10 md:min-h-[calc(100svh-61px)] md:grid-cols-[minmax(0,1fr)_380px] md:px-10 md:py-8">
        <div className="md:max-w-[min(540px,calc(56vw-96px))]">
          <h1 className="text-balance text-[clamp(52px,6vw,88px)] leading-[0.98] text-wine">{t("home.title")}</h1>
          <p className="mt-6 text-base text-ink md:text-lg">{t("home.sentence")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/onboarding" className="btn-primary">
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
            className="pointer-events-none absolute -bottom-2 -start-36 hidden h-72 w-auto xl:block"
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

/** The reader's scroll is the story's clock: `scrollYProgress` of the run. */
type StoryProgress = ReturnType<typeof useScroll>["scrollYProgress"];

/**
 * Scroll-driven storytelling (UI_UX §5.12). Each stage owns a quarter of the
 * run, so the four moments arrive one after another as the page moves: the
 * panels slide in horizontally, the mascots rise into place, the practice
 * balance drains during stage two, the rail fills until the fourth stage
 * lands, and she holds up a thumbs-up at the end.
 */
const STAGE = 0.24; // where stage n starts arriving (n = 0..3)
const STAGE_IN = 0.12; // how long an arrival takes
const STORY_END = STAGE * 3 + STAGE_IN; // 0.84: the fourth stage has landed
const DRAIN_IN = STAGE + 0.02; // 0.26: the balance starts falling
const DRAIN_OUT = STAGE * 2 - 0.02; // 0.46: it settles before stage three
const BALANCE_FROM = 50000;
const BALANCE_TO = 1500;

/** Zero when the run reaches the top of the window, one when it leaves it. */
const STORY_OFFSET: NonNullable<UseScrollOptions["offset"]> = ["start start", "end end"];

/** The run pins only where four panels fit on one screen (xl and up). */
function useIsPinned(): boolean {
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const match = window.matchMedia("(min-width: 1280px)");
    const sync = () => setPinned(match.matches);
    sync();
    match.addEventListener("change", sync);
    return () => match.removeEventListener("change", sync);
  }, []);
  return pinned;
}

/** The line that joins the four stages, and how far into the story we are. */
function JourneyRail({ progress, stage }: { progress: StoryProgress; stage: number }) {
  const lang = useA11y((s) => s.lang);
  const fill = useTransform(progress, [0, STORY_END], [0, 1], { clamp: true });
  return (
    <div aria-hidden className="relative mb-5 h-4 w-full">
      <div className="absolute inset-x-[12.5%] top-0 flex h-4 items-center">
        <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-wine-tint">
          <motion.span
            className="absolute inset-0 rounded-full bg-wine"
            style={{ scaleX: fill, transformOrigin: lang === "ur" ? "right" : "left" }}
          />
        </div>
      </div>
      <div className="relative flex h-4">
        {JOURNEY.map((step, index) => (
          <div key={step.clause} className="flex flex-1 items-center justify-center">
            <span
              className={`size-4 rounded-full border-2 transition-colors duration-200 ${
                stage >= index
                  ? index === JOURNEY.length - 1
                    ? "border-safe bg-safe"
                    : "border-wine bg-wine"
                  : "border-wine bg-sand"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Stage two: the practice balance counts down with the scroll. */
function BalanceCountdown({ progress }: { progress: StoryProgress }) {
  const balance = useTransform(progress, [DRAIN_IN, DRAIN_OUT], [BALANCE_FROM, BALANCE_TO], {
    clamp: true,
  });
  const [shown, setShown] = useState(() => Math.round(balance.get() / 100) * 100);
  useMotionValueEvent(balance, "change", (latest) => setShown(Math.round(latest / 100) * 100));
  return <p className="mt-0.5 text-2xl tabular-nums text-ink">PKR {shown.toLocaleString("en-US")}</p>;
}

interface JourneyPanelProps {
  step: JourneyStep;
  index: number;
  progress: StoryProgress;
  pinned: boolean;
  active: boolean;
}

function JourneyPanel({ step, index, progress, pinned, active }: JourneyPanelProps) {
  const t = useT();
  const lang = useA11y((s) => s.lang);
  const reduced = useReducedMotion();
  const start = STAGE * index;

  /* The story runs toward the end of the line, so each stage arrives from the
     side its predecessor left from; reduced motion keeps the fade only. */
  const from = lang === "ur" ? 72 : -72;
  const opacity = useTransform(progress, [start, start + STAGE_IN], [0, 1], { clamp: true });
  const slide = useTransform(progress, [start, start + STAGE_IN + 0.06], [from, 0], { clamp: true });
  const lift = useTransform(progress, [start + 0.05, start + STAGE_IN + 0.08], [44, 0], { clamp: true });
  const thumbsUp = useTransform(progress, [STORY_END, 0.9, 0.97], [1, 1.1, 1], { clamp: true });

  const enter = pinned
    ? { style: reduced ? { opacity } : { opacity, x: slide } }
    : {
        initial: { opacity: 0, x: from },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.25, delay: index * 0.07, ease: "easeOut" as const },
      };

  const mascot = pinned
    ? { style: reduced ? undefined : { y: lift } }
    : {
        initial: { opacity: 0, y: 44 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.3, delay: index * 0.07 + 0.1, ease: "easeOut" as const },
      };

  // The last character already has her thumb up: the pop is the gesture.
  const pose =
    index === JOURNEY.length - 1
      ? pinned
        ? { style: reduced ? undefined : { scale: thumbsUp } }
        : {
            initial: { scale: 1 },
            whileInView: { scale: [1, 1.1, 1] },
            viewport: { once: true, amount: 0.5 },
            transition: { duration: 0.5, delay: index * 0.07 + 0.3, ease: "easeOut" as const },
          }
      : {};

  return (
    <li
      aria-current={active ? "step" : undefined}
      className={`relative flex min-h-[560px] flex-col overflow-hidden p-7 xl:min-h-0 ${step.field} ${step.text}`}
    >
      <motion.div {...enter} className="flex flex-1 flex-col">
        <p className="text-xl leading-tight">{t(step.clause)}</p>
        <p className="mt-3 text-base">{t(step.body)}</p>
        <div data-ui className="mt-6 rounded-[12px] bg-white p-4 text-ink">
          <p className="text-sm text-muted-foreground">{t(step.card.label)}</p>
          {index === 1 ? (
            <BalanceCountdown progress={progress} />
          ) : (
            <p className="mt-0.5 text-2xl tabular-nums text-ink">
              {step.card.value.startsWith("home.") ? t(step.card.value as I18nKey) : step.card.value}
            </p>
          )}
          <p className="mt-0.5 text-sm text-muted-foreground">{t(step.card.note)}</p>
        </div>
        <motion.div {...mascot} className="mt-auto self-end pt-4">
          <motion.span {...pose} className="block">
            <Image src={step.mascot} alt="" width={260} height={480} className="h-44 w-auto" />
          </motion.span>
        </motion.div>
      </motion.div>
    </li>
  );
}

function Journey() {
  const t = useT();
  const pinned = useIsPinned();
  const runway = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: runway, offset: STORY_OFFSET });
  const [stage, setStage] = useState(0);
  const stageSeen = useRef(-1);

  const readStage = useCallback((progress: number) => {
    const next = Math.min(JOURNEY.length - 1, Math.max(0, Math.floor(progress / STAGE)));
    if (next !== stageSeen.current) {
      stageSeen.current = next;
      setStage(next);
    }
  }, []);
  useMotionValueEvent(scrollYProgress, "change", readStage);
  // A restored scroll position may already be past the first stage.
  useEffect(() => readStage(scrollYProgress.get()), [readStage, scrollYProgress]);

  return (
    <section aria-labelledby="journey-title">
      <div ref={runway} className="relative xl:h-[320svh]">
        <div className="xl:sticky xl:top-[61px] xl:flex xl:h-[calc(100svh_-_61px)] xl:flex-col xl:overflow-hidden">
          <h2
            id="journey-title"
            className="mx-auto w-full max-w-6xl px-6 pb-4 pt-20 text-[clamp(32px,3.6vw,52px)] leading-tight text-wine md:px-10 xl:pb-5 xl:pt-8"
          >
            {t("home.journey")}
          </h2>
          <JourneyRail progress={scrollYProgress} stage={stage} />
          <ol className="grid md:grid-cols-2 xl:min-h-0 xl:flex-1 xl:grid-cols-4">
            {JOURNEY.map((step, index) => (
              <JourneyPanel
                key={step.clause}
                step={step}
                index={index}
                progress={scrollYProgress}
                pinned={pinned}
                active={stage === index}
              />
            ))}
          </ol>
        </div>
      </div>
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
          <svg viewBox="0 0 600 110" className="w-full rtl:-scale-x-100" aria-hidden preserveAspectRatio="none">
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
      "ur-Latn": "Aik gehri saans lein. Yeh message aap ko jaldi karwana chahta hai.", "ur": "ایک گہری سانس لیں۔ یہ پیغام آپ سے جلدی کروانا چاہتا ہے۔",
    },
  },
  {
    key: "hint.where",
    hint: {
      en: "Look at the top of the chat. Tap the name to see who really sent it.",
      "ur-Latn": "Chat ke upar dekhein. Naam par tap kar ke dekhein asal mein kis ne bheja.", "ur": "چیٹ کے اوپر دیکھیں۔ نام پر ٹیپ کر کے دیکھیں کہ اصل میں کس نے بھیجا۔",
    },
  },
  {
    key: "hint.explain",
    hint: {
      en: "A real bank never asks for your OTP through a link.",
      "ur-Latn": "Asli bank link par kabhi OTP nahi mangta.", "ur": "اصلی بینک کبھی لنک کے ذریعے OTP نہیں مانگتا۔",
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
          <ListenButton text={hint} />
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
          href="/onboarding"
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
