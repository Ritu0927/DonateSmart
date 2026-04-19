import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white/80 px-4 py-2 text-sm text-sage-800 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-peach-400" />
          Built for faster donation intake and staff handoff
        </div>
        <div className="space-y-4">
          <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Make every donated item easier to submit, sort, and scan.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            DonateSmart gives donors a friendly intake flow and gives staff a simple QR-linked
            item record with a rule-based suggested resale range.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/donate"
            className="inline-flex items-center justify-center rounded-full bg-sage-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sage-700"
          >
            Start a donation
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-sage-200 bg-white px-6 py-3 text-sm font-semibold text-sage-800 transition hover:border-sage-300 hover:bg-sage-50"
          >
            View staff dashboard
          </Link>
        </div>
        <div className="rounded-[1.5rem] border border-white/80 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">Need another way to communicate?</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Use the floating <span className="font-semibold text-slate-700">Talk to DonateSmart</span> voice assistant
            to ask questions about donation steps, QR scanning, approvals, or inventory.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -left-6 top-12 hidden h-24 w-24 rounded-full bg-peach-100 blur-2xl sm:block" />
        <div className="absolute -right-4 bottom-0 hidden h-28 w-28 rounded-full bg-sage-100 blur-2xl sm:block" />
        <div className="relative flex min-h-[440px] items-center justify-center rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-card backdrop-blur">
          <div className="absolute inset-x-10 bottom-10 top-auto h-16 rounded-full bg-sage-100/60 blur-2xl" />
          <div className="relative flex flex-col items-center justify-center">
            <Image
              src="/donate-sign.png"
              alt="Donate sign"
              width={380}
              height={380}
              className="h-auto w-full max-w-[320px] drop-shadow-[0_18px_30px_rgba(36,67,51,0.18)] sm:max-w-[380px]"
              priority
            />
            <p className="mt-5 max-w-xs text-center text-sm text-slate-500">
              Start with donor onboarding, add an item, and generate a QR-linked donation record.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
