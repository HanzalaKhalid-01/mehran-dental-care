import { createClient } from "@/lib/supabase/server";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { AppointmentStatusSelect } from "@/components/appointments/AppointmentStatusSelect";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar } from "lucide-react";

async function getAppointments() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, notes, patients(full_name, phone)")
    .order("scheduled_at", { ascending: true });
  return data ?? [];
}

async function getPatients() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("id, full_name")
    .order("full_name");
  return data ?? [];
}

export default async function AppointmentsPage() {
  let appointments: any[] = [];
  let patients: { id: string; full_name: string }[] = [];
  try {
    [appointments, patients] = await Promise.all([getAppointments(), getPatients()]);
  } catch {
    // Supabase not configured yet.
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Book and manage clinic appointments"
      />

      <Card>
        <CardHeader>
          <CardTitle>Book Appointment</CardTitle>
        </CardHeader>
        <AppointmentForm patients={patients} />
      </Card>

      {appointments.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={<Calendar className="h-5 w-5" />}
            title="No appointments yet"
            description="Book your first appointment above."
          />
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {appointments.map((a) => (
              <Card key={a.id} padding="sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.patients?.full_name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {new Date(a.scheduled_at).toLocaleString()}
                  </p>
                  {a.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{a.notes}</p>
                  )}
                </div>
                <div className="mt-3">
                  <AppointmentStatusSelect id={a.id} status={a.status} />
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border">
                  {a.patients?.phone && (
                    <WhatsAppButton
                      phone={a.patients.phone}
                      template="appointmentReminder"
                      args={[
                        a.patients.full_name,
                        new Date(a.scheduled_at).toLocaleString(),
                      ]}
                      label="Remind"
                    />
                  )}
                  <DeleteButton
                    table="appointments"
                    id={a.id}
                    confirmLabel="this appointment"
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <Card padding="none" className="hidden sm:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left font-medium text-muted-foreground px-5 py-3">
                      Patient
                    </th>
                    <th className="text-left font-medium text-muted-foreground px-5 py-3">
                      Date & time
                    </th>
                    <th className="text-left font-medium text-muted-foreground px-5 py-3">
                      Status
                    </th>
                    <th className="text-right font-medium text-muted-foreground px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{a.patients?.full_name}</p>
                        {a.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{a.notes}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {new Date(a.scheduled_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <AppointmentStatusSelect id={a.id} status={a.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {a.patients?.phone && (
                            <WhatsAppButton
                              phone={a.patients.phone}
                              template="appointmentReminder"
                              args={[
                                a.patients.full_name,
                                new Date(a.scheduled_at).toLocaleString(),
                              ]}
                              label="Remind"
                            />
                          )}
                          <DeleteButton
                            table="appointments"
                            id={a.id}
                            confirmLabel="this appointment"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
