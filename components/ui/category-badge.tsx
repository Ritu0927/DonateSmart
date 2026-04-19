export function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-700 ring-1 ring-inset ring-sage-200">
      {label}
    </span>
  );
}
