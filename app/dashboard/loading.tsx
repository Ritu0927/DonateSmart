export default function DashboardLoading() {
  return (
    <div className="space-y-5 py-12">
      <div className="h-14 animate-pulse rounded-full bg-white/80 shadow-card" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-[2rem] bg-white/80 shadow-card" />
        <div className="h-72 animate-pulse rounded-[2rem] bg-white/80 shadow-card" />
      </div>
    </div>
  );
}
