import { notFound } from "next/navigation";
import { ItemDetailCard } from "@/components/items/item-detail-card";
import { PageShell } from "@/components/ui/page-shell";
import { isStaffAuthenticated } from "@/lib/staff-auth";
import { getItemById } from "@/lib/storage";

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await getItemById(params.id);
  const canApprove = await isStaffAuthenticated();

  if (!item) {
    notFound();
  }

  return (
    <PageShell>
      <ItemDetailCard item={item} canApprove={canApprove} />
    </PageShell>
  );
}
