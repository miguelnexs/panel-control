import { useCallback, useEffect, useRef, useState } from 'react';
import {
  cacheProducts,
  getCachedProducts,
  enqueue,
  getQueue,
  updateQueueItem,
  removeQueueItem,
  putCachedProduct,
  deleteCachedProduct,
  cacheItems,
  getCachedItems,
  putCachedItem,
  deleteCachedItem,
  fileToBase64,
  base64ToFile,
  type SyncOperation,
  type StoreName,
} from '../lib/offlineDB';

export interface OfflineSyncState {
  /** Is the browser/app currently online? */
  isOnline: boolean;
  /** Number of operations waiting to sync. */
  pendingCount: number;
  /** True while the sync loop is running. */
  syncing: boolean;
  /** Last sync error message (null = ok). */
  lastError: string | null;
}

interface UseOfflineSyncReturn extends OfflineSyncState {
  /**
   * Load products — tries server first, falls back to local cache.
   * Also caches successful server responses locally.
   */
  loadProducts: (token: string | null, apiBase: string) => Promise<any[]>;
  /**
   * Generic loader for any entity type. Tries server first, falls back to local cache.
   * @param store  - IndexedDB store name ('categories' | 'services' | 'clients')
   * @param url    - Full API URL to fetch from
   * @param token  - Auth token
   */
  loadData: (store: StoreName, url: string, token: string | null) => Promise<any[]>;
  /**
   * Generic loader for paginated entity types. Tries server first, falls back to local cache.
   * Caches successful server responses locally. Returns items and total count.
   */
  loadPaginatedData: (store: StoreName, url: string, token: string | null) => Promise<{ items: any[]; total: number }>;
  /**
   * Queue a mutation for sync. If online it fires immediately; if offline, it is
   * persisted to IndexedDB and replayed on reconnect.
   *
   * For JSON bodies pass `body`; for FormData-based requests pass `formFields` + `files`.
   */
  queueMutation: (opts: {
    token: string | null;
    method: 'POST' | 'PATCH' | 'DELETE';
    url: string;
    body?: Record<string, any> | null;
    formFields?: Record<string, string>;
    files?: { field: string; file: File }[];
    /** For create ops: a temp object to show in the local list immediately. */
    optimisticProduct?: any;
    /** Entity id to remove from local cache (for DELETE). */
    deleteLocalId?: number | string;
    /** Which IndexedDB store to update for optimistic ops. Defaults to 'products'. */
    store?: StoreName;
  }) => Promise<{ ok: boolean; data?: any; queued?: boolean }>;
  /** Manually trigger a sync attempt. */
  syncNow: () => Promise<void>;
  /** Pending queue items (for debug / advanced UI). */
  queue: SyncOperation[];
}

const authHeaders = (token: string | null, json = false): Record<string, string> => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...(json ? { 'Content-Type': 'application/json' } : {}),
});

function buildFormData(
  fields?: Record<string, string>,
  files?: { field: string; name: string; type: string; base64: string }[],
): FormData {
  const fd = new FormData();
  if (fields) {
    for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  }
  if (files) {
    for (const f of files) fd.append(f.field, base64ToFile(f.base64, f.name, f.type));
  }
  return fd;
}

export function useOfflineSync(token: string | null): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [queue, setQueue] = useState<SyncOperation[]>([]);
  const syncingRef = useRef(false);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  // ─── Online/offline listeners ──────────────────────────────────
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // ─── Refresh pending count ─────────────────────────────────────
  const refreshQueue = useCallback(async () => {
    try {
      const q = await getQueue();
      const pending = q.filter((i) => i.status === 'pending' || i.status === 'error');
      setPendingCount(pending.length);
      setQueue(q);
    } catch {
      // IndexedDB may be unavailable in rare cases
    }
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  // ─── Sync engine ───────────────────────────────────────────────
  const processQueue = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    const q = await getQueue();
    const pending = q.filter((i) => i.status === 'pending' || i.status === 'error');
    if (pending.length === 0) return;

    syncingRef.current = true;
    setSyncing(true);
    setLastError(null);

    for (const item of pending) {
      try {
        item.status = 'syncing';
        await updateQueueItem(item);

        let res: Response;
        if (item.files && item.files.length > 0) {
          const fd = buildFormData(
            item.payload as Record<string, string> | undefined,
            item.files,
          );
          res = await fetch(item.url, {
            method: item.method,
            headers: authHeaders(tokenRef.current),
            body: fd,
          });
        } else if (item.payload && item.method !== 'DELETE') {
          res = await fetch(item.url, {
            method: item.method,
            headers: authHeaders(tokenRef.current, true),
            body: JSON.stringify(item.payload),
          });
        } else {
          res = await fetch(item.url, {
            method: item.method,
            headers: authHeaders(tokenRef.current),
          });
        }

        if (res.ok) {
          await removeQueueItem(item.id!);
          // If it was a create, update the cached product with the real server id
          if (item.method === 'POST' && item.tempId) {
            try {
              const serverData = await res.json();
              await deleteCachedProduct(item.tempId);
              await putCachedProduct(serverData);
            } catch { /* non-critical */ }
          }
        } else if (res.status === 401) {
          // Token expired — stop syncing, don't retry
          item.status = 'error';
          item.error = 'Sesión expirada. Inicia sesión de nuevo.';
          await updateQueueItem(item);
          setLastError('Sesión expirada');
          break;
        } else {
          const errText = await res.text().catch(() => 'Error del servidor');
          item.status = 'error';
          item.retries += 1;
          item.error = errText;
          await updateQueueItem(item);
        }
      } catch (e: any) {
        // Network error — stop trying for now, will retry next cycle
        item.status = 'error';
        item.retries += 1;
        item.error = e.message || 'Error de red';
        await updateQueueItem(item);
        break;
      }
    }

    syncingRef.current = false;
    setSyncing(false);
    await refreshQueue();
  }, [refreshQueue]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) processQueue();
  }, [isOnline, processQueue]);

  // Periodic sync every 10s when online
  useEffect(() => {
    const id = setInterval(() => {
      if (navigator.onLine) processQueue();
    }, 10_000);
    return () => clearInterval(id);
  }, [processQueue]);

  // ─── Public: loadProducts ──────────────────────────────────────
  const loadProducts = useCallback(
    async (tkn: string | null, apiBase: string): Promise<any[]> => {
      if (navigator.onLine) {
        try {
          const res = await fetch(`${apiBase}/products/?ordering=position`, {
            headers: authHeaders(tkn),
          });
          if (res.ok) {
            const data = await res.json();
            const products = Array.isArray(data) ? data : data.results || [];
            await cacheProducts(products);
            return products;
          }
        } catch {
          // Network error — fallthrough to cache
        }
      }
      // Offline or fetch failed — return cached data
      return getCachedProducts();
    },
    [],
  );

  // ─── Public: loadData (generic) ────────────────────────────────
  const loadData = useCallback(
    async (store: StoreName, url: string, tkn: string | null): Promise<any[]> => {
      if (navigator.onLine) {
        try {
          const res = await fetch(url, { headers: authHeaders(tkn) });
          if (res.ok) {
            const data = await res.json();
            const items = Array.isArray(data) ? data : data.results || [];
            await cacheItems(store, items);
            return items;
          }
        } catch {
          // Network error — fallthrough to cache
        }
      }
      return getCachedItems(store);
    },
    [],
  );

  // ─── Public: loadPaginatedData (generic) ───────────────────────
  const loadPaginatedData = useCallback(
    async (store: StoreName, url: string, tkn: string | null): Promise<{ items: any[]; total: number }> => {
      if (navigator.onLine) {
        try {
          const res = await fetch(url, { headers: authHeaders(tkn) });
          if (res.ok) {
            const data = await res.json();
            // In DRF pagination, results are in data.results and total in data.count
            const items = Array.isArray(data) ? data : (data.results || []);
            const total = data.count !== undefined ? data.count : items.length;
            await cacheItems(store, items);
            return { items, total };
          }
        } catch {
          // Network error case
        }
      }
      const cached = await getCachedItems(store);
      return { items: cached, total: cached.length };
    },
    [],
  );

  // ─── Public: queueMutation ─────────────────────────────────────
  const queueMutation = useCallback(
    async (opts: {
      token: string | null;
      method: 'POST' | 'PATCH' | 'DELETE';
      url: string;
      body?: Record<string, any> | null;
      formFields?: Record<string, string>;
      files?: { field: string; file: File }[];
      optimisticProduct?: any;
      deleteLocalId?: number | string;
      store?: StoreName;
    }): Promise<{ ok: boolean; data?: any; queued?: boolean }> => {
      const storeName: StoreName = opts.store || 'products';
      // Optimistic local update
      if (opts.optimisticProduct) {
        await putCachedItem(storeName, opts.optimisticProduct);
      }
      if (opts.deleteLocalId != null) {
        await deleteCachedItem(storeName, opts.deleteLocalId);
      }

      // Serialise files for IndexedDB storage
      const serialisedFiles: SyncOperation['files'] = [];
      if (opts.files) {
        for (const f of opts.files) {
          const b64 = await fileToBase64(f.file);
          serialisedFiles.push({ field: f.field, name: f.file.name, type: f.file.type, base64: b64 });
        }
      }

      // If online, try immediately
      if (navigator.onLine) {
        try {
          let res: Response;
          if (opts.files && opts.files.length > 0) {
            const fd = new FormData();
            if (opts.formFields) {
              for (const [k, v] of Object.entries(opts.formFields)) fd.append(k, v);
            }
            for (const f of opts.files) fd.append(f.field, f.file);
            res = await fetch(opts.url, {
              method: opts.method,
              headers: authHeaders(opts.token),
              body: fd,
            });
          } else if (opts.body && opts.method !== 'DELETE') {
            res = await fetch(opts.url, {
              method: opts.method,
              headers: authHeaders(opts.token, true),
              body: JSON.stringify(opts.body),
            });
          } else {
            res = await fetch(opts.url, {
              method: opts.method,
              headers: authHeaders(opts.token),
            });
          }

          if (res.ok) {
            let data: any = null;
            try { data = await res.json(); } catch { /* no body */ }
            // Update local cache with server response
            if (data && opts.method !== 'DELETE') {
              await putCachedItem(storeName, data);
            }
            await refreshQueue();
            return { ok: true, data };
          }
          // Server returned error — but network is up, don't queue
          const errData = await res.json().catch(() => ({}));
          return { ok: false, data: errData };
        } catch {
          // Network failed mid-request — fall through to queue
        }
      }

      // Offline or network error — queue for later
      const tempId = opts.optimisticProduct
        ? String(opts.optimisticProduct.id)
        : undefined;

      await enqueue({
        timestamp: Date.now(),
        method: opts.method,
        url: opts.url,
        payload: opts.body || opts.formFields || null,
        files: serialisedFiles.length > 0 ? serialisedFiles : undefined,
        status: 'pending',
        retries: 0,
        tempId,
      });
      await refreshQueue();
      return { ok: true, queued: true };
    },
    [refreshQueue],
  );

  const syncNow = useCallback(async () => {
    await processQueue();
  }, [processQueue]);

  return {
    isOnline,
    pendingCount,
    syncing,
    lastError,
    queue,
    loadProducts,
    loadData,
    loadPaginatedData,
    queueMutation,
    syncNow,
  };
}
