import Link from "next/link";

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-extrabold text-lg text-ink tracking-tight">
          Mehran Dental<span className="text-teal">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/70">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:03352411106"
            className="hidden sm:inline text-sm font-semibold text-ink/70 hover:text-ink"
          >
            0335 2411106
          </a>
          <Link
            href="/contact"
            className="rounded-full bg-teal text-white text-sm font-semibold px-4 py-2 hover:bg-teal-dark transition-colors"
          >
            Book a visit
          </Link>
        </div>
      </div>
    </header>
  );
}
