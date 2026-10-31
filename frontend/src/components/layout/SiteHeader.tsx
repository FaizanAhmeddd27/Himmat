"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { A11yControls } from "@/components/layout/A11yBar";
import { Logo } from "@/components/layout/Logo";
import { useT, type I18nKey } from "@/lib/i18n";

const LINKS: { href: string; key: I18nKey }[] = [
  { href: "/simulations", key: "nav.practise" },
  { href: "/digital-dna", key: "nav.skills" },
  { href: "/family", key: "nav.family" },
];

function NavLink({ href, active, label }: { href: string; active?: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-12 items-center whitespace-nowrap rounded-[10px] px-3 text-base underline-offset-8 hover:bg-wine-tint ${
        active ? "text-wine underline decoration-2" : "text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

function NavLinks() {
  const t = useT();
  const pathname = usePathname();
  return LINKS.map((link) => (
    <NavLink key={link.href} href={link.href} active={pathname.startsWith(link.href)} label={t(link.key)} />
  ));
}

function PlainNavLinks() {
  const t = useT();
  return LINKS.map((link) => <NavLink key={link.href} href={link.href} label={t(link.key)} />);
}

export function SiteHeader() {
  return (
    <header className="bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-1.5 sm:px-6 md:px-10">
        <Link href="/" className="inline-flex min-h-12 items-center" aria-label="HIMMAT home">
          <Logo />
        </Link>
        <nav className="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto sm:flex-1">
          <Suspense fallback={<PlainNavLinks />}>
            <NavLinks />
          </Suspense>
        </nav>
        <A11yControls />
      </div>
    </header>
  );
}
