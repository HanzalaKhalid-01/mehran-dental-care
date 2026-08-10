import { PatientForm } from "@/components/patients/PatientForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewPatientPage() {
  return (
    <div>
      <PageHeader
        title="Add Patient"
        description="Register a new patient in the clinic system"
      />
      <PatientForm />
    </div>
  );
}
