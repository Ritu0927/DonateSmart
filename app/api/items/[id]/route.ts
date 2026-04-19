import { NextResponse } from "next/server";
import { approveDonationItem, getItemById, markDonationItemAsSold } from "@/lib/storage";
import { isStaffAuthenticated } from "@/lib/staff-auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = await getItemById(params.id);

  if (!item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isStaffAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { action?: string; soldPrice?: number };

  if (body.action === "sold") {
    const soldPrice = Number(body.soldPrice);

    if (!Number.isFinite(soldPrice) || soldPrice <= 0) {
      return NextResponse.json({ error: "Enter a valid sold price." }, { status: 400 });
    }

    const item = await markDonationItemAsSold(params.id, soldPrice);

    if (!item) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }

    return NextResponse.json({ item });
  }

  const item = await approveDonationItem(params.id);

  if (!item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  return NextResponse.json({ item });
}
