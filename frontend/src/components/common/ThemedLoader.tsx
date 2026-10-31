"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ThemedLoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-20 w-20",
  md: "h-36 w-36",
  lg: "h-52 w-52",
} as const;

/** Loading animation recoloured to the wine and sand theme (UI_UX §2). */
export function ThemedLoader({ label, className, size = "md" }: ThemedLoaderProps) {
  const t = useT();
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 text-center", className)}
      role="status"
      aria-live="polite"
    >
      <div className={cn("relative", sizes[size])} aria-hidden="true">
        <DotLottieReact src="/loading.lottie" loop autoplay />
      </div>
      <p className="text-lg text-muted-foreground">{label ?? t("common.loading")}</p>
    </div>
  );
}
