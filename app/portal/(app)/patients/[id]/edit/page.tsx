import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PatientForm } from "@/components/patients/PatientForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (!patient) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Patient"
        description={`Updating record for ${patient.full_name}`}
      />
      <PatientForm patient={patient} />
    </div>
  );
}
