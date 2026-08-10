"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Patient } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { OfflineNotice } from "@/components/offline/OfflineNotice";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";

export function PatientForm({ patient }: { patient?: Patient }) {
  const router = useRouter();
  const { isOffline } = useOnlineStatus();
  const isEdit = Boolean(patient);
  const [fullName, setFullName] = useState(patient?.full_name ?? "");
  const [phone, setPhone] = useState(patient?.phone ?? "");
  const [dob, setDob] = useState(patient?.dob ?? "");
  const [gender, setGender] = useState(patient?.gender ?? "");
  const [address, setAddress] = useState(patient?.address ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOffline) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      full_name: fullName,
      phone,
      dob: dob || null,
      gender: gender || null,
      address: address || null,
    };

    const { error: saveError } = isEdit
      ? await supabase.from("patients").update(payload).eq("id", patient!.id)
      : await supabase.from("patients").insert(payload);

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    router.push("/portal/patients");
    router.refresh();
  }

  return (
    <Card className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date of birth"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
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
        </div>

        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Optional"
        />

        <OfflineNotice />
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={saving} disabled={isOffline}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add patient"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/portal/patients")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
