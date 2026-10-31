import Image from "next/image";

/** The brand shield (from logo.png) beside the wordmark set in the UI face. */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/logo-mark.png" alt="" width={389} height={355} priority className="h-10 w-auto shrink-0" />
      <span className="text-xl tracking-wide text-wine">HIMMAT</span>
    </span>
  );
}
