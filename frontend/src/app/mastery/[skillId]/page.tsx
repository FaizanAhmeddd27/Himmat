"use client";

/**
 * Mastery test by skill (docs/UI_UX.md §6.5): sends each skill to the unaided
 * scenario that tests it. Skills with no test yet say so.
 */

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { ThemedLoader } from "@/components/common/ThemedLoader";

const TEST_FOR_SKILL: Record<string, string> = {
  scam_detection: "lucky_draw_message",
  otp_safety: "lucky_draw_message",
  reporting: "lucky_draw_message",
};

function Mastery() {
  const t = useT();
  const router = useRouter();
  const { skillId } = useParams<{ skillId: string }>();
  const scenario = TEST_FOR_SKILL[skillId];

  useEffect(() => {
    if (scenario) router.replace(`/simulations/${scenario}?mode=mastery`);
  }, [router, scenario]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      {scenario ? (
        <ThemedLoader />
      ) : (
        <>
          <p className="max-w-xl text-lg text-ink">{t("mastery.noTest")}</p>
          <Link href="/simulations" className="btn-primary">
            {t("player.exit")}
          </Link>
        </>
      )}
    </main>
  );
}

export default function MasteryPage() {
  return (
    <Suspense>
      <Mastery />
    </Suspense>
  );
}
