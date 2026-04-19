import Link from "next/link";
import { DonationItem, DonorProfile } from "@/lib/types";
export function LoyaltySummary({
  donor,
  latestItem
}: {
  donor: DonorProfile;
  latestItem?: DonationItem | null;
}) {
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-card backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sage-700">Welcome Back</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {donor.name}, your giving is building real value.
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
        You currently have <span className="font-semibold text-slate-900">{donor.totalLoyaltyPoints} loyalty points</span>.
        Points are added after staff approves each delivered donation.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total points</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{donor.totalLoyaltyPoints}</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Latest donation</p>
          <p className="mt-3 text-base font-semibold text-slate-900">
            {latestItem ? latestItem.itemName : "No recent item found"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {latestItem?.status === "waiting-approval" ? "Waiting approval" : "Approved donation"}
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {latestItem?.status === "waiting-approval" ? "Loyalty points incoming" : "Latest points earned"}
          </p>
          <p className="mt-3 text-base font-semibold text-slate-900">
            {latestItem
              ? latestItem.status === "waiting-approval"
                ? `${latestItem.loyaltyPointsAwarded} incoming points`
                : `${latestItem.loyaltyPointsAwarded} points added`
              : "Add an item to earn points"}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/donate?donor=${donor.id}`}
          className="rounded-full bg-sage-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-sage-700"
        >
          Donate another item
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View staff dashboard
        </Link>
      </div>
    </section>
  );
}
