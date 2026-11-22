export type BismahThemeAccentId =
  | "website-minimal"
  | "sage-clay"
  | "midnight-indigo"
  | "rose-quartz"
  | "oceanic-teal"
  | "amber-honey"
  | "lavender-mist"
  | "emerald-moss"
  | "crimson-velvet"
  | "nordic-slate"
  | "matcha-cream";

export interface BismahThemeAccent {
  id: BismahThemeAccentId;
  name: string;
  primaryHex: string;
  darkPrimaryHex: string;
  onPrimaryLight: string;
  onPrimaryDark: string;
  softTintLight: string;
  softTintDark: string;
}

export const BISMAH_THEME_ACCENTS: BismahThemeAccent[] = [
  {
    id: "website-minimal",
    name: "Website Minimal",
    primaryHex: "#18181B",
    darkPrimaryHex: "#E4E4E7",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#09090B",
    softTintLight: "rgba(24, 24, 27, 0.08)",
    softTintDark: "rgba(228, 228, 231, 0.14)",
  },
  {
    id: "oceanic-teal",
    name: "Oceanic Teal",
    primaryHex: "#1D8A82",
    darkPrimaryHex: "#269A91",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#FFFFFF",
    softTintLight: "rgba(29, 138, 130, 0.12)",
    softTintDark: "rgba(38, 154, 145, 0.18)",
  },
  {
    id: "sage-clay",
    name: "Sage & Clay",
    primaryHex: "#6E8A7E",
    darkPrimaryHex: "#7FA193",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#FFFFFF",
    softTintLight: "rgba(110, 138, 126, 0.14)",
    softTintDark: "rgba(127, 161, 147, 0.18)",
  },
  {
    id: "midnight-indigo",
    name: "Midnight Indigo",
    primaryHex: "#4F6EF7",
    darkPrimaryHex: "#637FF9",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#FFFFFF",
    softTintLight: "rgba(79, 110, 247, 0.12)",
    softTintDark: "rgba(99, 127, 249, 0.18)",
  },
  {
    id: "rose-quartz",
    name: "Rose Quartz",
    primaryHex: "#D66D8A",
    darkPrimaryHex: "#E07D99",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#FFFFFF",
    softTintLight: "rgba(214, 109, 138, 0.13)",
    softTintDark: "rgba(224, 125, 153, 0.18)",
  },
  {
    id: "amber-honey",
    name: "Amber Honey",
    primaryHex: "#D9822B",
    darkPrimaryHex: "#E5943F",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#121212",
    softTintLight: "rgba(217, 130, 43, 0.13)",
    softTintDark: "rgba(229, 148, 63, 0.18)",
  },
  {
    id: "lavender-mist",
    name: "Lavender Mist",
    primaryHex: "#8B72D4",
    darkPrimaryHex: "#9C84E0",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#FFFFFF",
    softTintLight: "rgba(139, 114, 212, 0.13)",
    softTintDark: "rgba(156, 132, 224, 0.18)",
  },
  {
    id: "emerald-moss",
    name: "Emerald Moss",
    primaryHex: "#2D8A5E",
    darkPrimaryHex: "#389D6D",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#FFFFFF",
    softTintLight: "rgba(45, 138, 94, 0.13)",
    softTintDark: "rgba(56, 157, 109, 0.18)",
  },
  {
    id: "crimson-velvet",
    name: "Crimson Velvet",
    primaryHex: "#C84664",
    darkPrimaryHex: "#D95775",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#FFFFFF",
    softTintLight: "rgba(200, 70, 100, 0.13)",
    softTintDark: "rgba(217, 87, 117, 0.18)",
  },
  {
    id: "nordic-slate",
    name: "Nordic Slate",
    primaryHex: "#556B8D",
    darkPrimaryHex: "#6B82A6",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#FFFFFF",
    softTintLight: "rgba(85, 107, 141, 0.13)",
    softTintDark: "rgba(107, 130, 166, 0.18)",
  },
  {
    id: "matcha-cream",
    name: "Matcha Cream",
    primaryHex: "#749449",
    darkPrimaryHex: "#87A85A",
    onPrimaryLight: "#FFFFFF",
    onPrimaryDark: "#FFFFFF",
    softTintLight: "rgba(116, 148, 73, 0.13)",
    softTintDark: "rgba(135, 168, 90, 0.18)",
  },
];

export type BismahAppearanceMode = "light" | "dark" | "system";
export type BismahViewStyle = "grid" | "list";
export type BismahLoopMode = "off" | "single" | "all";
export type BismahPlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export const BISMAH_PLAYBACK_SPEEDS: BismahPlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5, 2.0];
export const BISMAH_SLEEP_PRESETS: Array<{ label: string; minutes: number }> = [
  { label: "Off", minutes: 0 },
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "60m", minutes: 60 },
];

export interface BismahAudioTrack {
  id: string;
  sourceType: "youtube" | "local";
  youtubeId?: string;
  playlistId?: string;
  title: string;
  channelTitle: string;
  durationSec: number;
  thumbnail: string;
  sourceUrl: string;
  addedAt: number;
}

export function extractYouTubeIds(rawInput: string): {
  videoId: string | null;
  playlistId: string | null;
  isValid: boolean;
} {
  const trimmed = rawInput.trim();
  if (!trimmed) return { videoId: null, playlistId: null, isValid: false };

  let videoId: string | null = null;
  let playlistId: string | null = null;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const urlObj = new URL(withProtocol);
    const host = urlObj.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const seg = urlObj.pathname.split("/").filter(Boolean)[0];
      if (seg && /^[A-Za-z0-9_-]{11}$/.test(seg)) videoId = seg;
      const list = urlObj.searchParams.get("list");
      if (list && /^[A-Za-z0-9_-]{10,64}$/.test(list)) playlistId = list;
    } else if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const v = urlObj.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) videoId = v;
      const list = urlObj.searchParams.get("list");
      if (list && /^[A-Za-z0-9_-]{10,64}$/.test(list)) playlistId = list;
      if (!videoId) {
        const parts = urlObj.pathname.split("/").filter(Boolean);
        if (
          parts.length >= 2 &&
          ["shorts", "embed", "live", "v"].includes(parts[0]) &&
          /^[A-Za-z0-9_-]{11}$/.test(parts[1])
        ) {
          videoId = parts[1];
        }
      }
    }
  } catch {
    const vMatch = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
    if (vMatch?.[1]) videoId = vMatch[1];
    const lMatch = trimmed.match(/[?&]list=([A-Za-z0-9_-]{10,64})/);
    if (lMatch?.[1]) playlistId = lMatch[1];
  }

  return {
    videoId,
    playlistId,
    isValid: Boolean(videoId || playlistId),
  };
}

export async function resolveYouTubeLinkTracks(rawUrl: string): Promise<{
  type: "video" | "playlist";
  playlistId: string | null;
  tracks: BismahAudioTrack[];
}> {
  const localIds = extractYouTubeIds(rawUrl);
  if (!localIds.isValid) {
    throw new Error("Please paste a valid YouTube video or playlist link.");
  }

  const res = await fetch(`/api/bismah/resolve?url=${encodeURIComponent(rawUrl.trim())}`);
  const payload = (await res.json().catch(() => ({}))) as {
    error?: string;
    type?: "video" | "playlist";
    playlistId?: string | null;
    tracks?: Array<{
      videoId: string;
      title: string;
      channelTitle: string;
      thumbnail: string;
    }>;
  };

  if (!res.ok || !Array.isArray(payload.tracks) || payload.tracks.length === 0) {
    if (localIds.videoId) {
      return {
        type: "video",
        playlistId: localIds.playlistId,
        tracks: [
          {
            id: `yt-${localIds.videoId}-${Date.now()}`,
            sourceType: "youtube",
            youtubeId: localIds.videoId,
            playlistId: localIds.playlistId ?? undefined,
            title: `YouTube Audio (${localIds.videoId})`,
            channelTitle: "YouTube",
            durationSec: 0,
            thumbnail: `https://i.ytimg.com/vi/${localIds.videoId}/hqdefault.jpg`,
            sourceUrl: `https://www.youtube.com/watch?v=${localIds.videoId}`,
            addedAt: Date.now(),
          },
        ],
      };
    }
    throw new Error(
      payload.error || "Could not load tracks from this YouTube link. Please try another URL.",
    );
  }

  const now = Date.now();
  const mapped: BismahAudioTrack[] = payload.tracks.map((item, index) => ({
    id: `yt-${item.videoId}-${now}-${index}`,
    sourceType: "youtube",
    youtubeId: item.videoId,
    playlistId: payload.playlistId ?? undefined,
    title: item.title,
    channelTitle: item.channelTitle,
    durationSec: 0,
    thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
    sourceUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
    addedAt: now + index,
  }));

  return {
    type: payload.type ?? (mapped.length > 1 ? "playlist" : "video"),
    playlistId: payload.playlistId ?? null,
    tracks: mapped,
  };
}

export function formatDurationClock(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "00:00";
  const safe = Math.floor(sec);
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const rem = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}
