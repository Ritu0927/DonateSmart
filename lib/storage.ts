import { promises as fs } from "fs";
import path from "path";
import { DonationInput, DonationItem, DonorInput, DonorProfile } from "@/lib/types";
import { appraiseDonationItem } from "@/lib/gemini";
import { generateItemQrCodeDataUrl } from "@/lib/qr";
import { toTitleCase } from "@/lib/utils";
import { buildDonorImpactMessage } from "@/lib/impact";

const dataDir = path.join(process.cwd(), "data");
const itemsFile = path.join(dataDir, "items.json");

interface ItemStore {
  donors: DonorProfile[];
  items: DonationItem[];
}

async function ensureStore() {
  try {
    await fs.access(itemsFile);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(itemsFile, JSON.stringify({ donors: [], items: [] }, null, 2), "utf8");
  }
}

async function readStore(): Promise<ItemStore> {
  await ensureStore();
  const raw = await fs.readFile(itemsFile, "utf8");
  const parsed = JSON.parse(raw) as Partial<ItemStore>;
  return {
    donors: parsed.donors ?? [],
    items: parsed.items ?? []
  };
}

async function writeStore(store: ItemStore) {
  await fs.writeFile(itemsFile, JSON.stringify(store, null, 2), "utf8");
}

function createItemId() {
  return `itm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createQrCodeId(existingItems: DonationItem[]) {
  let qrCodeId = "";

  do {
    qrCodeId = Math.floor(100000 + Math.random() * 900000).toString();
  } while (existingItems.some((item) => item.qrCodeId === qrCodeId));

  return qrCodeId;
}

function createDonorId() {
  return `donor_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function resolveBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  );
}

export async function getAllItems() {
  const store = await readStore();
  return store.items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getItemById(id: string) {
  const store = await readStore();
  return store.items.find((item) => item.id === id) ?? null;
}

export async function getDonorById(id: string) {
  const store = await readStore();
  return store.donors.find((donor) => donor.id === id) ?? null;
}

export async function createOrUpdateDonor(input: DonorInput, donorId?: string) {
  const store = await readStore();
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedPhone = input.phone.replace(/\D/g, "");

  const existingDonor =
    (donorId ? store.donors.find((donor) => donor.id === donorId) : null) ||
    store.donors.find(
      (donor) =>
        donor.email.trim().toLowerCase() === normalizedEmail ||
        donor.phone.replace(/\D/g, "") === normalizedPhone
    );

  if (existingDonor) {
    existingDonor.name = input.name.trim();
    existingDonor.email = input.email.trim();
    existingDonor.phone = input.phone.trim();
    existingDonor.updatedAt = new Date().toISOString();
    await writeStore(store);
    return existingDonor;
  }

  const donor: DonorProfile = {
    id: createDonorId(),
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    totalLoyaltyPoints: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.donors.unshift(donor);
  await writeStore(store);
  return donor;
}

export async function createDonationItem(
  input: DonationInput,
  donor?: DonorProfile | null,
  options?: { isAnonymousDonation?: boolean }
) {
  const store = await readStore();
  const pricing = await appraiseDonationItem(input);
  const id = createItemId();
  const qrCodeId = createQrCodeId(store.items);
  const itemUrl = `${resolveBaseUrl()}/items/${id}`;
  const qrCodeDataUrl = await generateItemQrCodeDataUrl(itemUrl, [
    `QR Code ID: ${qrCodeId}`,
    `Category: ${toTitleCase(input.category)}`,
    `Condition: ${toTitleCase(input.condition)}`
  ]);
  const isAnonymousDonation = Boolean(options?.isAnonymousDonation);
  const loyaltyPointsAwarded = isAnonymousDonation
    ? 0
    : Math.max(1, Math.round(pricing.suggestedResaleRange.low * 0.1));

  // AI image analysis hook:
  // Gemini now evaluates the uploaded image for pricing. A future agent/model can
  // replace or extend this call to classify the item more deeply or add richer comps.
  const item: DonationItem = {
    id,
    qrCodeId,
    donorId: donor?.id ?? null,
    isAnonymousDonation,
    createdAt: new Date().toISOString(),
    status: "waiting-approval",
    qrCodeDataUrl,
    suggestedResaleRange: pricing.suggestedResaleRange,
    loyaltyPointsAwarded,
    donorImpactMessage: buildDonorImpactMessage(input),
    appraisal: pricing.appraisal,
    ...input
  };

  store.items.unshift(item);
  await writeStore(store);
  return item;
}

export async function approveDonationItem(id: string) {
  const store = await readStore();
  const item = store.items.find((entry) => entry.id === id);

  if (!item) {
    return null;
  }

  if (item.status !== "waiting-approval") {
    return item;
  }

  item.status = "approved";
  item.approvedAt = new Date().toISOString();

  const donor = item.donorId ? store.donors.find((entry) => entry.id === item.donorId) : null;
  if (donor && !item.isAnonymousDonation) {
    donor.totalLoyaltyPoints += item.loyaltyPointsAwarded;
    donor.updatedAt = new Date().toISOString();
  }

  await writeStore(store);
  return item;
}

export async function markDonationItemAsSold(id: string, soldPrice: number) {
  const store = await readStore();
  const item = store.items.find((entry) => entry.id === id);

  if (!item) {
    return null;
  }

  item.status = "sold";
  item.soldAt = new Date().toISOString();
  item.soldPrice = soldPrice;

  await writeStore(store);
  return item;
}
