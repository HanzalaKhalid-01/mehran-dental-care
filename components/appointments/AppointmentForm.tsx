"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PatientCombobox } from "@/components/ui/PatientCombobox";
import { OfflineNotice } from "@/components/offline/OfflineNotice";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";
import { useOfflineQueue } from "@/lib/offline/useOfflineQueue";

export function AppointmentForm({
  patients,
}: {
  patients: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const { isOffline } = useOnlineStatus();
  const { queue } = useOfflineQueue();
  const [patientId, setPatientId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setQueued(false);

    if (isOffline) {
      // Queue for later sync
      const patient = patients.find((p) => p.id === patientId);
      queue(
        `Appointment — ${patient?.full_name ?? "Unknown"} at ${dateTime}`,
        {
          type: "appointment",
          patientId,
          scheduledAt: new Date(dateTime).toISOString(),
          notes: notes || null,
        }
      );
      setPatientId("");
      setDateTime("");
      setNotes("");
      setSaving(false);
      setQueued(true);
      return;
    }

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
      {queued && (
        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
          ✓ Appointment saved offline — it will sync automatically when you reconnect.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" loading={saving}>
        {saving ? "Booking..." : isOffline ? "Save offline" : "Book appointment"}
      </Button>
    </form>
  );
}
