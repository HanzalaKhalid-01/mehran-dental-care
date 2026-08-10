import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "@/components/accounting/ExpenseForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import type { Expense } from "@/types/database";
import { PageHeader } from "@/components/ui/PageHeader";

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
      <PageHeader
        title="Expenses"
        description="Track clinic operating expenses"
      />

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-medium mb-3">Add Expense</h2>
        <ExpenseForm />
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-3">
        {expenses.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            No expenses recorded yet.
          </div>
        )}
        {expenses.map((e) => (
          <div key={e.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{e.expense_categories?.name ?? "—"}</p>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{e.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(e.paid_at).toLocaleDateString()}
                </p>
              </div>
              <p className="font-medium whitespace-nowrap shrink-0">
                Rs. {Number(e.amount).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border">
              <DeleteButton table="expenses" id={e.id} confirmLabel="this expense" />
            </div>
          </div>
        ))}
        {expenses.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between font-medium">
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Tablet/desktop: table */}
      <div className="hidden sm:block bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-background text-left text-muted-foreground">
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
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No expenses recorded yet.
                </td>
              </tr>
            )}
            {expenses.map((e) => (
              <tr key={e.id} className="border-t border-border">
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
              <tr className="border-t border-border font-medium">
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
