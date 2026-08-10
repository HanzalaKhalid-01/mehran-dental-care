import { createClient } from "@/lib/supabase/server";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

type ActionItem = {
  id: string;
  patientName: string;
  phone: string;
  detail: string;
  template: "appointmentReminder" | "paymentReminder" | "reviewRequest" | "missedAppointment";
  args: string[];
  label: string;
};

async function getTodaysActions(): Promise<ActionItem[]> {
  const supabase = await createClient();
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const endOfTomorrow = new Date(startOfTomorrow);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
  const threeDaysAgo = new Date(startOfToday);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [{ data: upcoming }, { data: overdueInvoices }, { data: recentAppts }] = await Promise.all([
    // Appointments happening tomorrow that still need a reminder
    supabase
      .from("appointments")
      .select("id, scheduled_at, patients(full_name, phone)")
      .in("status", ["booked", "confirmed"])
      .gte("scheduled_at", startOfTomorrow.toISOString())
      .lt("scheduled_at", endOfTomorrow.toISOString()),

    // Unpaid/partial invoices older than 7 days
    supabase
      .from("invoices")
      .select("id, total, issued_at, patients(full_name, phone)")
      .in("status", ["unpaid", "partial"])
      .lt("issued_at", sevenDaysAgo.toISOString()),

    // Completed or no-show appointments in the last 3 days
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, patients(full_name, phone)")
      .in("status", ["completed", "no_show"])
      .gte("scheduled_at", threeDaysAgo.toISOString())
      .lt("scheduled_at", startOfToday.toISOString()),
  ]);

  const actions: ActionItem[] = [];

  (upcoming ?? []).forEach((a: any) => {
    if (!a.patients?.phone) return;
    actions.push({
      id: `reminder-${a.id}`,
      patientName: a.patients.full_name,
      phone: a.patients.phone,
      detail: `Appointment tomorrow at ${new Date(a.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      template: "appointmentReminder",
      args: [a.patients.full_name, new Date(a.scheduled_at).toLocaleString()],
      label: "Send reminder",
    });
  });

  (overdueInvoices ?? []).forEach((inv: any) => {
    if (!inv.patients?.phone) return;
    const daysOverdue = Math.floor((now.getTime() - new Date(inv.issued_at).getTime()) / 86400000);
    actions.push({
      id: `payment-${inv.id}`,
      patientName: inv.patients.full_name,
      phone: inv.patients.phone,
      detail: `Rs. ${Number(inv.total).toLocaleString()} outstanding, ${daysOverdue} days`,
      template: "paymentReminder",
      args: [inv.patients.full_name, String(inv.total)],
      label: "Send reminder",
    });
  });

  (recentAppts ?? []).forEach((a: any) => {
    if (!a.patients?.phone) return;
    if (a.status === "completed") {
      actions.push({
        id: `review-${a.id}`,
        patientName: a.patients.full_name,
        phone: a.patients.phone,
        detail: `Visited ${new Date(a.scheduled_at).toLocaleDateString()} — ask for a review`,
        template: "reviewRequest",
        args: [a.patients.full_name],
        label: "Ask for review",
      });
    } else if (a.status === "no_show") {
      actions.push({
        id: `missed-${a.id}`,
        patientName: a.patients.full_name,
        phone: a.patients.phone,
        detail: `Missed appointment on ${new Date(a.scheduled_at).toLocaleDateString()}`,
        template: "missedAppointment",
        args: [a.patients.full_name],
        label: "Follow up",
      });
    }
  });

  return actions;
}

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
  let actions: ActionItem[] = [];
  try {
    [stats, actions] = await Promise.all([getStats(), getTodaysActions()]);
  } catch {
    // Supabase env vars not set yet — show zeros/empty instead of crashing.
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Today&apos;s Actions</h2>
          {actions.length > 0 && (
            <span className="text-xs font-medium bg-[#F2A93B]/15 text-[#B8790C] rounded-full px-2.5 py-1">
              {actions.length} to follow up
            </span>
          )}
        </div>

        {actions.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nothing needs follow-up today. Appointment reminders, overdue-payment
            nudges, review requests, and missed-appointment follow-ups will appear
            here automatically as patients and appointments are added.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {actions.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1E3A5F] truncate">{a.patientName}</p>
                  <p className="text-xs text-slate-500">{a.detail}</p>
                </div>
                <WhatsAppButton phone={a.phone} template={a.template} args={a.args} label={a.label} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
