import { createClient } from "@/lib/supabase/server";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { AppointmentStatusSelect } from "@/components/appointments/AppointmentStatusSelect";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { DeleteButton } from "@/components/ui/DeleteButton";

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
  const { data } = await supabase.from("patients").select("id, full_name").order("full_name");
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
      <h1 className="text-xl font-semibold">Appointments</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-medium mb-3">Book Appointment</h2>
        <AppointmentForm patients={patients} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Date/Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No appointments yet.
                </td>
              </tr>
            )}
            {appointments.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{a.patients?.full_name}</td>
                <td className="px-4 py-3">{new Date(a.scheduled_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <AppointmentStatusSelect id={a.id} status={a.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.patients?.phone && (
                      <WhatsAppButton
                        phone={a.patients.phone}
                        template="appointmentReminder"
                        args={[a.patients.full_name, new Date(a.scheduled_at).toLocaleString()]}
                        label="Remind"
                      />
                    )}
                    <DeleteButton table="appointments" id={a.id} confirmLabel="this appointment" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
