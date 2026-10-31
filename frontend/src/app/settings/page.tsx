"use client";

/**
 * Settings (SRS FR-1.3, 1.4, 1.6): how the app looks and reads, plus control over
 * your own data. Deleting asks once more, because it cannot be undone.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { api, toApiError } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { startFreshLearner } from "@/lib/learner";
import { getSupabase } from "@/lib/supabase";
import type { ApiErrorInfo } from "@/lib/types";
import { SettingsControls } from "@/components/layout/SettingsControls";

export default function SettingsPage() {
  const t = useT();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  useEffect(() => {
    getSupabase()
      ?.auth.getSession()
      .then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  const deleteEverything = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.deleteAccount();
      await getSupabase()?.auth.signOut();
      startFreshLearner();
      setSignedIn(false);
      setConfirming(false);
      setDone(true);
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
    startFreshLearner();
    router.push("/");
  };

  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="text-2xl text-on-wine sm:text-3xl">{t("settings.title")}</h1>
          <p className="mt-2 text-lg text-on-wine-muted">{t("settings.body")}</p>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <SettingsControls />

          <div className="mt-10 border-t border-border pt-8">
            <h2 className="text-xl text-wine">{t("settings.account")}</h2>
            {signedIn ? (
              <button type="button" onClick={signOut} className="btn-secondary mt-3">
                {t("settings.signOut")}
              </button>
            ) : (
              <>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link href="/signup" className="btn-secondary">
                    {t("auth.signup")}
                  </Link>
                  <Link href="/login" className="btn-secondary">
                    {t("auth.login")}
                  </Link>
                </div>
              </>
            )}
            <Link
              href="/onboarding?again"
              className="mt-4 block min-h-12 text-base text-wine underline underline-offset-4"
            >
              {t("settings.redoCheck")}
            </Link>
          </div>

          <div className="mt-8 border-t border-border pt-8">
            <h2 className="text-xl text-wine">{t("settings.data")}</h2>
            <p className="mt-1 text-lg text-ink">{t("settings.dataBody")}</p>
            {done ? (
              <p role="status" className="mt-3 text-lg text-safe">
                {t("settings.deleted")}
              </p>
            ) : confirming ? (
              <div className="mt-3 rounded-[12px] bg-caution-tint p-4">
                <p className="flex items-start gap-2 text-lg text-ink">
                  <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0 text-caution" />
                  {t("settings.confirm")}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={deleteEverything}
                    className="inline-flex min-h-14 items-center justify-center rounded-[12px] bg-caution px-6 text-base text-on-wine disabled:opacity-60"
                  >
                    {t("settings.confirmYes")}
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className="btn-secondary">
                    {t("settings.confirmNo")}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className="btn-secondary mt-3">
                {t("settings.delete")}
              </button>
            )}
            {error ? (
              <p role="alert" className="mt-3 text-base text-caution">
                {error.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
