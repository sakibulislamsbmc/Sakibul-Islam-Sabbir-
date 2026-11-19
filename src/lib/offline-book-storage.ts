const DB_NAME = "BismahSecureBooksVault";
const DB_VERSION = 1;
const STORE_NAME = "offline_books";

export interface OfflineBookRecord {
  bookId: string;
  title: string;
  data: ArrayBuffer;
  sizeBytes: number;
  savedAt: number;
}

export interface OfflineBookMeta {
  bookId: string;
  title: string;
  sizeBytes: number;
  savedAt: number;
}

function openVaultDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("Offline storage is not supported in this browser."));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "bookId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Failed to open offline book vault."));
  });
}

export async function getOfflineBookRecord(bookId: string): Promise<OfflineBookRecord | null> {
  try {
    const db = await openVaultDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(bookId);
      req.onsuccess = () => {
        const result = req.result as OfflineBookRecord | undefined;
        resolve(result ?? null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function listOfflineBooksMeta(): Promise<Record<string, OfflineBookMeta>> {
  try {
    const db = await openVaultDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = (req.result as OfflineBookRecord[]) ?? [];
        const map: Record<string, OfflineBookMeta> = {};
        for (const r of records) {
          map[r.bookId] = {
            bookId: r.bookId,
            title: r.title,
            sizeBytes: r.sizeBytes,
            savedAt: r.savedAt,
          };
        }
        resolve(map);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return {};
  }
}

export async function saveBookOffline(
  bookId: string,
  title: string,
  bytes: Uint8Array,
): Promise<OfflineBookMeta> {
  const db = await openVaultDb();
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);

  const record: OfflineBookRecord = {
    bookId,
    title,
    data: copy,
    sizeBytes: copy.byteLength,
    savedAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Could not save book offline."));
  });

  return {
    bookId: record.bookId,
    title: record.title,
    sizeBytes: record.sizeBytes,
    savedAt: record.savedAt,
  };
}

export async function removeOfflineBook(bookId: string): Promise<void> {
  const db = await openVaultDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(bookId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Could not remove offline book."));
  });
}

export async function fetchSecureBookBytes(
  streamUrl: string,
  onProgress?: (pct: number) => void,
): Promise<Uint8Array> {
  const response = await fetch(streamUrl, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      "X-Bismah-Reader": "internal",
    },
  });

  if (!response.ok) {
    let errorMessage = "বইটি লোড করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করুন।";
    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) errorMessage = json.error;
    } catch {
      // Ignore parse error
    }
    throw new Error(errorMessage);
  }

  const totalLength = Number(response.headers.get("content-length") || 0);
  if (!response.body || !totalLength) {
    const buf = await response.arrayBuffer();
    onProgress?.(100);
    return new Uint8Array(buf);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.byteLength;
      if (totalLength > 0) {
        onProgress?.(Math.min(99, Math.round((received / totalLength) * 100)));
      }
    }
  }

  const full = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    full.set(chunk, offset);
    offset += chunk.byteLength;
  }
  onProgress?.(100);
  return full;
}

export function formatBytesMb(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
