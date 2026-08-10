"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";

export function DeleteButton({
  table,
  id,
  confirmLabel,
}: {
  table: string;
  id: string;
  confirmLabel: string;
}) {
  const router = useRouter();
  const { isOffline } = useOnlineStatus();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (isOffline) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from(table).delete().eq("id", id);
    setDeleting(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground">
          {isOffline
            ? "Connect to the internet to delete."
            : `Delete ${confirmLabel}?`}
        </span>
        {!isOffline && (
          <Button size="sm" variant="danger" onClick={handleDelete} loading={deleting}>
            {deleting ? "..." : "Yes"}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setConfirming(true)}
      disabled={isOffline}
      title={isOffline ? "Connect to the internet to delete" : undefined}
    >
      Delete
    </Button>
  );
}
