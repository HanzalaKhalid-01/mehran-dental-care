import { PatientForm } from "@/components/patients/PatientForm";

export default function NewPatientPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Add Patient</h1>
      <PatientForm />
    </div>
  );
}
