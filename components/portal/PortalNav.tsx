"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";

const navItems = [
  { href: "/portal/dashboard", label: "Dashboard" },
  { href: "/portal/patients", label: "Patients" },
  { href: "/portal/appointments", label: "Appointments" },
  { href: "/portal/accounting/income", label: "Income" },
  { href: "/portal/accounting/expenses", label: "Expenses" },
  { href: "/portal/accounting/invoices", label: "Invoices" },
  { href: "/portal/accounting/reports", label: "Reports" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`px-4 py-3.5 md:py-3 text-sm font-medium border-b border-white/5 transition ${
              active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PortalNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer automatically whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent background scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-[#1E3A5F] text-white px-4 h-14 shadow-sm">
        <span className="font-semibold text-base">Mehran Dental Care</span>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="p-2 -mr-2 rounded-md hover:bg-white/10 active:bg-white/20 transition"
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

      {/* Mobile drawer + backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div
          className={`absolute top-0 left-0 h-full w-72 max-w-[80%] bg-[#1E3A5F] shadow-xl flex flex-col transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-4 py-4 font-semibold text-lg text-white border-b border-white/10">
            Mehran Dental Care
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <SignOutButton />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block md:w-56 md:min-h-screen bg-[#1E3A5F] text-white">
        <div className="px-4 py-4 font-semibold text-lg border-b border-white/10">
          Mehran Dental Care
        </div>
        <NavLinks />
        <SignOutButton />
      </aside>
    </>
  );
}
