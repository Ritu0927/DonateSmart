import { cn } from "@/lib/utils";
import { ItemStatus } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";

const styles: Record<ItemStatus, string> = {
  "waiting-approval": "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-sky-50 text-sky-700 ring-sky-200",
  "ready-for-floor": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  sold: "bg-slate-100 text-slate-600 ring-slate-200"
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        styles[status]
      )}
    >
      {toTitleCase(status)}
    </span>
  );
}
