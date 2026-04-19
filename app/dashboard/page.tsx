import Link from "next/link";
import { redirect } from "next/navigation";
import { StaffLogoutButton } from "@/components/auth/staff-logout-button";
import { ItemGrid } from "@/components/dashboard/item-grid";
import { QrLookupForm } from "@/components/dashboard/qr-lookup-form";
import { SearchBar } from "@/components/dashboard/search-bar";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { isStaffAuthenticated } from "@/lib/staff-auth";
import { getAllItems, getItemByQrCodeId } from "@/lib/storage";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: { query?: string; qr?: string };
}) {
  if (!(await isStaffAuthenticated())) {
    redirect("/staff-login");
  }

  const query = searchParams?.query?.trim().toLowerCase() || "";
  const qrLookup = searchParams?.qr?.trim() || "";

  if (qrLookup) {
    const extractedQrCodeId = extractQrCodeId(qrLookup);
    const extractedItemId = extractItemId(qrLookup);

    if (extractedItemId) {
      redirect(`/items/${extractedItemId}`);
    }

    if (extractedQrCodeId) {
      const matchedItem = await getItemByQrCodeId(extractedQrCodeId);
      if (matchedItem) {
        redirect(`/items/${matchedItem.id}`);
      }
    }
  }

  const items = await getAllItems();
  const filteredItems = query
    ? items.filter((item) => {
        const haystack = [item.id, item.qrCodeId, item.itemName, item.category, item.brand, item.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
    : items;

  return (
    <PageShell className="space-y-8">
      <SectionHeading
        eyebrow="Staff Dashboard"
        title="Track every donated item in one place"
        description="Search by item name or category, inspect current status, and open any QR-linked record."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/donate"
              className="inline-flex rounded-full bg-sage-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-700"
            >
              New donation
            </Link>
            <StaffLogoutButton />
          </div>
        }
      />
      <QrLookupForm defaultValue={searchParams?.qr} />
      <SearchBar defaultValue={searchParams?.query} />
      <ItemGrid items={filteredItems} />
    </PageShell>
  );
}

function extractQrCodeId(value: string) {
  const match = value.match(/\b(\d{6})\b/);
  return match?.[1] ?? "";
}

function extractItemId(value: string) {
  const match = value.match(/\/items\/([^/?#]+)/i);
  return match?.[1] ?? "";
}
