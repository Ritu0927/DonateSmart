import { DonationInput, SuggestedRange } from "@/lib/types";

const categoryBase: Record<DonationInput["category"], { low: number; high: number }> = {
  clothing: { low: 12, high: 28 },
  shoes: { low: 18, high: 48 },
  accessories: { low: 10, high: 32 },
  home: { low: 14, high: 40 },
  electronics: { low: 28, high: 95 },
  books: { low: 6, high: 16 },
  toys: { low: 8, high: 24 },
  other: { low: 10, high: 30 }
};

const conditionMultiplier: Record<DonationInput["condition"], number> = {
  good: 0.88,
  better: 1,
  best: 1.15
};

const premiumBrands = [
  "patagonia",
  "lululemon",
  "coach",
  "nike",
  "apple",
  "le creuset",
  "north face",
  "anthropologie"
];

// Keep this pricing logic separate so it can later be replaced by an AI model.
export function estimateSuggestedResaleRange(input: DonationInput): SuggestedRange {
  const base = categoryBase[input.category];
  const multiplier = conditionMultiplier[input.condition];
  const brandBoost = input.brand && premiumBrands.includes(input.brand.trim().toLowerCase()) ? 1.18 : 1;

  const low = Math.max(4, Math.round(base.low * multiplier * brandBoost));
  const high = Math.max(low + 4, Math.round(base.high * multiplier * brandBoost));

  return {
    low,
    high,
    label: `${low}-${high}`
  };
}
