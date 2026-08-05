"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteButton({ table, id, confirmLabel }: { table: string; id: string; confirmLabel: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from(table).delete().eq("id", id);
    setDeleting(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-slate-500">Delete {confirmLabel}?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs rounded-md bg-red-600 text-white px-2 py-1 font-medium disabled:opacity-50"
        >
          {deleting ? "..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs rounded-md border border-slate-300 px-2 py-1 font-medium"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs rounded-md border border-slate-300 px-2 py-1 font-medium hover:bg-slate-50"
    >
      Delete
    </button>
  );
}
