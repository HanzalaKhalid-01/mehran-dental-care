"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";

const STATUSES = ["booked", "confirmed", "completed", "cancelled", "no_show"] as const;

const statusColors: Record<string, string> = {
  booked: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  no_show: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AppointmentStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const { isOffline } = useOnlineStatus();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (isOffline) return;
    const newStatus = e.target.value;
    setValue(newStatus);
    setSaving(true);

    const supabase = createClient();
    await supabase.from("appointments").update({ status: newStatus }).eq("id", id);

    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={saving || isOffline}
      title={isOffline ? "Connect to the internet to update status" : undefined}
      className={`
        text-xs font-medium rounded-lg border px-2.5 py-1.5 capitalize
        transition-colors disabled:opacity-50 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-ring/30
        ${statusColors[value] ?? statusColors.booked}
      `}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
