import { ItemCategory, ItemCondition } from "@/lib/types";

export const categoryOptions: Array<{ value: ItemCategory; label: string }> = [
  { value: "clothing", label: "Clothing" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
  { value: "home", label: "Home Goods" },
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books" },
  { value: "toys", label: "Toys" },
  { value: "other", label: "Other" }
];

export const conditionOptions: Array<{ value: ItemCondition; label: string }> = [
  { value: "good", label: "Good" },
  { value: "better", label: "Better" },
  { value: "best", label: "Best" }
];
