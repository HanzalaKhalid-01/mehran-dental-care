"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PatientCombobox } from "@/components/ui/PatientCombobox";
import { OfflineNotice } from "@/components/offline/OfflineNotice";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";

export function AppointmentForm({
  patients,
}: {
  patients: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const { isOffline } = useOnlineStatus();
  const [patientId, setPatientId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOffline) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("appointments").insert({
      patient_id: patientId,
      scheduled_at: new Date(dateTime).toISOString(),
      status: "booked",
      notes: notes || null,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setPatientId("");
    setDateTime("");
    setNotes("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PatientCombobox
          label="Patient"
          required
          value={patientId}
          onChange={setPatientId}
          patients={patients}
        />
        <Input
          label="Date & time"
          required
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <OfflineNotice />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" loading={saving} disabled={isOffline}>
        {saving ? "Booking..." : "Book appointment"}
      </Button>
    </form>
  );
}
