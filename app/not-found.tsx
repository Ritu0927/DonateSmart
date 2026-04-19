import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="max-w-xl rounded-[2rem] border border-white/80 bg-white/85 p-10 text-center shadow-card backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sage-700">Not Found</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          That item record could not be located.
        </h1>
        <p className="mt-4 text-slate-600">
          The link may be incorrect, or the item may not exist in the local store yet.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-full bg-sage-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sage-700"
          >
            Open dashboard
          </Link>
          <Link
            href="/donate"
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Submit an item
          </Link>
        </div>
      </div>
    </div>
  );
}
