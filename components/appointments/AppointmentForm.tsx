"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AppointmentForm({ patients }: { patients: { id: string; full_name: string }[] }) {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        <label className="block text-sm font-medium mb-1">Date &amp; time *</label>
        <input
          required
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Optional"
        />
      </div>

      <button
        type="submit"
        disabled={saving || patients.length === 0}
        className="rounded-md bg-[#0EA5A4] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 h-fit"
      >
        {saving ? "Booking..." : "Book"}
      </button>

      {error && <p className="text-sm text-red-600 col-span-full">{error}</p>}
      {patients.length === 0 && (
        <p className="text-sm text-slate-500 col-span-full">Add a patient first to book an appointment.</p>
      )}
    </form>
  );
}
