import { PageShell } from "@/components/ui/page-shell";
import { Hero } from "@/components/home/hero";
import { LoyaltySummary } from "@/components/home/loyalty-summary";
import { getDonorById, getItemById } from "@/lib/storage";

export default async function HomePage({
  searchParams
}: {
  searchParams?: { donor?: string; item?: string };
}) {
  const donor = searchParams?.donor ? await getDonorById(searchParams.donor) : null;
  const latestItem = searchParams?.item ? await getItemById(searchParams.item) : null;

  return (
    <PageShell className="space-y-10">
      <Hero />
      {donor ? <LoyaltySummary donor={donor} latestItem={latestItem} /> : null}
    </PageShell>
  );
}
