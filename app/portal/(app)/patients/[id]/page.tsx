import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: patient }, { data: appointments }, { data: invoices }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", id).single(),
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, notes")
      .eq("patient_id", id)
      .order("scheduled_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_no, total, status, issued_at")
      .eq("patient_id", id)
      .order("issued_at", { ascending: false }),
  ]);

  if (!patient) notFound();

  const totalBilled = (invoices ?? []).reduce((sum, i) => sum + Number(i.total), 0);
  const totalOutstanding = (invoices ?? [])
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{patient.full_name}</h1>
          <p className="text-sm text-slate-500 mt-1">{patient.phone}</p>
        </div>
        <div className="flex gap-2">
          <WhatsAppButton
            phone={patient.phone}
            template="appointmentReminder"
            args={[patient.full_name, "your next visit"]}
            label="Message"
          />
          <Link
            href={`/portal/patients/${patient.id}/edit`}
            className="text-sm rounded-md border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-50"
          >
            Edit Details
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Date of birth</p>
          <p className="font-medium">{patient.dob ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Gender</p>
          <p className="font-medium capitalize">{patient.gender ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total billed</p>
          <p className="font-medium">Rs. {totalBilled.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Outstanding</p>
          <p className="font-medium text-red-600">Rs. {totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {patient.address && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Address</p>
          <p className="text-sm">{patient.address}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-medium mb-3">Visit History (Appointments)</h2>
        {(!appointments || appointments.length === 0) ? (
          <p className="text-sm text-slate-500">No appointments recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {appointments.map((a) => (
              <li key={a.id} className="py-2.5 flex items-center justify-between text-sm">
                <span>{new Date(a.scheduled_at).toLocaleString()}</span>
                <span className="capitalize text-slate-500">{a.status.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-medium mb-3">Invoices</h2>
        {(!invoices || invoices.length === 0) ? (
          <p className="text-sm text-slate-500">No invoices yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <li key={inv.id} className="py-2.5 flex items-center justify-between text-sm">
                <span>{inv.invoice_no} — {new Date(inv.issued_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-3">
                  <span>Rs. {Number(inv.total).toLocaleString()}</span>
                  <span className="capitalize text-slate-500">{inv.status}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
