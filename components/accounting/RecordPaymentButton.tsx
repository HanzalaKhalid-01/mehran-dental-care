"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RecordPaymentButton({ invoiceId, total }: { invoiceId: string; total: number }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handlePay() {
    setSaving(true);
    const supabase = createClient();

    await supabase.from("payments").insert({
      invoice_id: invoiceId,
      amount: total,
      method: "cash",
      paid_at: new Date().toISOString(),
    });

    await supabase.from("invoices").update({ status: "paid" }).eq("id", invoiceId);

    setSaving(false);
    router.refresh();
  }

  return (
    <button
      onClick={handlePay}
      disabled={saving}
      className="rounded-md bg-[#0EA5A4] text-white px-3 py-1.5 text-sm font-medium disabled:opacity-50"
    >
      {saving ? "Recording..." : "Mark Paid (Cash)"}
    </button>
  );
}
