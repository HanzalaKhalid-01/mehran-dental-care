"use client";

import { useCallback, useEffect, useState } from "react";
import { enqueue, flushQueue, readQueue, type OpData } from "./queue";
import { useOnlineStatus } from "./useOnlineStatus";

export type SyncState = "idle" | "syncing" | "done" | "partial";

export function useOfflineQueue() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncState, setSyncState] = useState<SyncState>("idle");

  // Keep pendingCount in sync with localStorage
  function refresh() {
    setPendingCount(readQueue().length);
  }

  useEffect(() => {
    refresh();
    // Refresh whenever storage changes in another tab
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  // Auto-flush when coming back online
  useEffect(() => {
    if (!isOnline || !wasOffline) return;
    if (readQueue().length === 0) return;

    setSyncState("syncing");
    flushQueue().then(({ synced, failed }) => {
      refresh();
      setSyncState(failed > 0 ? "partial" : "done");
      // Reset after a few seconds
      setTimeout(() => setSyncState("idle"), 5000);
    });
  }, [isOnline, wasOffline]);

  const queue = useCallback(
    (label: string, data: OpData) => {
      enqueue(label, data);
      refresh();
    },
    []
  );

  return { queue, pendingCount, syncState };
}
