import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";

async function getPayments() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("id, amount, method, paid_at, invoices(invoice_no, patients(full_name))")
    .order("paid_at", { ascending: false });
  return data ?? [];
}

export default async function IncomePage() {
  let payments: any[] = [];
  try {
    payments = await getPayments();
  } catch {
    // Supabase not configured yet.
  }

  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income"
        description="Payments received"
      />

      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground">Total recorded income</p>
        <p className="text-2xl font-semibold text-foreground">Rs. {total.toLocaleString()}</p>
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-3">
        {payments.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            No income recorded yet.
          </div>
        )}
        {payments.map((p) => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.invoices?.patients?.full_name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {p.invoices?.invoice_no} · <span className="capitalize">{p.method}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(p.paid_at).toLocaleDateString()}
                </p>
              </div>
              <p className="font-medium whitespace-nowrap shrink-0">
                Rs. {Number(p.amount).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet/desktop: table */}
      <div className="hidden sm:block bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-background text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No income recorded yet.
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">{new Date(p.paid_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">{p.invoices?.patients?.full_name}</td>
                <td className="px-4 py-3">{p.invoices?.invoice_no}</td>
                <td className="px-4 py-3 capitalize">{p.method}</td>
                <td className="px-4 py-3 text-right">Rs. {Number(p.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
