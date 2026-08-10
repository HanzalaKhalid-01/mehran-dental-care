import { createClient } from "@/lib/supabase/server";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Banknote,
  Users,
  CalendarClock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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
    supabase
      .from("appointments")
      .select("id, scheduled_at, patients(full_name, phone)")
      .in("status", ["booked", "confirmed"])
      .gte("scheduled_at", startOfTomorrow.toISOString())
      .lt("scheduled_at", endOfTomorrow.toISOString()),
    supabase
      .from("invoices")
      .select("id, total, issued_at, patients(full_name, phone)")
      .in("status", ["unpaid", "partial"])
      .lt("issued_at", sevenDaysAgo.toISOString()),
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
    actions.push({
      id: `payment-${inv.id}`,
      patientName: inv.patients.full_name,
      phone: inv.patients.phone,
      detail: `Outstanding Rs. ${Number(inv.total).toLocaleString()}`,
      template: "paymentReminder",
      args: [inv.patients.full_name, String(inv.total)],
      label: "Payment reminder",
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

export default async function DashboardPage() {
  let stats = { todayRevenue: 0, patientsToday: 0, pending: 0, outstanding: 0 };
  let actions: ActionItem[] = [];
  try {
    [stats, actions] = await Promise.all([getStats(), getTodaysActions()]);
  } catch {
    // Supabase env vars not set yet
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Today’s overview and follow-up actions"
        actions={
          <Link href="/portal/walk-in">
            <Button size="md">
              <Sparkles className="h-4 w-4" />
              Walk-in
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Today's Revenue"
          value={`Rs. ${stats.todayRevenue.toLocaleString()}`}
          icon={<Banknote className="h-5 w-5" />}
        />
        <StatCard
          label="Patients Today"
          value={String(stats.patientsToday)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Appointments"
          value={String(stats.pending)}
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <StatCard
          label="Outstanding Dues"
          value={`Rs. ${stats.outstanding.toLocaleString()}`}
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Today&apos;s Actions</CardTitle>
            {actions.length > 0 && (
              <Badge variant="warning">{actions.length} to follow up</Badge>
            )}
          </div>
        </CardHeader>

        {actions.length === 0 ? (
          <EmptyState
            title="Nothing needs follow-up today"
            description="Appointment reminders, overdue-payment nudges, review requests, and missed-appointment follow-ups will appear here automatically."
          />
        ) : (
          <ul className="divide-y divide-border -mx-1">
            {actions.map((a) => (
              <li
                key={a.id}
                className="py-3.5 px-1 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {a.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
                </div>
                <WhatsAppButton
                  phone={a.phone}
                  template={a.template}
                  args={a.args}
                  label={a.label}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
