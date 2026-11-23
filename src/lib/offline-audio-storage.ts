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
  durationSec?: number;
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
  durationSec?: number;
  sizeBytes: number;
  savedAt: number;
  cachedThumbnailUrl?: string;
}

export interface OfflineDownloadResult {
  meta: OfflineAudioMeta;
  durationSec?: number;
  extractionBlocked?: boolean;
}

const cachedThumbUrls = new Map<string, string>();

function getOrCreateThumbUrl(
  trackId: string,
  thumbnailData?: ArrayBuffer,
  mimeType?: string,
): string | undefined {
  if (!thumbnailData || thumbnailData.byteLength < 64 || typeof URL === "undefined") {
    return undefined;
  }
  const existing = cachedThumbUrls.get(trackId);
  if (existing) return existing;
  const blob = new Blob([thumbnailData], { type: mimeType || "image/jpeg" });
  const url = URL.createObjectURL(blob);
  cachedThumbUrls.set(trackId, url);
  return url;
}

function revokeThumbUrl(trackId: string) {
  const existing = cachedThumbUrls.get(trackId);
  if (existing) {
    URL.revokeObjectURL(existing);
    cachedThumbUrls.delete(trackId);
  }
}

export async function requestPersistentVaultStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
  try {
    const already = await navigator.storage.persisted?.();
    if (already) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
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
            hasAudioBlob: Boolean(r.hasAudioBlob && r.audioData && r.audioData.byteLength > 4096),
            durationSec: r.durationSec,
            sizeBytes: r.sizeBytes || 0,
            savedAt: r.savedAt,
            cachedThumbnailUrl: getOrCreateThumbUrl(
              r.trackId,
              r.thumbnailData,
              r.thumbnailMimeType,
            ),
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

async function readStreamWithProgress(
  res: Response,
  startPct: number,
  endPct: number,
  statusLabel: string,
  onProgress?: (pct: number, status: string) => void,
): Promise<ArrayBuffer | null> {
  const total = Number(res.headers.get("content-length") || 0);
  if (res.body && total > 0) {
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.byteLength;
        const pct = Math.min(
          endPct,
          startPct + Math.round((received / total) * (endPct - startPct)),
        );
        onProgress?.(pct, statusLabel);
      }
    }

    if (received < 4096) return null;
    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return merged.buffer;
  }

  const buf = await res.arrayBuffer();
  return buf.byteLength >= 4096 ? buf : null;
}

// Client-side residential-IP extraction fallback when cloud server IP hits YouTube bot shield.
// Runs directly from the user's phone/desktop browser IP against CORS-enabled public audio gateways.
async function tryBrowserResidentialAudioExtract(
  videoId: string,
  onProgress?: (pct: number, statusLabel: string) => void,
): Promise<{ audioData: ArrayBuffer; mimeType: string; durationSec?: number } | null> {
  const invidiousHosts = [
    "https://inv.nadeko.net",
    "https://invidious.nerdvpn.de",
    "https://invidious.tiekoetter.com",
  ];
  const pipedHosts = ["https://pipedapi.kavin.rocks", "https://api.piped.private.coffee"];

  let resolvedAudioUrl: string | null = null;
  let resolvedMime = "audio/mp4";
  let resolvedDuration: number | undefined;

  // 1. Try public Invidious instances from user's residential browser IP
  for (const host of invidiousHosts) {
    try {
      const res = await fetch(`${host}/api/v1/videos/${encodeURIComponent(videoId)}`, {
        signal: AbortSignal.timeout(5500),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        lengthSeconds?: number;
        adaptiveFormats?: Array<{
          type?: string;
          url?: string;
          bitrate?: string | number;
        }>;
      };
      const formats = (data.adaptiveFormats ?? [])
        .filter((f) => f.type?.startsWith("audio/") && Boolean(f.url))
        .sort((a, b) => Number(b.bitrate || 0) - Number(a.bitrate || 0));

      const preferred = formats.find((f) => f.type?.includes("audio/mp4")) ?? formats[0];
      if (preferred?.url) {
        resolvedAudioUrl = preferred.url.startsWith("/")
          ? `${host}${preferred.url}`
          : preferred.url;
        resolvedMime = (preferred.type || "audio/mp4").split(";")[0].trim();
        if (typeof data.lengthSeconds === "number" && data.lengthSeconds > 0) {
          resolvedDuration = data.lengthSeconds;
        }
        break;
      }
    } catch {
      // Try next public instance
    }
  }

  // 2. Try public Piped instances if Invidious didn't yield a stream
  if (!resolvedAudioUrl) {
    for (const host of pipedHosts) {
      try {
        const res = await fetch(`${host}/streams/${encodeURIComponent(videoId)}`, {
          signal: AbortSignal.timeout(5500),
        });
        if (!res.ok) continue;
        const data = (await res.json()) as {
          duration?: number;
          audioStreams?: Array<{
            mimeType?: string;
            url?: string;
            bitrate?: number;
          }>;
        };
        const streams = (data.audioStreams ?? [])
          .filter((s) => Boolean(s.url))
          .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
        const preferred = streams.find((s) => s.mimeType?.includes("audio/mp4")) ?? streams[0];
        if (preferred?.url) {
          resolvedAudioUrl = preferred.url;
          resolvedMime = (preferred.mimeType || "audio/mp4").split(";")[0].trim();
          if (typeof data.duration === "number" && data.duration > 0) {
            resolvedDuration = data.duration;
          }
          break;
        }
      } catch {
        // Try next public instance
      }
    }
  }

  if (!resolvedAudioUrl) return null;

  onProgress?.(46, "Downloading audio for offline ...");

  // Try direct browser fetch first (zero server bandwidth), then fall back to allowlisted server relay
  const fetchCandidates = [
    resolvedAudioUrl,
    `/api/bismah/proxy-audio?url=${encodeURIComponent(resolvedAudioUrl)}`,
  ];

  for (const candidateUrl of fetchCandidates) {
    try {
      const streamRes = await fetch(candidateUrl, { signal: AbortSignal.timeout(45000) });
      const ct = streamRes.headers.get("content-type") || resolvedMime;
      if (streamRes.ok && (ct.startsWith("audio/") || ct.includes("octet-stream"))) {
        const buf = await readStreamWithProgress(
          streamRes,
          46,
          96,
          "Saving offline audio ...",
          onProgress,
        );
        if (buf && buf.byteLength >= 4096) {
          return {
            audioData: buf,
            mimeType: ct.split(";")[0].trim() || resolvedMime,
            durationSec: resolvedDuration,
          };
        }
      }
    } catch {
      // Try next fetch path
    }
  }

  return null;
}

export async function downloadTrackForOffline(
  track: {
    id: string;
    youtubeId?: string;
    title: string;
    channelTitle: string;
  },
  onProgress?: (pct: number, statusLabel: string) => void,
): Promise<OfflineDownloadResult> {
  requestPersistentVaultStorage().catch(() => {});
  onProgress?.(8, "Connecting to YouTube ...");

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

  onProgress?.(24, "Fetching audio stream ...");

  let hasAudioBlob = false;
  let audioData: ArrayBuffer | undefined;
  let mimeType: string | undefined;
  let detectedDurationSec: number | undefined;

  if (track.youtubeId) {
    // Tier 1: Server-side multi-client Innertube extractor (ANDROID_VR -> IOS -> ANDROID)
    try {
      const audioRes = await fetch(
        `/api/bismah/audio?videoId=${encodeURIComponent(track.youtubeId)}`,
      );
      const contentType = audioRes.headers.get("content-type") || "";
      const durHeader = Number(audioRes.headers.get("x-bismah-duration-sec") || 0);
      if (durHeader > 0) detectedDurationSec = durHeader;

      if (audioRes.ok && contentType.startsWith("audio/")) {
        const buf = await readStreamWithProgress(
          audioRes,
          28,
          96,
          "Downloading offline audio ...",
          onProgress,
        );
        if (buf && buf.byteLength >= 4096) {
          audioData = buf;
          mimeType = contentType.split(";")[0].trim();
          hasAudioBlob = true;
        }
      }
    } catch {
      // Fall through to Tier 2
    }

    // Tier 2: Browser residential-IP public Invidious/Piped extraction fallback
    if (!hasAudioBlob) {
      onProgress?.(38, "Checking direct audio mirror ...");
      const fallbackResult = await tryBrowserResidentialAudioExtract(track.youtubeId, onProgress);
      if (fallbackResult) {
        audioData = fallbackResult.audioData;
        mimeType = fallbackResult.mimeType;
        if (fallbackResult.durationSec && !detectedDurationSec) {
          detectedDurationSec = fallbackResult.durationSec;
        }
        hasAudioBlob = true;
      }
    }
  }

  // If no real audio binary could be extracted, preserve cached thumbnail (if any)
  // but honestly report hasAudioBlob: false so the user is never misled about offline playback!
  const existing = await getOfflineAudioEntry(track.id);
  const finalThumb = thumbnailData ?? existing?.thumbnailData;
  const finalThumbMime = thumbnailMimeType ?? existing?.thumbnailMimeType;

  const sizeBytes = (audioData?.byteLength || 0) + (finalThumb?.byteLength || 0);

  const db = await openVaultDb();
  const entry: OfflineAudioEntry = {
    trackId: track.id,
    youtubeId: track.youtubeId,
    title: track.title,
    channelTitle: track.channelTitle,
    hasAudioBlob,
    audioData,
    mimeType,
    durationSec: detectedDurationSec,
    thumbnailData: finalThumb,
    thumbnailMimeType: finalThumbMime,
    sizeBytes,
    savedAt: Date.now(),
  };

  if (hasAudioBlob || finalThumb) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error ?? new Error("Could not save offline entry."));
    });
  }

  onProgress?.(100, hasAudioBlob ? "Offline Ready" : "Online Only");

  const meta: OfflineAudioMeta = {
    trackId: entry.trackId,
    youtubeId: entry.youtubeId,
    title: entry.title,
    channelTitle: entry.channelTitle,
    hasAudioBlob: entry.hasAudioBlob,
    durationSec: entry.durationSec,
    sizeBytes: entry.sizeBytes,
    savedAt: entry.savedAt,
    cachedThumbnailUrl: getOrCreateThumbUrl(
      entry.trackId,
      entry.thumbnailData,
      entry.thumbnailMimeType,
    ),
  };

  return {
    meta,
    durationSec: detectedDurationSec,
    extractionBlocked: Boolean(track.youtubeId && !hasAudioBlob),
  };
}

export async function attachAudioFileToTrack(
  track: {
    id: string;
    youtubeId?: string;
    title: string;
    channelTitle: string;
  },
  file: File,
): Promise<OfflineAudioMeta> {
  requestPersistentVaultStorage().catch(() => {});
  const buf = await file.arrayBuffer();
  const existing = await getOfflineAudioEntry(track.id);
  const db = await openVaultDb();

  const entry: OfflineAudioEntry = {
    trackId: track.id,
    youtubeId: track.youtubeId,
    title: track.title,
    channelTitle: track.channelTitle,
    hasAudioBlob: true,
    audioData: buf,
    mimeType: file.type || "audio/mpeg",
    thumbnailData: existing?.thumbnailData,
    thumbnailMimeType: existing?.thumbnailMimeType,
    sizeBytes: buf.byteLength + (existing?.thumbnailData?.byteLength || 0),
    savedAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Failed to attach offline audio file."));
  });

  return {
    trackId: entry.trackId,
    youtubeId: entry.youtubeId,
    title: entry.title,
    channelTitle: entry.channelTitle,
    hasAudioBlob: true,
    sizeBytes: entry.sizeBytes,
    savedAt: entry.savedAt,
    cachedThumbnailUrl: getOrCreateThumbUrl(
      entry.trackId,
      entry.thumbnailData,
      entry.thumbnailMimeType,
    ),
  };
}

export async function saveLocalAudioFileToVault(
  trackId: string,
  title: string,
  channelTitle: string,
  file: File,
): Promise<OfflineAudioMeta> {
  requestPersistentVaultStorage().catch(() => {});
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
  revokeThumbUrl(trackId);
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
  for (const key of Array.from(cachedThumbUrls.keys())) {
    revokeThumbUrl(key);
  }
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
