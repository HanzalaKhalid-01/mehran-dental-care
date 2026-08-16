"use client";

import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";
import { useOfflineQueue } from "@/lib/offline/useOfflineQueue";
import { WifiOff, Wifi, Loader2, AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";

export function OfflineBanner() {
  const { isOnline, wasOffline, isOffline } = useOnlineStatus();
  const { pendingCount, syncState } = useOfflineQueue();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isOffline) setDismissed(false);
  }, [isOffline]);

  // ── Offline ────────────────────────────────────────────────────────────────
  if (isOffline) {
    return (
      <div role="status" aria-live="polite"
        className="sticky top-0 z-50 w-full bg-amber-500 text-amber-950 dark:bg-amber-600 dark:text-amber-50">
        <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-sm font-medium">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            You&apos;re offline.
            {pendingCount > 0
              ? ` ${pendingCount} ${pendingCount === 1 ? "change" : "changes"} saved locally — will sync when you reconnect.`
              : " New entries will be saved locally and synced when you reconnect."}
          </span>
        </div>
      </div>
    );
  }

  // ── Syncing queued ops ─────────────────────────────────────────────────────
  if (syncState === "syncing") {
    return (
      <div role="status" aria-live="polite"
        className="sticky top-0 z-50 w-full bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-sm font-medium">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>Syncing {pendingCount} offline {pendingCount === 1 ? "change" : "changes"}…</span>
        </div>
      </div>
    );
  }

  if (syncState === "partial") {
    return (
      <div role="status" aria-live="polite"
        className="sticky top-0 z-50 w-full bg-destructive text-destructive-foreground">
        <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          <span>Some changes couldn&apos;t sync — they&apos;ll retry next time you reconnect.</span>
        </div>
      </div>
    );
  }

  // ── Back online (no queued ops or all synced) ──────────────────────────────
  if (wasOffline && syncState === "done" && !dismissed) {
    return (
      <div role="status" aria-live="polite"
        className="sticky top-0 z-50 w-full bg-emerald-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-sm font-medium">
          <Wifi className="h-4 w-4 shrink-0" aria-hidden />
          <span>Back online — all offline changes have been saved.</span>
          <button type="button" onClick={() => setDismissed(true)}
            className="ml-2 p-0.5 rounded hover:bg-white/20 transition" aria-label="Dismiss">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (wasOffline && !dismissed) {
    return (
      <div role="status" aria-live="polite"
        className="sticky top-0 z-50 w-full bg-emerald-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-sm font-medium">
          <Wifi className="h-4 w-4 shrink-0" aria-hidden />
          <span>You&apos;re back online.</span>
          <button type="button" onClick={() => setDismissed(true)}
            className="ml-2 p-0.5 rounded hover:bg-white/20 transition" aria-label="Dismiss">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
