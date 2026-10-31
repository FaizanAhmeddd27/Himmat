"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { useA11y } from "@/lib/a11y";

/** Applies saved accessibility settings and honours reduced-motion everywhere. */
export function Providers({ children }: { children: ReactNode }) {
  const hydrate = useA11y((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
