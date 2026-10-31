"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { useA11y } from "@/lib/a11y";
import { AuthGuard } from "@/components/auth/AuthGuard";

/** Applies saved accessibility settings, honours reduced-motion, guards routes. */
export function Providers({ children }: { children: ReactNode }) {
  const hydrate = useA11y((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <MotionConfig reducedMotion="user">
      <Suspense>
        <AuthGuard>{children}</AuthGuard>
      </Suspense>
    </MotionConfig>
  );
}
