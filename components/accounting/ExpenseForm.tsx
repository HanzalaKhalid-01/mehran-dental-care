"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { OfflineNotice } from "@/components/offline/OfflineNotice";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";

type Category = { id: string; name: string };

export function ExpenseForm() {
  const router = useRouter();
  const { isOffline } = useOnlineStatus();
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("expense_categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        setCategories(data ?? []);
        if (data && data.length > 0) setCategoryId(data[0].id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOffline) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("expenses").insert({
      description,
      amount: Number(amount),
      category_id: categoryId || null,
      paid_at: new Date().toISOString(),
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setDescription("");
    setAmount("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Dental supplies"
        />
        <Input
          label="Amount (Rs.)"
          required
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>
      <OfflineNotice />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" loading={saving} disabled={isOffline}>
        {saving ? "Saving..." : "Add Expense"}
      </Button>
    </form>
  );
}
