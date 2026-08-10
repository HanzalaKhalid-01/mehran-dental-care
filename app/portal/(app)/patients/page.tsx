import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users, Plus } from "lucide-react";
import type { Patient } from "@/types/database";

async function getPatients(): Promise<Patient[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function PatientsPage() {
  let patients: Patient[] = [];
  try {
    patients = await getPatients();
  } catch {
    // Supabase not configured yet.
  }

  return (
    <div>
      <PageHeader
        title="Patients"
        description={`${patients.length} patient${patients.length === 1 ? "" : "s"} registered`}
        actions={
          <Link href="/portal/patients/new">
            <Button size="md">
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
          </Link>
        }
      />

      {patients.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No patients yet"
            description="Add your first patient or use Walk-in when someone arrives at the clinic."
            action={
              <Link href="/portal/patients/new">
                <Button size="md">
                  <Plus className="h-4 w-4" />
                  Add Patient
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {patients.map((p) => (
              <Card key={p.id} padding="sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/portal/patients/${p.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {p.full_name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-0.5">{p.phone}</p>
                    {p.gender && (
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{p.gender}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border">
                  <Link href={`/portal/patients/${p.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Link href={`/portal/patients/${p.id}/edit`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                  {p.phone && (
                    <WhatsAppButton
                      phone={p.phone}
                      template="generalInquiry"
                      args={[]}
                      label="WhatsApp"
                    />
                  )}
                  <DeleteButton table="patients" id={p.id} confirmLabel={p.full_name} />
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <Card padding="none" className="hidden sm:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left font-medium text-muted-foreground px-5 py-3">Name</th>
                    <th className="text-left font-medium text-muted-foreground px-5 py-3">Phone</th>
                    <th className="text-left font-medium text-muted-foreground px-5 py-3">Gender</th>
                    <th className="text-right font-medium text-muted-foreground px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/portal/patients/${p.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {p.full_name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{p.phone}</td>
                      <td className="px-5 py-3.5 text-muted-foreground capitalize">
                        {p.gender || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <Link href={`/portal/patients/${p.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Link href={`/portal/patients/${p.id}/edit`}>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
                          {p.phone && (
                            <WhatsAppButton
                              phone={p.phone}
                              template="generalInquiry"
                              args={[p.full_name]}
                              label="WhatsApp"
                            />
                          )}
                          <DeleteButton table="patients" id={p.id} confirmLabel={p.full_name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
