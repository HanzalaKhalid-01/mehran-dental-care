"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { UserPlus, Receipt, CheckCircle2 } from "lucide-react";
import { OfflineNotice } from "@/components/offline/OfflineNotice";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";

type PatientOption = { id: string; full_name: string; phone: string };

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "bank", label: "Bank Transfer" },
];

export function WalkInForm({ existingPatients }: { existingPatients: PatientOption[] }) {
  const router = useRouter();
  const { isOffline } = useOnlineStatus();
  const [mode, setMode] = useState<"new" | "existing">("new");

  // Patient fields
  const [patientId, setPatientId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  // Invoice fields
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [markPaid, setMarkPaid] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOffline) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    let finalPatientId = patientId;

    try {
      // 1. Create or use existing patient
      if (mode === "new") {
        if (!fullName.trim() || !phone.trim()) {
          setError("Patient name and phone are required.");
          setSaving(false);
          return;
        }
        const { data: newPatient, error: patientError } = await supabase
          .from("patients")
          .insert({
            full_name: fullName.trim(),
            phone: phone.trim(),
            gender: gender || null,
            dob: dob || null,
          })
          .select("id")
          .single();

        if (patientError || !newPatient) {
          setError(patientError?.message ?? "Could not create patient");
          setSaving(false);
          return;
        }
        finalPatientId = newPatient.id;
      } else {
        if (!patientId) {
          setError("Please select an existing patient.");
          setSaving(false);
          return;
        }
      }

      // 2. Create invoice
      const total = Number(amount);
      if (!description.trim() || !total || total <= 0) {
        setError("Treatment description and a valid amount are required.");
        setSaving(false);
        return;
      }

      const invoiceNo = `INV-${Date.now()}`;
      const status = markPaid ? "paid" : "unpaid";

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          patient_id: finalPatientId,
          invoice_no: invoiceNo,
          subtotal: total,
          discount: 0,
          tax: 0,
          total,
          status,
        })
        .select("id")
        .single();

      if (invoiceError || !invoice) {
        setError(invoiceError?.message ?? "Could not create invoice");
        setSaving(false);
        return;
      }

      // 3. Invoice line item
      await supabase.from("invoice_items").insert({
        invoice_id: invoice.id,
        description: description.trim(),
        qty: 1,
        unit_price: total,
        line_total: total,
      });

      // 4. Record payment if marked paid
      if (markPaid) {
        await supabase.from("payments").insert({
          invoice_id: invoice.id,
          amount: total,
          method: paymentMethod,
          paid_at: new Date().toISOString(),
        });
      }

      setSuccess(
        markPaid
          ? `Patient & paid invoice ${invoiceNo} created successfully.`
          : `Patient & unpaid invoice ${invoiceNo} created.`
      );

      // Reset form for next walk-in
      setFullName("");
      setPhone("");
      setGender("");
      setDob("");
      setPatientId("");
      setDescription("");
      setAmount("");
      setMarkPaid(true);
      setPaymentMethod("cash");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="h-4 w-4" />
            </div>
            <CardTitle>Patient</CardTitle>
          </div>
        </CardHeader>

        {/* Mode switch */}
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`flex-1 h-9 rounded-xl text-sm font-medium transition-colors ${
              mode === "new"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            New patient
          </button>
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`flex-1 h-9 rounded-xl text-sm font-medium transition-colors ${
              mode === "existing"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Existing patient
          </button>
        </div>

        {mode === "new" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ayesha Khan"
            />
            <Input
              label="Phone (WhatsApp)"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XXXXXXXXX"
            />
            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: "", label: "Prefer not to say" },
                { value: "female", label: "Female" },
                { value: "male", label: "Male" },
                { value: "other", label: "Other" },
              ]}
            />
            <Input
              label="Date of birth"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        ) : (
          <Select
            label="Select patient"
            required
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Choose a patient..."
            options={existingPatients.map((p) => ({
              value: p.id,
              label: `${p.full_name} — ${p.phone}`,
            }))}
          />
        )}
      </Card>

      {/* Invoice section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
            <CardTitle>Treatment & Invoice</CardTitle>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Treatment / Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Scaling & polishing, Root canal — tooth 16"
            />
          </div>
          <Input
            label="Amount (Rs.)"
            required
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 3500"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Payment status</label>
            <div className="flex items-center gap-3 h-10">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markPaid}
                  onChange={(e) => setMarkPaid(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">Mark as paid now</span>
              </label>
            </div>
          </div>
          {markPaid && (
            <Select
              label="Payment method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={PAYMENT_METHODS}
            />
          )}
        </div>
      </Card>

      <OfflineNotice />

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving} size="lg" disabled={isOffline}>
          {saving ? "Saving..." : markPaid ? "Create patient & record payment" : "Create patient & invoice"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/portal/dashboard")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
