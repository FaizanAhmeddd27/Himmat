"use client";

/**
 * Auth guard: routes outside the public list require a signed-in Supabase
 * session; everyone else is sent to /login (with ?next= to send them back).
 * Public: landing, auth pages and settings.
 */

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const PUBLIC_PREFIXES = ["/", "/login", "/signup", "/settings"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<"checking" | "allowed">("checking");

  useEffect(() => {
    const supabase = getSupabase();

    if (isPublicPath(pathname)) {
      return;
    }

    if (!supabase) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setState("allowed");
      else router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    });

    // Sign-out anywhere bounces back to login immediately.
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setState("checking");
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (!isPublicPath(pathname) && state === "checking") {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-muted-foreground"
        role="status"
      >
        <LoaderCircle aria-hidden className="size-8 animate-spin text-wine" />
        <p className="text-lg">Checking your session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
