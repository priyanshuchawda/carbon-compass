import Link from "next/link";

const primaryLinks = [
  { href: "/calculator", label: "Calculator" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/actions", label: "Actions" },
  { href: "/report", label: "Report" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-emerald-100 bg-white/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <Link
          href="/"
          aria-label="Carbon Compass home"
          className="w-fit text-lg font-semibold tracking-tight text-emerald-900 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
        >
          Carbon Compass
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap gap-3 text-sm">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
