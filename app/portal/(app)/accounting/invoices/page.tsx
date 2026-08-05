import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/accounting/InvoiceForm";
import { RecordPaymentButton } from "@/components/accounting/RecordPaymentButton";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { DeleteButton } from "@/components/ui/DeleteButton";

async function getInvoices() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, invoice_no, total, status, issued_at, patients(full_name, phone)")
    .order("issued_at", { ascending: false });
  return data ?? [];
}

async function getPatients() {
  const supabase = await createClient();
  const { data } = await supabase.from("patients").select("id, full_name").order("full_name");
  return data ?? [];
}

export default async function InvoicesPage() {
  let invoices: any[] = [];
  let patients: { id: string; full_name: string }[] = [];
  try {
    [invoices, patients] = await Promise.all([getInvoices(), getPatients()]);
  } catch {
    // Supabase not configured yet.
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Invoices</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-medium mb-3">New Invoice</h2>
        <InvoiceForm patients={patients} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No invoices yet.
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{inv.invoice_no}</td>
                <td className="px-4 py-3 font-medium">{inv.patients?.full_name}</td>
                <td className="px-4 py-3 text-right">Rs. {Number(inv.total).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{inv.status}</td>
                <td className="px-4 py-3 flex gap-2">
                  {inv.status !== "paid" && (
                    <>
                      <RecordPaymentButton invoiceId={inv.id} total={Number(inv.total)} />
                      {inv.patients?.phone && (
                        <WhatsAppButton
                          phone={inv.patients.phone}
                          template="paymentReminder"
                          args={[inv.patients.full_name, String(inv.total)]}
                          label="Remind"
                        />
                      )}
                      <DeleteButton table="invoices" id={inv.id} confirmLabel={`invoice ${inv.invoice_no}`} />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
