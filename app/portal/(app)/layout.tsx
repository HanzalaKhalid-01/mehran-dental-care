import Link from "next/link";
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar (desktop) / top bar (mobile) */}
        <aside className="md:w-56 md:min-h-screen bg-[#1E3A5F] text-white">
          <div className="px-4 py-4 font-semibold text-lg border-b border-white/10">
            Mehran Dental Care
          </div>
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-3 text-sm whitespace-nowrap hover:bg-white/10 transition border-b border-white/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <SignOutButton />
        </aside>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
