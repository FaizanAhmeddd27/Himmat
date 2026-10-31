"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { A11yControls } from "@/components/layout/A11yBar";
import { Logo } from "@/components/layout/Logo";
import { useT, type I18nKey } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

const LINKS: { href: string; key: I18nKey }[] = [
  { href: "/dashboard", key: "nav.home" },
  { href: "/simulations", key: "nav.practise" },
  { href: "/digital-dna", key: "nav.skills" },
  { href: "/family", key: "nav.family" },
  { href: "/settings", key: "nav.settings" },
];

function NavLink({ href, active, label }: { href: string; active?: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-10 items-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm sm:text-base font-medium transition-colors hover:bg-wine-tint ${
        active ? "text-wine underline decoration-2 underline-offset-8 font-semibold" : "text-ink/90 hover:text-ink"
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
  const t = useT();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setSignedIn(event !== "SIGNED_OUT" && Boolean(session));
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setSignedIn(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#ebdccd]/80 bg-[#fffdfa]/95 backdrop-blur-md shadow-[0_1px_3px_rgba(114,25,48,0.03)]">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 md:px-8 lg:flex-nowrap">
        {/* Left: Brand Logo */}
        <Link href="/" className="inline-flex shrink-0 items-center gap-2 hover:opacity-90 transition-opacity" aria-label="HIMMAT home">
          <Logo />
        </Link>

        {/* Center: Primary Navigation */}
        <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-1 sm:order-none sm:w-auto lg:mx-4 lg:flex-nowrap">
          <Suspense fallback={<PlainNavLinks />}>
            <NavLinks />
          </Suspense>
        </nav>

        {/* Right: Accessibility Controls & Auth Button */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <A11yControls />
          {signedIn ? (
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-8 sm:min-h-9 items-center gap-1.5 rounded-full bg-wine px-3 sm:px-3.5 text-xs sm:text-sm font-medium text-on-wine transition-colors hover:bg-wine-dark"
            >
              <LogOut aria-hidden className="size-3.5" />
              <span>{t("settings.signOut")}</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-8 sm:min-h-9 items-center gap-1.5 rounded-full bg-wine px-3 sm:px-3.5 text-xs sm:text-sm font-medium text-on-wine transition-colors hover:bg-wine-dark"
            >
              <LogIn aria-hidden className="size-3.5" />
              <span>{t("auth.login")}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
