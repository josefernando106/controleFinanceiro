"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("local-storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("local-storage", callback);
  };
}

function getServerSnapshot() {
  return null;
}

/** Reads a localStorage key reactively, re-rendering on change (including cross-tab). */
export function useLocalStorageRaw(key: string): string | null {
  return useSyncExternalStore(subscribe, () => localStorage.getItem(key), getServerSnapshot);
}

/** Writes a localStorage key and notifies subscribers in the current tab. */
export function writeLocalStorage(key: string, value: string | null) {
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
  window.dispatchEvent(new Event("local-storage"));
}
