"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const links = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
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
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-extrabold text-lg text-ink tracking-tight">
          Mehran Dental<span className="text-teal">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/70">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="relative group py-1">
              <span className="group-hover:text-ink transition-colors">{l.label}</span>
              <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-teal transition-[width] duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle variant="public" />
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
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-card border-b border-border"
          >
            <nav className="flex flex-col px-5 py-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="py-3 text-base font-medium text-ink/80 border-b border-border last:border-b-0"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href="tel:03352411106"
                className="py-3 text-base font-medium text-ink/80 border-b border-border"
              >
                Call 0335 2411106
              </a>
              <Link
                href="/contact"
                className="my-3 rounded-full bg-teal text-white text-center text-sm font-semibold px-4 py-2.5"
              >
                Book a visit
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
