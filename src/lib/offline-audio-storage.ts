const DB_NAME = "BismahAudioBookVault_v2";
const DB_VERSION = 1;
const STORE_NAME = "offline_audio_entries";

export interface OfflineAudioEntry {
  trackId: string;
  youtubeId?: string;
  title: string;
  channelTitle: string;
  hasAudioBlob: boolean;
  audioData?: ArrayBuffer;
  mimeType?: string;
  thumbnailData?: ArrayBuffer;
  thumbnailMimeType?: string;
  sizeBytes: number;
  savedAt: number;
}

export interface OfflineAudioMeta {
  trackId: string;
  youtubeId?: string;
  title: string;
  channelTitle: string;
  hasAudioBlob: boolean;
  sizeBytes: number;
  savedAt: number;
  cachedThumbnailUrl?: string;
}

function openVaultDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB is not supported in this browser."));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "trackId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Failed to open Bismah offline vault."));
  });
}

export async function listOfflineAudioMeta(): Promise<Record<string, OfflineAudioMeta>> {
  try {
    const db = await openVaultDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = (req.result as OfflineAudioEntry[]) ?? [];
        const map: Record<string, OfflineAudioMeta> = {};
        for (const r of records) {
          map[r.trackId] = {
            trackId: r.trackId,
            youtubeId: r.youtubeId,
            title: r.title,
            channelTitle: r.channelTitle,
            hasAudioBlob: Boolean(r.hasAudioBlob && r.audioData),
            sizeBytes: r.sizeBytes || 0,
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

export async function getOfflineAudioEntry(trackId: string): Promise<OfflineAudioEntry | null> {
  try {
    const db = await openVaultDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(trackId);
      req.onsuccess = () => {
        const result = req.result as OfflineAudioEntry | undefined;
        resolve(result ?? null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function downloadTrackForOffline(
  track: {
    id: string;
    youtubeId?: string;
    title: string;
    channelTitle: string;
  },
  onProgress?: (pct: number, statusLabel: string) => void,
): Promise<OfflineAudioMeta> {
  onProgress?.(10, "Connecting to YouTube ...");

  let thumbnailData: ArrayBuffer | undefined;
  let thumbnailMimeType: string | undefined;

  if (track.youtubeId) {
    try {
      const thumbRes = await fetch(
        `/api/bismah/thumb?videoId=${encodeURIComponent(track.youtubeId)}`,
      );
      if (thumbRes.ok) {
        thumbnailData = await thumbRes.arrayBuffer();
        thumbnailMimeType = thumbRes.headers.get("content-type") || "image/jpeg";
      }
    } catch {
      // Non-fatal if thumbnail proxy fails
    }
  }

  onProgress?.(32, "Fetching audio stream ...");

  let hasAudioBlob = false;
  let audioData: ArrayBuffer | undefined;
  let mimeType: string | undefined;

  if (track.youtubeId) {
    try {
      const audioRes = await fetch(
        `/api/bismah/audio?videoId=${encodeURIComponent(track.youtubeId)}`,
      );
      const contentType = audioRes.headers.get("content-type") || "";

      if (audioRes.ok && contentType.startsWith("audio/")) {
        const total = Number(audioRes.headers.get("content-length") || 0);
        if (audioRes.body && total > 0) {
          const reader = audioRes.body.getReader();
          const chunks: Uint8Array[] = [];
          let received = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              received += value.byteLength;
              const pct = Math.min(95, 32 + Math.round((received / total) * 63));
              onProgress?.(pct, "Downloading audio ...");
            }
          }

          const merged = new Uint8Array(received);
          let offset = 0;
          for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.byteLength;
          }
          audioData = merged.buffer;
          mimeType = contentType;
          hasAudioBlob = merged.byteLength > 1024;
        } else {
          const buf = await audioRes.arrayBuffer();
          if (buf.byteLength > 1024) {
            audioData = buf;
            mimeType = contentType;
            hasAudioBlob = true;
          }
        }
      } else {
        // Server returned youtube-engine cache fallback; smooth progress before saving offline metadata & cover
        onProgress?.(68, "Preparing audio cache ...");
        await new Promise((r) => setTimeout(r, 240));
        onProgress?.(92, "Saving to library ...");
        await new Promise((r) => setTimeout(r, 180));
      }
    } catch {
      onProgress?.(88, "Saving track cache ...");
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const sizeBytes = (audioData?.byteLength || 0) + (thumbnailData?.byteLength || 0);

  const db = await openVaultDb();
  const entry: OfflineAudioEntry = {
    trackId: track.id,
    youtubeId: track.youtubeId,
    title: track.title,
    channelTitle: track.channelTitle,
    hasAudioBlob,
    audioData,
    mimeType,
    thumbnailData,
    thumbnailMimeType,
    sizeBytes,
    savedAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Could not save offline entry."));
  });

  onProgress?.(100, "Ready");

  return {
    trackId: entry.trackId,
    youtubeId: entry.youtubeId,
    title: entry.title,
    channelTitle: entry.channelTitle,
    hasAudioBlob: entry.hasAudioBlob,
    sizeBytes: entry.sizeBytes,
    savedAt: entry.savedAt,
  };
}

export async function saveLocalAudioFileToVault(
  trackId: string,
  title: string,
  channelTitle: string,
  file: File,
): Promise<OfflineAudioMeta> {
  const buf = await file.arrayBuffer();
  const db = await openVaultDb();
  const entry: OfflineAudioEntry = {
    trackId,
    title,
    channelTitle,
    hasAudioBlob: true,
    audioData: buf,
    mimeType: file.type || "audio/mpeg",
    sizeBytes: buf.byteLength,
    savedAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Failed to save local audio file."));
  });

  return {
    trackId: entry.trackId,
    title: entry.title,
    channelTitle: entry.channelTitle,
    hasAudioBlob: true,
    sizeBytes: entry.sizeBytes,
    savedAt: entry.savedAt,
  };
}

export async function removeOfflineAudioEntry(trackId: string): Promise<void> {
  try {
    const db = await openVaultDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(trackId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore if unavailable
  }
}

export async function clearAllOfflineAudioEntries(): Promise<void> {
  try {
    const db = await openVaultDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore
  }
}

export function formatStorageMb(bytes: number): string {
  if (!bytes || bytes <= 0) return "0.0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}
