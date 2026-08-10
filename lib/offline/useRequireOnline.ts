"use client";

import { useCallback } from "react";
import { useOnlineStatus } from "./useOnlineStatus";

/**
 * Helper for form submit handlers.
 * Returns { isOnline, isOffline, guard } where guard(fn) only runs fn when online.
 */
export function useRequireOnline() {
  const { isOnline, isOffline } = useOnlineStatus();

  const guard = useCallback(
    <T extends (...args: never[]) => unknown>(fn: T) => {
      return ((...args: Parameters<T>) => {
        if (!isOnline) {
          return;
        }
        return fn(...args);
      }) as T;
    },
    [isOnline]
  );

  return { isOnline, isOffline, guard };
}
