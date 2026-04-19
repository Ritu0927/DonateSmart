"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApproveItemButton({ itemId, disabled }: { itemId: string; disabled?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleApprove() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/items/${itemId}`, { method: "PATCH" });
      if (!response.ok) {
        throw new Error("Unable to approve item.");
      }
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleApprove}
      disabled={disabled || isLoading}
      className="rounded-full bg-sage-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sage-700 disabled:cursor-not-allowed disabled:bg-sage-300"
    >
      {isLoading ? "Approving..." : "Approve item"}
    </button>
  );
}
