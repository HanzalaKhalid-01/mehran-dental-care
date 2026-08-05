import { createClient } from "@/lib/supabase/server";
import { ExportButtons } from "@/components/accounting/ExportButtons";

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function getMonthlyPL() {
  const supabase = await createClient();
  const [{ data: payments }, { data: expenses }] = await Promise.all([
    supabase.from("payments").select("amount, paid_at"),
    supabase.from("expenses").select("amount, paid_at"),
  ]);

  const map = new Map<string, { income: number; expenses: number }>();

  (payments ?? []).forEach((p) => {
    const key = monthKey(p.paid_at);
    const entry = map.get(key) ?? { income: 0, expenses: 0 };
    entry.income += Number(p.amount);
    map.set(key, entry);
  });

  (expenses ?? []).forEach((e) => {
    const key = monthKey(e.paid_at);
    const entry = map.get(key) ?? { income: 0, expenses: 0 };
    entry.expenses += Number(e.amount);
    map.set(key, entry);
  });

  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([label, v]) => ({ label, income: v.income, expenses: v.expenses, profit: v.income - v.expenses }));
}

export default async function ReportsPage() {
  let rows: { label: string; income: number; expenses: number; profit: number }[] = [];
  try {
    rows = await getMonthlyPL();
  } catch {
    // Supabase not configured yet.
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reports — Profit &amp; Loss</h1>
        <ExportButtons rows={rows} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3 text-right">Income</th>
              <th className="px-4 py-3 text-right">Expenses</th>
              <th className="px-4 py-3 text-right">Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No data yet — record some income and expenses first.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-slate-100">
                <td className="px-4 py-3">{r.label}</td>
                <td className="px-4 py-3 text-right">Rs. {r.income.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">Rs. {r.expenses.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-medium">
                  Rs. {r.profit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
