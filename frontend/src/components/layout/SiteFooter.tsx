"use client";

import Image from "next/image";
import { useT } from "@/lib/i18n";

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-8 md:px-10">
        <Image src="/logo.png" alt="HIMMAT" width={649} height={480} className="h-20 w-auto" />
        <div className="max-w-xl text-end">
          <p className="text-lg text-ink">{t("footer.tag")}</p>
          <p className="mt-1 text-base text-muted-foreground">{t("footer.fictional")}</p>
        </div>
      </div>
    </footer>
  );
}
