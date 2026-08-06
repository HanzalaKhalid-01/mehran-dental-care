"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
            className="hidden sm:inline-block rounded-full bg-teal text-white text-sm font-semibold px-4 py-2 hover:bg-teal-dark transition-colors"
          >
            Book a visit
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 -mr-2 rounded-md text-ink/80 hover:bg-ink/5 active:bg-ink/10 transition"
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-200 ease-in-out bg-white border-b border-line ${
          open ? "max-h-80" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="py-3 text-base font-medium text-ink/80 border-b border-line last:border-b-0"
            >
              {l.label}
            </Link>
          ))}
          <a href="tel:03352411106" className="py-3 text-base font-medium text-ink/80 border-b border-line">
            Call: 0335 2411106
          </a>
          <Link
            href="/contact"
            className="my-3 text-center rounded-full bg-teal text-white text-sm font-semibold px-4 py-2.5 hover:bg-teal-dark transition-colors"
          >
            Book a visit
          </Link>
        </nav>
      </div>
    </header>
  );
}
