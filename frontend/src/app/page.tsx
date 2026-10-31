import { ShieldCheck } from "lucide-react";

/**
 * HIMMAT landing page — split-band hero pattern (docs/UI_UX.md §4.2).
 * Wine band (brand) followed by a sand area. One primary action.
 */
export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Wine band */}
      <section className="hero-band w-full px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto w-full max-w-5xl">
          <p className="hero-label text-sm text-on-wine-muted">
            Digital Life Simulator
          </p>
          <h1 className="mt-4 text-3xl text-on-wine sm:text-3xl">HIMMAT</h1>
          <p className="mt-6 max-w-xl text-xl text-on-wine sm:text-2xl">
            Learn it. Break it. Recover from it. Master it.
          </p>
          <p className="mt-4 max-w-2xl text-lg text-on-wine-muted">
            A safe practice world for everyday digital life. You practise
            real situations with fictional apps, and no mistake can ever touch
            your real money or accounts.
          </p>
        </div>
      </section>

      {/* Sand area */}
      <section className="w-full px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
          <div>
            <h2 className="hero-label text-2xl text-wine sm:text-2xl">
              What would you do?
            </h2>
            <p className="mt-4 max-w-xl text-xl text-ink">
              Suppose a message says your account will be blocked today
              unless you share a code. What do you do first?
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              In HIMMAT you can try it in a practice world, see what happens,
              and learn how to recover — calmly, in your own language.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/simulations"
              className="inline-flex h-14 min-w-48 items-center justify-center gap-2 rounded-[12px] bg-wine px-8 text-lg text-on-wine transition-colors hover:bg-wine-dark"
            >
              Start practising
            </a>
            <p className="inline-flex items-center gap-2 text-lg text-text-muted">
              <ShieldCheck aria-hidden className="size-6" />
              Practice world. Nothing here is real.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
