import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { WalkInForm } from "@/components/walk-in/WalkInForm";

async function getPatients() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("id, full_name, phone")
    .order("full_name");
  return data ?? [];
}

export default async function WalkInPage() {
  let patients: { id: string; full_name: string; phone: string }[] = [];
  try {
    patients = await getPatients();
  } catch {
    // Supabase not configured
  }

  return (
    <div>
      <PageHeader
        title="Walk-in Visit"
        description="Create a patient and invoice in one step — ideal for patients who arrive without a prior appointment."
      />
      <WalkInForm existingPatients={patients} />
    </div>
  );
}
