import type { CEMState } from "./cem";

const STORAGE_KEY = "blackjack-cem-snapshot";
const VERSION = 1;

interface Snapshot {
  version: number;
  state: CEMState;
  timestamp: number;
}

export function saveSnapshot(state: CEMState): void {
  try {
    const snapshot: Snapshot = {
      version: VERSION,
      state,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {}
}

export function loadSnapshot(): CEMState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const snapshot: Snapshot = JSON.parse(raw);
    if (snapshot.version !== VERSION) return null;

    return snapshot.state;
  } catch {
    return null;
  }
}

export function clearSnapshot(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
