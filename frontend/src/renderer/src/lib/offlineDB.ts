/**
 * OfflineDB — IndexedDB wrapper for offline-first data management.
 *
 * Stores:
 *  - products: cached product data from the server
 *  - categories: cached category data
 *  - services: cached service data
 *  - clients: cached client data
 *  - sales: cached sales/products data for the POS
 *  - orders: cached order history data
 *  - syncQueue: pending mutations to replay when back online
 */

const DB_NAME = 'panel-control-offline';
const DB_VERSION = 4;

export interface SyncOperation {
  id?: number;
  timestamp: number;
  method: 'POST' | 'PATCH' | 'DELETE';
  url: string;
  /** JSON-serialisable body (no blobs). For FormData ops we serialise fields + base64 files. */
  payload: Record<string, any> | null;
  /** Files encoded as base64 for later reconstruction into FormData. */
  files?: { field: string; name: string; type: string; base64: string }[];
  status: 'pending' | 'syncing' | 'done' | 'error';
  retries: number;
  error?: string;
  /** Temporary local ID assigned to creates so we can show them in the list. */
  tempId?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('services')) {
        db.createObjectStore('services', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('clients')) {
        db.createObjectStore('clients', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sales')) {
        db.createObjectStore('sales', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Products cache ────────────────────────────────────────────────

export async function cacheProducts(products: any[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('products', 'readwrite');
  const store = tx.objectStore('products');
  store.clear();
  for (const p of products) store.put(p);
  return new Promise((res, rej) => {
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

export async function getCachedProducts(): Promise<any[]> {
  const db = await openDB();
  const tx = db.transaction('products', 'readonly');
  const store = tx.objectStore('products');
  return new Promise((res, rej) => {
    const req = store.getAll();
    req.onsuccess = () => { db.close(); res(req.result || []); };
    req.onerror = () => { db.close(); rej(req.error); };
  });
}

export async function putCachedProduct(product: any): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('products', 'readwrite');
  tx.objectStore('products').put(product);
  return new Promise((res, rej) => {
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

export async function deleteCachedProduct(id: number | string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('products', 'readwrite');
  tx.objectStore('products').delete(id);
  return new Promise((res, rej) => {
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

// ─── Sync queue ────────────────────────────────────────────────────

// ─── Generic store helpers ─────────────────────────────────────────

export type StoreName = 'products' | 'categories' | 'services' | 'clients' | 'sales' | 'orders';

export async function cacheItems(store: StoreName, items: any[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(store, 'readwrite');
  const s = tx.objectStore(store);
  s.clear();
  for (const item of items) s.put(item);
  return new Promise((res, rej) => {
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

export async function getCachedItems(store: StoreName): Promise<any[]> {
  const db = await openDB();
  const tx = db.transaction(store, 'readonly');
  const s = tx.objectStore(store);
  return new Promise((res, rej) => {
    const req = s.getAll();
    req.onsuccess = () => { db.close(); res(req.result || []); };
    req.onerror = () => { db.close(); rej(req.error); };
  });
}

export async function putCachedItem(store: StoreName, item: any): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).put(item);
  return new Promise((res, rej) => {
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

export async function deleteCachedItem(store: StoreName, id: number | string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).delete(id);
  return new Promise((res, rej) => {
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

// ─── Sync queue ───────────────────────────────────────────────────

export async function enqueue(op: Omit<SyncOperation, 'id'>): Promise<number> {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  const store = tx.objectStore('syncQueue');
  return new Promise((res, rej) => {
    const req = store.add(op);
    req.onsuccess = () => { db.close(); res(req.result as number); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

export async function getQueue(): Promise<SyncOperation[]> {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readonly');
  const store = tx.objectStore('syncQueue');
  return new Promise((res, rej) => {
    const req = store.getAll();
    req.onsuccess = () => { db.close(); res(req.result || []); };
    req.onerror = () => { db.close(); rej(req.error); };
  });
}

export async function updateQueueItem(item: SyncOperation): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  tx.objectStore('syncQueue').put(item);
  return new Promise((res, rej) => {
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

export async function removeQueueItem(id: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  tx.objectStore('syncQueue').delete(id);
  return new Promise((res, rej) => {
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

export async function clearQueue(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  tx.objectStore('syncQueue').clear();
  return new Promise((res, rej) => {
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

// ─── Settings ──────────────────────────────────────────────────────

export async function saveSetting(key: string, value: any): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('settings', 'readwrite');
  tx.objectStore('settings').put({ key, value });
  return new Promise((res, rej) => {
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

export async function getSetting(key: string): Promise<any | null> {
  const db = await openDB();
  const tx = db.transaction('settings', 'readonly');
  const store = tx.objectStore('settings');
  return new Promise((res, rej) => {
    const req = store.get(key);
    req.onsuccess = () => { db.close(); res(req.result ? req.result.value : null); };
    req.onerror = () => { db.close(); rej(req.error); };
  });
}

// ─── Helpers ───────────────────────────────────────────────────────

/** Convert a File/Blob to a base64 data-url string for storage in IndexedDB. */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = () => rej(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Reconstruct a File from a base64 data-url string. */
export function base64ToFile(base64: string, name: string, type: string): File {
  const [, data] = base64.split(',');
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type });
}
