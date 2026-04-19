import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/donate", label: "Donate" },
  { href: "/staff-login", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 pt-5">
      <div className="rounded-full border border-white/70 bg-white/75 px-5 py-3 shadow-card backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-600 text-lg font-semibold text-white">
              DS
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage-700">
                DonateSmart
              </p>
              <p className="text-sm text-slate-500">Donation intake with QR tracking</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-sage-50 hover:text-sage-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
