"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkSoldButton({ itemId, disabled }: { itemId: string; disabled?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleMarkSold() {
    const rawValue = window.prompt("Enter the sold price in dollars", "");

    if (rawValue === null) {
      return;
    }

    const soldPrice = Number(rawValue.trim());

    if (!Number.isFinite(soldPrice) || soldPrice <= 0) {
      window.alert("Enter a valid sold price greater than 0.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "sold",
          soldPrice
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Unable to mark item as sold.");
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to mark item as sold.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleMarkSold}
      disabled={disabled || isLoading}
      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {isLoading ? "Saving..." : "Mark sold"}
    </button>
  );
}
