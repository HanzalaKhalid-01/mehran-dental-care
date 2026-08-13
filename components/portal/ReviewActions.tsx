"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function ReviewActions({ id, status }: { id: string; status: "pending" | "approved" | "rejected" }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(next: "approved" | "rejected") {
    setLoading(next);
    const supabase = createClient();
    await supabase.from("public_reviews").update({ status: next }).eq("id", id);
    setLoading(null);
    router.refresh();
  }

  async function handleDelete() {
    setLoading("delete");
    const supabase = createClient();
    await supabase.from("public_reviews").delete().eq("id", id);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {status !== "approved" && (
        <Button size="sm" variant="success" onClick={() => setStatus("approved")} loading={loading === "approved"}>
          Approve
        </Button>
      )}
      {status !== "rejected" && (
        <Button size="sm" variant="outline" onClick={() => setStatus("rejected")} loading={loading === "rejected"}>
          Reject
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={handleDelete} loading={loading === "delete"}>
        Delete
      </Button>
    </div>
  );
}
