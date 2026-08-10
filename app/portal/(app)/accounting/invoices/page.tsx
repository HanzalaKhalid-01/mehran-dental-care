import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/accounting/InvoiceForm";
import { RecordPaymentButton } from "@/components/accounting/RecordPaymentButton";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { PageHeader } from "@/components/ui/PageHeader";

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
      <PageHeader
        title="Invoices"
        description="Create and manage patient invoices"
      />

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-medium mb-3">New Invoice</h2>
        <InvoiceForm patients={patients} />
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-3">
        {invoices.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            No invoices yet.
          </div>
        )}
        {invoices.map((inv) => (
          <div key={inv.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{inv.patients?.full_name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{inv.invoice_no}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-medium whitespace-nowrap">Rs. {Number(inv.total).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{inv.status}</p>
              </div>
            </div>
            {inv.status !== "paid" && (
              <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border">
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
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tablet/desktop: table */}
      <div className="hidden sm:block bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-background text-left text-muted-foreground">
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
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No invoices yet.
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-border">
                <td className="px-4 py-3">{inv.invoice_no}</td>
                <td className="px-4 py-3 font-medium">{inv.patients?.full_name}</td>
                <td className="px-4 py-3 text-right">Rs. {Number(inv.total).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{inv.status}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
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
