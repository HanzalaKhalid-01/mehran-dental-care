"use client";

import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";
import { WifiOff, Wifi, X } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Sticky banner shown across the portal when the device is offline,
 * plus a short "back online" confirmation when connectivity returns.
 */
export function OfflineBanner() {
  const { isOnline, wasOffline, isOffline } = useOnlineStatus();
  const [dismissedOnline, setDismissedOnline] = useState(false);

  // Reset dismiss when we go offline again
  useEffect(() => {
    if (isOffline) setDismissedOnline(false);
  }, [isOffline]);

  // Offline state — persistent until back online
  if (isOffline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="sticky top-0 z-50 w-full bg-amber-500 text-amber-950 dark:bg-amber-600 dark:text-amber-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-sm font-medium">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            You&apos;re offline. Changes cannot be saved until you reconnect to the internet.
          </span>
        </div>
      </div>
    );
  }

  // Briefly show "back online" after reconnect
  if (wasOffline && !dismissedOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="sticky top-0 z-50 w-full bg-emerald-600 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-sm font-medium">
          <Wifi className="h-4 w-4 shrink-0" aria-hidden />
          <span>You&apos;re back online. You can save changes again.</span>
          <button
            type="button"
            onClick={() => setDismissedOnline(true)}
            className="ml-2 p-0.5 rounded hover:bg-white/20 transition"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
