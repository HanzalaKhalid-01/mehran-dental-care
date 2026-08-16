/**
 * Offline operation queue backed by localStorage.
 *
 * Supported operation types:
 *  - "appointment" : single insert into `appointments`
 *  - "walk_in"     : patient (possibly new) + invoice + items + optional payment
 *
 * Each entry is self-contained — it carries every field needed to replay
 * the operation server-side when connectivity is restored.
 */

import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentOp = {
  type: "appointment";
  patientId: string;
  scheduledAt: string;
  notes: string | null;
};

export type WalkInOp = {
  type: "walk_in";
  // patient
  mode: "new" | "existing";
  patientId: string;      // existing patient id OR empty string for new
  fullName: string;
  phone: string;
  gender: string;
  dob: string;
  // invoice
  description: string;
  amount: number;
  markPaid: boolean;
  paymentMethod: string;
};

export type OpData = AppointmentOp | WalkInOp;

export type QueueEntry = {
  id: string;
  label: string;       // human-readable summary shown in the banner
  createdAt: number;
  data: OpData;
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

const KEY = "mdc_offline_queue";

export function readQueue(): QueueEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as QueueEntry[];
  } catch {
    return [];
  }
}

function writeQueue(q: QueueEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function enqueue(label: string, data: OpData): QueueEntry {
  const entry: QueueEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    createdAt: Date.now(),
    data,
  };
  writeQueue([...readQueue(), entry]);
  return entry;
}

function removeEntry(id: string) {
  writeQueue(readQueue().filter((e) => e.id !== id));
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

/**
 * Replays all queued operations against Supabase in chronological order.
 * Successfully replayed entries are removed from the queue.
 * Entries that fail are left in place for the next attempt.
 *
 * Returns { synced, failed }.
 */
export async function flushQueue(): Promise<{ synced: number; failed: number }> {
  const queue = readQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  const supabase = createClient();
  let synced = 0;
  let failed = 0;

  for (const entry of queue) {
    try {
      if (entry.data.type === "appointment") {
        const { error } = await supabase.from("appointments").insert({
          patient_id: entry.data.patientId,
          scheduled_at: entry.data.scheduledAt,
          status: "booked",
          notes: entry.data.notes,
        });
        if (error) throw error;
      } else if (entry.data.type === "walk_in") {
        const d = entry.data;
        let finalPatientId = d.patientId;

        // Create new patient if needed
        if (d.mode === "new") {
          const { data: patient, error } = await supabase
            .from("patients")
            .insert({ full_name: d.fullName, phone: d.phone, gender: d.gender || null, dob: d.dob || null })
            .select("id")
            .single();
          if (error || !patient) throw error ?? new Error("Patient insert failed");
          finalPatientId = patient.id;
        }

        const invoiceNo = `INV-${entry.createdAt}`;
        const { data: invoice, error: invError } = await supabase
          .from("invoices")
          .insert({
            patient_id: finalPatientId,
            invoice_no: invoiceNo,
            subtotal: d.amount,
            discount: 0,
            tax: 0,
            total: d.amount,
            status: d.markPaid ? "paid" : "unpaid",
          })
          .select("id")
          .single();
        if (invError || !invoice) throw invError ?? new Error("Invoice insert failed");

        await supabase.from("invoice_items").insert({
          invoice_id: invoice.id,
          description: d.description,
          qty: 1,
          unit_price: d.amount,
          line_total: d.amount,
        });

        if (d.markPaid) {
          await supabase.from("payments").insert({
            invoice_id: invoice.id,
            amount: d.amount,
            method: d.paymentMethod,
            paid_at: new Date(entry.createdAt).toISOString(),
          });
        }
      }

      removeEntry(entry.id);
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
