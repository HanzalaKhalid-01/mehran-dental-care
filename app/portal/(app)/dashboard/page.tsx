import { createClient } from "@/lib/supabase/server";

async function getStats() {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ data: todayPayments }, { data: appts }, { data: unpaidInvoices }] =
    await Promise.all([
      supabase.from("payments").select("amount").gte("paid_at", todayStart.toISOString()),
      supabase
        .from("appointments")
        .select("id, status")
        .gte("scheduled_at", todayStart.toISOString()),
      supabase.from("invoices").select("total").in("status", ["unpaid", "partial"]),
    ]);

  const todayRevenue = (todayPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const patientsToday = (appts ?? []).length;
  const pending = (appts ?? []).filter((a) => a.status === "booked" || a.status === "confirmed").length;
  const outstanding = (unpaidInvoices ?? []).reduce((sum, i) => sum + Number(i.total), 0);

  return { todayRevenue, patientsToday, pending, outstanding };
}

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm min-w-0">
    <p className="text-xs sm:text-sm text-slate-500 truncate">{label}</p>
    <p className="text-xl sm:text-2xl font-semibold mt-1 text-[#1E3A5F] truncate">{value}</p>
  </div>
);

export default async function DashboardPage() {
  // Falls back gracefully if Supabase isn't configured yet.
  let stats = { todayRevenue: 0, patientsToday: 0, pending: 0, outstanding: 0 };
  try {
    stats = await getStats();
  } catch {
    // Supabase env vars not set yet — show zeros instead of crashing.
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={`Rs. ${stats.todayRevenue.toLocaleString()}`} />
        <StatCard label="Patients Today" value={String(stats.patientsToday)} />
        <StatCard label="Pending Appointments" value={String(stats.pending)} />
        <StatCard label="Outstanding Dues" value={`Rs. ${stats.outstanding.toLocaleString()}`} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-medium mb-2">Today's Actions</h2>
        <p className="text-sm text-slate-500">
          Reminders, follow-ups, and overdue-payment nudges will appear here once patients
          and appointments are added — each with a one-tap WhatsApp button.
        </p>
      </div>
    </div>
  );
}
