"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { OfflineNotice } from "@/components/offline/OfflineNotice";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";

export function InvoiceForm({
  patients,
}: {
  patients: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const { isOffline } = useOnlineStatus();
  const [patientId, setPatientId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOffline) return;
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Patient"
          required
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Select patient"
          options={patients.map((p) => ({ value: p.id, label: p.full_name }))}
        />
        <Input
          label="Treatment / description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Scaling"
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
      </div>
      <OfflineNotice />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" loading={saving} disabled={patients.length === 0 || isOffline}>
        {saving ? "Creating..." : "Create Invoice"}
      </Button>
    </form>
  );
}
