"use client";

import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";
import { WifiOff } from "lucide-react";

/**
 * Inline notice for forms / mutation UIs.
 * Place near submit buttons so users understand why save is disabled.
 */
export function OfflineNotice({ className = "" }: { className?: string }) {
  const { isOffline } = useOnlineStatus();

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-2.5 rounded-xl border border-amber-500/30
        bg-amber-500/10 px-3.5 py-3 text-sm text-amber-900 dark:text-amber-100
        ${className}
      `}
    >
      <WifiOff className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
      <div>
        <p className="font-medium">You&apos;re offline</p>
        <p className="text-amber-800/80 dark:text-amber-100/80 mt-0.5">
          Connect to the internet to save these details. Your entries on this
          screen are not stored until you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
