"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";

export function RecordPaymentButton({
  invoiceId,
  total,
}: {
  invoiceId: string;
  total: number;
}) {
  const router = useRouter();
  const { isOffline } = useOnlineStatus();
  const [saving, setSaving] = useState(false);

  async function handlePay() {
    if (isOffline) return;
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
    <Button
      size="sm"
      onClick={handlePay}
      loading={saving}
      disabled={isOffline}
      title={isOffline ? "Connect to the internet to record payment" : undefined}
    >
      {saving ? "Recording..." : "Mark Paid (Cash)"}
    </Button>
  );
}
