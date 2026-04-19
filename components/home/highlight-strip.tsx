const stats = [
  { label: "Submission time", value: "Under 2 min" },
  { label: "QR-linked records", value: "100%" },
  { label: "Searchable inventory", value: "Instant" }
];

export function HighlightStrip() {
  return (
    <section className="mt-10 rounded-[2rem] border border-sage-100 bg-sage-900 px-6 py-8 text-white shadow-card">
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-semibold">{stat.value}</p>
            <p className="mt-2 text-sm text-sage-100">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
