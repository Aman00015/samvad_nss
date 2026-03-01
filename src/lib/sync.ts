import { create } from 'zustand';

interface ConnectivityState {
  isOnline: boolean;
  syncInProgress: boolean;
  pendingSyncCount: number;
  lastSyncAt: string | null;
  setOnline: (status: boolean) => void;
  setSyncInProgress: (status: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  setLastSyncAt: (time: string) => void;
}

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncInProgress: false,
  pendingSyncCount: 0,
  lastSyncAt: null,
  setOnline: (status) => set({ isOnline: status }),
  setSyncInProgress: (status) => set({ syncInProgress: status }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
  setLastSyncAt: (time) => set({ lastSyncAt: time }),
}));

/**
 * Initialize connectivity listeners.
 * Call this once in the app root.
 */
export function initConnectivityListeners() {
  if (typeof window === 'undefined') return;

  const handleOnline = () => {
    useConnectivityStore.getState().setOnline(true);
    // Trigger background sync when coming online
    triggerBackgroundSync();
  };

  const handleOffline = () => {
    useConnectivityStore.getState().setOnline(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Trigger background sync via service worker or manual sync.
 */
async function triggerBackgroundSync() {
  try {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      // @ts-expect-error - SyncManager types not fully available
      await registration.sync.register('sync-complaints');
    } else {
      // Fallback: manual sync
      await manualSync();
    }
  } catch (error) {
    console.error('Background sync failed:', error);
    await manualSync();
  }
}

/**
 * Manual sync fallback for browsers without Background Sync API.
 */
async function manualSync() {
  const store = useConnectivityStore.getState();
  if (store.syncInProgress || !store.isOnline) return;

  store.setSyncInProgress(true);
  
  try {
    // Dynamic import to avoid circular dependencies
    const { getPendingSyncItems, updateSyncItem, removeSyncItem } = await import('@/db/operations');
    const items = await getPendingSyncItems();
    
    store.setPendingSyncCount(items.length);

    for (const item of items) {
      try {
        await updateSyncItem(item.id, { status: 'in-progress', lastAttemptAt: new Date().toISOString() });
        
        // In production, this would POST to the backend API
        // For prototype, we simulate the sync
        await new Promise((r) => setTimeout(r, 500));
        
        await removeSyncItem(item.id);
        store.setPendingSyncCount(Math.max(0, store.pendingSyncCount - 1));
      } catch {
        await updateSyncItem(item.id, {
          status: 'queued',
          retryCount: item.retryCount + 1,
          lastAttemptAt: new Date().toISOString(),
        });
      }
    }

    store.setLastSyncAt(new Date().toISOString());
  } catch (error) {
    console.error('Manual sync error:', error);
  } finally {
    store.setSyncInProgress(false);
  }
}
