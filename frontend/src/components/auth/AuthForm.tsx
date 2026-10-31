"use client";

/**
 * Sign in and create account (SRS FR-1.1). An account keeps the guest's progress:
 * the learner id is stored with the account and restored on any device.
 * Without Supabase keys the page says so and offers guest mode.
 */

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { useT } from "@/lib/i18n";
import { getLearnerId, setLearnerId } from "@/lib/learner";
import { getSupabase } from "@/lib/supabase";

const field =
  "mt-1 min-h-14 w-full rounded-[12px] border-2 border-border-strong bg-surface px-4 text-base text-ink focus:border-wine";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const t = useT();
  const router = useRouter();
  const supabase = getSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const isLogin = mode === "login";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      if (isLogin) {
        const { data, error: failure } = await supabase.auth.signInWithPassword({ email, password });
        if (failure) throw failure;
        const saved = data.user?.user_metadata?.himmat_learner;
        if (typeof saved === "string") setLearnerId(saved);
        router.push("/dashboard");
      } else {
        const { data, error: failure } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { himmat_learner: getLearnerId() } },
        });
        if (failure) throw failure;
        if (data.session) router.push("/onboarding");
        else setCheckEmail(true);
      }
    } catch {
      setError(t(isLogin ? "auth.loginFailed" : "auth.signupFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto w-full max-w-xl">
          <h1 className="text-2xl text-on-wine sm:text-3xl">{t(isLogin ? "auth.loginTitle" : "auth.signupTitle")}</h1>
          <p className="mt-2 text-lg text-on-wine-muted">{t("auth.body")}</p>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-xl">
          {!supabase ? (
            <p role="status" className="flex items-start gap-2 text-lg text-ink">
              <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0 text-caution" />
              {t("auth.notConfigured")}
            </p>
          ) : checkEmail ? (
            <p role="status" className="text-lg text-ink">
              {t("auth.checkEmail")}
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="auth-email" className="block text-base text-ink">
                  {t("auth.email")}
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="block text-base text-ink">
                  {t("auth.password")}
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  aria-describedby="auth-password-note"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={field}
                />
                <p id="auth-password-note" className="mt-1 text-base text-muted-foreground">
                  {t("auth.passwordNote")}
                </p>
              </div>
              {error ? (
                <p role="alert" className="flex items-start gap-2 text-base text-caution">
                  <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0" />
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
                {t(isLogin ? "auth.login" : "auth.signup")}
              </button>
              <p className="text-base text-ink">
                {t(isLogin ? "auth.noAccount" : "auth.haveAccount")}{" "}
                <Link href={isLogin ? "/signup" : "/login"} className="text-wine underline underline-offset-4">
                  {t(isLogin ? "auth.signup" : "auth.login")}
                </Link>
              </p>
            </form>
          )}
          <Link href="/dashboard" className="btn-secondary mt-6 w-full">
            {t("auth.guest")}
          </Link>
        </div>
      </section>
    </main>
  );
}
