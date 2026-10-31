import Image from "next/image";

/**
 * HIMMAT wordmark pair: Ustad mascot (himmat1) + wordmark.
 * The mascot has a white background — keep it over light surfaces and let
 * mix-blend-multiply seat it into the sand.
 */
export function Logo({ size = 44 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/himmat1.png"
        alt=""
        aria-hidden
        width={size}
        height={size}
        className="mix-blend-multiply"
      />
      <span className="text-xl tracking-wide text-wine">HIMMAT</span>
    </span>
  );
}
