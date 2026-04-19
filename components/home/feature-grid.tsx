const features = [
  {
    title: "Donor-friendly intake",
    description: "A guided form with image preview, gentle validation, and a polished completion flow."
  },
  {
    title: "QR-enabled tracking",
    description: "Every item gets a unique ID and QR code that links staff directly to the item record."
  },
  {
    title: "Searchable dashboard",
    description: "Browse all donations with category, condition, status, and suggested resale range."
  }
];

export function FeatureGrid() {
  return (
    <section className="grid gap-4 py-4 md:grid-cols-3">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur"
        >
          <div className="mb-4 h-12 w-12 rounded-2xl bg-sage-100" />
          <h2 className="text-xl font-semibold text-slate-900">{feature.title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
