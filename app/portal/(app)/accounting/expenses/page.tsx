import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "@/components/accounting/ExpenseForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import type { Expense } from "@/types/database";

async function getExpenses() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("*, expense_categories(name)")
    .order("paid_at", { ascending: false });
  return data ?? [];
}

export default async function ExpensesPage() {
  let expenses: (Expense & { expense_categories: { name: string } | null })[] = [];
  try {
    expenses = await getExpenses();
  } catch {
    // Supabase not configured yet.
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Expenses</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-medium mb-3">Add Expense</h2>
        <ExpenseForm />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No expenses recorded yet.
                </td>
              </tr>
            )}
            {expenses.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{new Date(e.paid_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">{e.expense_categories?.name ?? "—"}</td>
                <td className="px-4 py-3">{e.description}</td>
                <td className="px-4 py-3 text-right">Rs. {Number(e.amount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <DeleteButton table="expenses" id={e.id} confirmLabel="this expense" />
                </td>
              </tr>
            ))}
          </tbody>
          {expenses.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 font-medium">
                <td className="px-4 py-3" colSpan={2}>
                  Total
                </td>
                <td className="px-4 py-3 text-right">Rs. {total.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
