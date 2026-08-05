import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PatientForm } from "@/components/patients/PatientForm";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: patient } = await supabase.from("patients").select("*").eq("id", id).single();

  if (!patient) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit Patient</h1>
      <PatientForm patient={patient} />
    </div>
  );
}
