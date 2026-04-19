export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function toTitleCase(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getSafeAppraisalSummary(summary?: string) {
  if (!summary) {
    return "A suggested resale range was prepared for this item.";
  }

  const lower = summary.toLowerCase();
  const looksTechnical =
    summary.includes('{"error"') ||
    summary.includes('"status"') ||
    summary.includes("googleapis.com") ||
    lower.includes("api key not valid") ||
    lower.includes("invalid_argument") ||
    lower.includes("gemini pricing fallback was used because the live appraisal request failed");

  if (looksTechnical) {
    return "A suggested resale range was prepared using the local pricing fallback.";
  }

  return summary;
}
