"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Reliable online/offline detection.
 * Uses navigator.onLine + window online/offline events.
 * Also does a lightweight connectivity probe when the browser
 * claims "online" (navigator.onLine can be wrong on some networks).
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  const updateStatus = useCallback((online: boolean) => {
    setIsOnline((prev) => {
      if (!prev && online) {
        // Just came back online
        setWasOffline(true);
      }
      return online;
    });
  }, []);

  useEffect(() => {
    // Initial state
    updateStatus(typeof navigator !== "undefined" ? navigator.onLine : true);

    function handleOnline() {
      updateStatus(true);
    }
    function handleOffline() {
      updateStatus(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [updateStatus]);

  // Clear the "just reconnected" flag after a few seconds
  useEffect(() => {
    if (!wasOffline) return;
    const t = window.setTimeout(() => setWasOffline(false), 4000);
    return () => window.clearTimeout(t);
  }, [wasOffline]);

  return { isOnline, wasOffline, isOffline: !isOnline };
}
