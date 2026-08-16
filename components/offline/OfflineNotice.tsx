"use client";

import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";
import { useOfflineQueue } from "@/lib/offline/useOfflineQueue";
import { WifiOff } from "lucide-react";

export function OfflineNotice({ className = "" }: { className?: string }) {
  const { isOffline } = useOnlineStatus();
  const { pendingCount } = useOfflineQueue();

  if (!isOffline) return null;

  return (
    <div role="alert"
      className={`
        flex items-start gap-2.5 rounded-xl border border-amber-500/30
        bg-amber-500/10 px-3.5 py-3 text-sm text-amber-900 dark:text-amber-100
        ${className}
      `}
    >
      <WifiOff className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
      <div>
        <p className="font-medium">You&apos;re offline — your entry will be saved locally</p>
        <p className="text-amber-800/80 dark:text-amber-100/80 mt-0.5">
          {pendingCount > 0
            ? `You have ${pendingCount} ${pendingCount === 1 ? "entry" : "entries"} waiting to sync. This one will be added to the queue and uploaded as soon as you reconnect.`
            : "This entry will be stored on this device and automatically uploaded to the system when your internet is restored."}
        </p>
      </div>
    </div>
  );
}
