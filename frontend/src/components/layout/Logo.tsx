import Image from "next/image";

/** The brand shield (from logo.png) beside the wordmark set in the UI face. */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/logo-mark.png" alt="" width={312} height={314} priority className="h-9 w-9 shrink-0" />
      <span className="text-xl tracking-wide text-wine">HIMMAT</span>
    </span>
  );
}
