"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function InvoiceForm({ patients }: { patients: { id: string; full_name: string }[] }) {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const invoiceNo = `INV-${Date.now()}`;
    const total = Number(amount);

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        patient_id: patientId,
        invoice_no: invoiceNo,
        subtotal: total,
        discount: 0,
        tax: 0,
        total,
        status: "unpaid",
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      setSaving(false);
      setError(invoiceError?.message ?? "Could not create invoice");
      return;
    }

    await supabase.from("invoice_items").insert({
      invoice_id: invoice.id,
      description,
      qty: 1,
      unit_price: total,
      line_total: total,
    });

    setSaving(false);
    setPatientId("");
    setDescription("");
    setAmount("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div>
        <label className="block text-sm font-medium mb-1">Patient *</label>
        <select
          required
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Treatment / description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="e.g. Scaling"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Amount (Rs.) *</label>
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving || patients.length === 0}
        className="rounded-md bg-[#0EA5A4] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 h-fit"
      >
        {saving ? "Creating..." : "Create Invoice"}
      </button>
      {error && <p className="text-sm text-red-600 col-span-full">{error}</p>}
    </form>
  );
}
