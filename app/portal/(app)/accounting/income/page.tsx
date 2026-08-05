import { createClient } from "@/lib/supabase/server";

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
      <h1 className="text-xl font-semibold">Income</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm text-slate-500">Total recorded income</p>
        <p className="text-2xl font-semibold text-[#1E3A5F]">Rs. {total.toLocaleString()}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
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
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No income recorded yet.
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
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
