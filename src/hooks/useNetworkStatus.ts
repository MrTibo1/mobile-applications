import { useEffect } from 'react';
import { create } from 'zustand';

interface NetworkStatusState {
  isOnline: boolean;
  setOnline: (isOnline: boolean) => void;
}

const useNetworkStatusStore = create<NetworkStatusState>((set) => ({
  isOnline: typeof navigator === 'undefined' || navigator.onLine,
  setOnline: (isOnline) => set({ isOnline }),
}));

let monitorStarted = false;

export function setNetworkUnavailable(): void {
  useNetworkStatusStore.getState().setOnline(false);
}

export function reportNetworkFailure(error: unknown): void {
  if (isNetworkFailure(error)) setNetworkUnavailable();
}

export function isNetworkFailure(error: unknown): boolean {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message)
      : '';
  if (error instanceof TypeError && /failed to fetch|network|load failed/i.test(message)) return true;
  return /failed to fetch|network|offline|connection|timed out/i.test(message);
}

function startNetworkMonitor(): void {
  if (monitorStarted || typeof window === 'undefined') return;
  monitorStarted = true;

  window.addEventListener('offline', setNetworkUnavailable);
  window.addEventListener('online', () => {
    useNetworkStatusStore.getState().setOnline(true);
  });
}

export function useNetworkStatus(): boolean {
  const isOnline = useNetworkStatusStore((state) => state.isOnline);

  useEffect(() => {
    startNetworkMonitor();
  }, []);

  return isOnline;
}
