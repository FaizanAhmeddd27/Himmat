import type { Metadata } from "next";
import { Share_Tech, Noto_Nastaliq_Urdu } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

/**
 * Fonts per docs/UI_UX.md §3.2.
 * Share Tech (Latin only, one weight) for UI + Roman Urdu,
 * Noto Nastaliq Urdu for Urdu script via the --font-urdu stack in tokens.css.
 */
const shareTech = Share_Tech({
  subsets: ["latin"],
  weight: "400", // only weight available, so never use bold (§3.3)
  variable: "--font-share-tech",
  display: "swap",
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-urdu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HIMMAT: Digital Life Simulator",
  description:
    "Learn it. Break it. Recover from it. Master it. A safe practice world for everyday digital life.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // data-text="large" is the learner-facing default (UI_UX §3.5).
      data-text="large"
      className={`${shareTech.variable} ${urdu.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
