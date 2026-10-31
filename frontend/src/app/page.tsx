import Link from "next/link";

/** Temporary landing while the phone-first redesign lands (task 13). */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="hero-band px-6 py-14 sm:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-3xl text-on-wine">HIMMAT</h1>
          <p className="mt-4 text-xl text-on-wine">Learn it. Break it. Recover from it. Master it.</p>
        </div>
      </section>
      <section className="px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <Link href="/simulations/fake_bank_message" className="btn-primary">
            Start practising
          </Link>
        </div>
      </section>
    </main>
  );
}
