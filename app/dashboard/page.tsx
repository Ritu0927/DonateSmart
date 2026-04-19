import Link from "next/link";
import { redirect } from "next/navigation";
import { StaffLogoutButton } from "@/components/auth/staff-logout-button";
import { ItemGrid } from "@/components/dashboard/item-grid";
import { SearchBar } from "@/components/dashboard/search-bar";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { isStaffAuthenticated } from "@/lib/staff-auth";
import { getAllItems } from "@/lib/storage";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: { query?: string };
}) {
  if (!(await isStaffAuthenticated())) {
    redirect("/staff-login");
  }

  const query = searchParams?.query?.trim().toLowerCase() || "";
  const items = await getAllItems();
  const filteredItems = query
    ? items.filter((item) => {
        const haystack = [item.id, item.itemName, item.category, item.brand, item.description]
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
              href="/inventory"
              className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Inventory
            </Link>
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
      <SearchBar defaultValue={searchParams?.query} />
      <ItemGrid items={filteredItems} />
    </PageShell>
  );
}
