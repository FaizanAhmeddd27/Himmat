"use client";

import { useEffect, useState } from "react";
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

let animation: Promise<ArrayBuffer> | null = null;

/**
 * Fetched once and shared. Given a `src`, the player aborts its own download when
 * a fast page unmounts the loader, and reports that abort as a console error.
 */
function loadAnimation(): Promise<ArrayBuffer> {
  animation ??= fetch("/loading.lottie").then((res) => {
    if (!res.ok) throw new Error(`loader animation: ${res.status}`);
    return res.arrayBuffer();
  });
  return animation;
}

/** Loading animation recoloured to the wine and sand theme (UI_UX §2). */
export function ThemedLoader({ label, className, size = "md" }: ThemedLoaderProps) {
  const t = useT();
  const [data, setData] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    let active = true;
    loadAnimation()
      .then((buffer) => {
        if (active) setData(buffer);
      })
      .catch(() => {
        // Decorative only: the label below still says what is happening.
        animation = null;
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 text-center", className)}
      role="status"
      aria-live="polite"
    >
      <div className={cn("relative", sizes[size])} aria-hidden="true">
        {data ? <DotLottieReact data={data} loop autoplay /> : null}
      </div>
      <p className="text-lg text-muted-foreground">{label ?? t("common.loading")}</p>
    </div>
  );
}
