import { ClothingBulkRange, DonationInput, DonorInput, ItemCategory, ItemCondition } from "@/lib/types";

const validCategories = new Set<ItemCategory>([
  "clothing",
  "shoes",
  "accessories",
  "home",
  "electronics",
  "books",
  "toys",
  "other"
]);

const validConditions = new Set<ItemCondition>(["good", "better", "best"]);
const validBulkRanges = new Set<ClothingBulkRange>(["0-10", "10-20", "20-30", "30-40", "40+"]);

export function validateDonationInput(payload: Partial<DonationInput>) {
  const errors: Record<string, string> = {};

  if (!payload.itemName?.trim()) {
    errors.itemName = "Item name is required.";
  } else if (payload.itemName.trim().length < 2) {
    errors.itemName = "Item name must be at least 2 characters.";
  }

  if (!payload.category || !validCategories.has(payload.category)) {
    errors.category = "Choose a valid category.";
  }

  if (!payload.condition || !validConditions.has(payload.condition)) {
    errors.condition = "Choose a valid condition.";
  }

  if (payload.category === "clothing" && payload.isBulkClothing) {
    if (!payload.bulkClothingRange || !validBulkRanges.has(payload.bulkClothingRange)) {
      errors.bulkClothingRange = "Choose the clothing quantity range.";
    }
  }

  if (!payload.imageDataUrl?.startsWith("data:image/")) {
    errors.imageDataUrl = "Please upload an image.";
  }

  if (payload.description && payload.description.length > 500) {
    errors.description = "Description should stay under 500 characters.";
  }

  if (payload.brand && payload.brand.length > 60) {
    errors.brand = "Brand should stay under 60 characters.";
  }

  if (payload.size && payload.size.length > 30) {
    errors.size = "Size should stay under 30 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateDonorInput(payload: Partial<DonorInput>) {
  return validateDonorInputWithOptions(payload);
}

export function validateDonorInputWithOptions(
  payload: Partial<DonorInput>,
  options?: { allowAnonymous?: boolean }
) {
  const errors: Record<string, string> = {};

  if (options?.allowAnonymous) {
    return {
      valid: true,
      errors
    };
  }

  if (!payload.name?.trim()) {
    errors.name = "Name is required.";
  } else if (payload.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!payload.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!payload.phone?.trim()) {
    errors.phone = "Phone number is required.";
  } else if (payload.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Enter a valid phone number.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
