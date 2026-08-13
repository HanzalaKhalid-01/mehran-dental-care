"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  Receipt,
  FileText,
  BarChart3,
  UserPlus,
  Star,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navItems = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/walk-in", label: "Walk-in", icon: UserPlus },
  { href: "/portal/patients", label: "Patients", icon: Users },
  { href: "/portal/appointments", label: "Appointments", icon: Calendar },
  { href: "/portal/accounting/income", label: "Income", icon: Wallet },
  { href: "/portal/accounting/expenses", label: "Expenses", icon: Receipt },
  { href: "/portal/accounting/invoices", label: "Invoices", icon: FileText },
  { href: "/portal/accounting/reports", label: "Reports", icon: BarChart3 },
  { href: "/portal/reviews", label: "Reviews", icon: Star },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-2">
      {navItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/portal/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`
              group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
              ${
                active
                  ? "bg-sidebar-hover text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground"
              }
            `}
          >
            <Icon
              className={`h-4.5 w-4.5 shrink-0 ${active ? "text-primary" : "opacity-80 group-hover:opacity-100"}`}
              strokeWidth={active ? 2.25 : 2}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function PortalNav() {
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
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-sidebar text-sidebar-foreground px-4 h-14 shadow-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="p-2 -ml-2 rounded-lg hover:bg-sidebar-hover transition"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-semibold text-sm tracking-tight">Mehran Dental</span>
        </div>
        <ThemeToggle variant="sidebar" />
      </div>

      {/* Mobile drawer + backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div
          className={`absolute top-0 left-0 h-full w-72 max-w-[85%] bg-sidebar shadow-xl flex flex-col transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-5 py-5 border-b border-white/8">
            <p className="font-display font-bold text-base text-sidebar-foreground tracking-tight">
              Mehran Dental<span className="text-primary">.</span>
            </p>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">Clinic Portal</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t border-white/8 p-2">
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:min-h-screen bg-sidebar text-sidebar-foreground border-r border-white/5">
        <div className="px-5 py-5 border-b border-white/8">
          <p className="font-display font-bold text-base tracking-tight">
            Mehran Dental<span className="text-primary">.</span>
          </p>
          <p className="text-xs text-sidebar-foreground/50 mt-0.5">Clinic Portal</p>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          <NavLinks />
        </div>
        <div className="border-t border-white/8 p-2">
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
