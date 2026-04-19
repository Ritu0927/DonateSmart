import { DonationForm } from "@/components/donate/donation-form";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDonorById } from "@/lib/storage";

export default async function DonatePage({
  searchParams
}: {
  searchParams?: { donor?: string; anonymous?: string };
}) {
  const donor = searchParams?.donor ? await getDonorById(searchParams.donor) : null;
  const startAnonymous = searchParams?.anonymous === "1";

  return (
    <PageShell className="space-y-8">
      <SectionHeading
        eyebrow="Donor Intake"
        title="Submit an item for donation"
        description={
          donor
            ? `Continue donating as ${donor.name}. Your donor profile is already loaded, so you can go straight to the next item.`
            : startAnonymous
              ? "Anonymous donation is enabled. Continue without a donor profile, then submit an item with a photo to create a QR-linked record."
              : "Start with your contact details, then submit an item with a photo to create a QR-linked record."
        }
      />
      <DonationForm donor={donor} startAnonymous={startAnonymous} />
    </PageShell>
  );
}
