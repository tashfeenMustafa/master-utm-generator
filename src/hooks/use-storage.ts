"use client";

import { useEffect } from "react";

/**
 * Listens for `storage` events on a specific key and calls `callback`
 * so components auto-refresh when another tab (or the same tab via
 * dispatchEvent) writes to localStorage.
 */
export function useStorageSync(key: string, callback: () => void): void {
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === key) {
        callback();
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, callback]);
}
