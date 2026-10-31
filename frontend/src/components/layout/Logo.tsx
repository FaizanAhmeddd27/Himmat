/**
 * HIMMAT mark drawn as SVG: a shield-shaped H crossed by the rising arc from
 * the brand logo. `tone` swaps fills for use on sand or on a wine band.
 */
export function LogoMark({ size = 40, tone = "wine" }: { size?: number; tone?: "wine" | "sand" }) {
  const fill = tone === "wine" ? "var(--wine)" : "var(--sand)";
  const arc = tone === "wine" ? "var(--sand)" : "var(--wine)";
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 100 110" aria-hidden className="shrink-0">
      <path d="M50 2 C53 12 56 15 64 18 C56 21 53 24 50 34 C47 24 44 21 36 18 C44 15 47 12 50 2 Z" fill={fill} />
      <path
        d="M8 26 L34 17 V58 L66 49 V17 L92 26 V68 C92 84 80 98 66 108 V70 L34 79 V108 C20 98 8 84 8 68 Z"
        fill={fill}
      />
      <path d="M8 86 C30 66 60 56 92 54" fill="none" stroke={arc} strokeWidth="5" />
    </svg>
  );
}

export function Logo({ tone = "wine" }: { tone?: "wine" | "sand" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={30} tone={tone} />
      <span className={`text-xl tracking-wide ${tone === "wine" ? "text-wine" : "text-sand"}`}>HIMMAT</span>
    </span>
  );
}
