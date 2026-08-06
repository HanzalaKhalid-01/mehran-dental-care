import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import type { Patient } from "@/types/database";

async function getPatients(): Promise<Patient[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function PatientsPage() {
  let patients: Patient[] = [];
  try {
    patients = await getPatients();
  } catch {
    // Supabase not configured yet.
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Patients</h1>
        <Link
          href="/portal/patients/new"
          className="rounded-md bg-[#0EA5A4] text-white px-4 py-2 text-sm font-medium"
        >
          + Add Patient
        </Link>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          No patients yet. Add your first patient, or connect Supabase if you haven't yet
          (see README).
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="sm:hidden space-y-3">
            {patients.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/portal/patients/${p.id}`}
                      className="font-medium text-[#0EA5A4] hover:underline block truncate"
                    >
                      {p.full_name}
                    </Link>
                    <p className="text-sm text-slate-500 mt-0.5">{p.phone}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-slate-100">
                  <WhatsAppButton
                    phone={p.phone}
                    template="appointmentReminder"
                    args={[p.full_name, "your next visit"]}
                    label="Remind"
                  />
                  <Link
                    href={`/portal/patients/${p.id}/edit`}
                    className="text-xs rounded-md border border-slate-300 px-2.5 py-1.5 font-medium hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <DeleteButton table="patients" id={p.id} confirmLabel={p.full_name} />
                </div>
              </div>
            ))}
          </div>

          {/* Tablet/desktop: table */}
          <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Added</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/portal/patients/${p.id}`} className="hover:underline text-[#0EA5A4]">
                        {p.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{p.phone}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <WhatsAppButton
                          phone={p.phone}
                          template="appointmentReminder"
                          args={[p.full_name, "your next visit"]}
                          label="Remind"
                        />
                        <Link
                          href={`/portal/patients/${p.id}/edit`}
                          className="text-xs rounded-md border border-slate-300 px-2 py-1 font-medium hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                        <DeleteButton table="patients" id={p.id} confirmLabel={p.full_name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
