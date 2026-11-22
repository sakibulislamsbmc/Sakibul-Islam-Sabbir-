import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ClipboardPaste,
  Clock,
  Code2,
  Copy,
  Download,
  Gauge,
  Headphones,
  ListMusic,
  Moon,
  Palette,
  Pause,
  Play,
  Plus,
  Repeat,
  Repeat1,
  RotateCcw,
  RotateCw,
  Search,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Sun,
  Trash2,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from "lucide-react";
import {
  BISMAH_FLUTTER_MODULES,
  BISMAH_PLAYBACK_SPEEDS,
  BISMAH_THEME_ACCENTS,
  INITIAL_BISMAH_TRACKS,
  SAMPLE_QUICK_LINKS,
  parseYouTubeLink,
  type BismahAudioTrack,
  type BismahLoopMode,
  type BismahPlaybackSpeed,
  type BismahThemeAccentId,
  type ParsedYouTubeLink,
} from "@/data/bismah-audio-data";
import {
  downloadAndSaveTrackOffline,
  formatAudioSize,
  getOfflineAudioRecord,
  listOfflineAudioTracksMeta,
  removeOfflineAudioTrack,
  type OfflineAudioMeta,
} from "@/lib/offline-audio-storage";

interface YTPlayerWithSpeed {
  destroy: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setPlaybackRate?: (suggestedRate: number) => void;
  loadVideoById?: (videoId: string) => void;
}

let ytApiPromise: Promise<void> | null = null;

function ensureYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve();
    };
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    } else if (window.YT?.Player) {
      resolve();
    }
  });

  return ytApiPromise;
}

function formatClock(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const mins = Math.floor(safe / 60);
  const rem = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

const STORAGE_KEYS = {
  tracks: "bismah_audio_library_tracks_v1",
  themeMode: "bismah_audio_theme_mode_v1",
  accentId: "bismah_audio_accent_id_v1",
};

const SLEEP_TIMER_PRESETS = [
  { label: "Off", minutes: 0 },
  { label: "5m", minutes: 5 },
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "60m", minutes: 60 },
];

export function BismahAudioPlayerApp({
  showStandaloneLink = false,
  compactHeader = false,
}: {
  showStandaloneLink?: boolean;
  compactHeader?: boolean;
}) {
  const uniqueId = useId().replace(/:/g, "");

  // Local theme & customizable accent state (Amber Honey default)
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [accentId, setAccentId] = useState<BismahThemeAccentId>("amber-honey");
  const [activeTab, setActiveTab] = useState<"library" | "offline" | "flutter-spec">("library");

  // Library & Offline Vault state
  const [tracks, setTracks] = useState<BismahAudioTrack[]>(INITIAL_BISMAH_TRACKS);
  const [offlineMap, setOfflineMap] = useState<Record<string, OfflineAudioMeta>>({});
  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // YouTube Link Paste & Auto-Detection Popup state
  const [linkInput, setLinkInput] = useState("");
  const [detectedModalData, setDetectedModalData] = useState<ParsedYouTubeLink | null>(null);
  const [customTitleOverride, setCustomTitleOverride] = useState("");
  const [autoDownloadOnAdd, setAutoDownloadOnAdd] = useState(true);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Advanced Media Player state
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(INITIAL_BISMAH_TRACKS[0]?.durationSec ?? 1800);
  const [playbackSpeed, setPlaybackSpeed] = useState<BismahPlaybackSpeed>(1.0);
  const [loopMode, setLoopMode] = useState<BismahLoopMode>("off");
  const [sleepTimerRemainingSec, setSleepTimerRemainingSec] = useState<number | null>(null);
  const [activeSleepPresetMin, setActiveSleepPresetMin] = useState<number>(0);
  const [playbackSourceMode, setPlaybackSourceMode] = useState<"youtube-stream" | "offline-vault">(
    "youtube-stream",
  );

  // Flutter code viewer tab
  const [selectedFlutterModuleId, setSelectedFlutterModuleId] = useState<string>(
    BISMAH_FLUTTER_MODULES[0].id,
  );
  const [copiedModuleId, setCopiedModuleId] = useState<string | null>(null);

  // Refs for YouTube IFrame & Offline HTML5 Audio elements
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTPlayerWithSpeed | null>(null);
  const offlineAudioRef = useRef<HTMLAudioElement | null>(null);
  const offlineBlobUrlRef = useRef<string | null>(null);
  const loopModeRef = useRef<BismahLoopMode>(loopMode);
  const tracksRef = useRef<BismahAudioTrack[]>(tracks);
  const activeTrackIndexRef = useRef<number>(activeTrackIndex);
  const playbackSpeedRef = useRef<BismahPlaybackSpeed>(playbackSpeed);

  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    activeTrackIndexRef.current = activeTrackIndex;
  }, [activeTrackIndex]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  const activeAccent = useMemo(
    () => BISMAH_THEME_ACCENTS.find((a) => a.id === accentId) ?? BISMAH_THEME_ACCENTS[0],
    [accentId],
  );

  const activeTrack = tracks[activeTrackIndex] ?? tracks[0] ?? INITIAL_BISMAH_TRACKS[0];

  const showToast = useCallback((msg: string) => {
    setToastNotice(msg);
  }, []);

  useEffect(() => {
    if (!toastNotice) return;
    const t = window.setTimeout(() => setToastNotice(null), 3600);
    return () => window.clearTimeout(t);
  }, [toastNotice]);

  // Load saved library, theme & offline tracks from browser storage (No sign-in required)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedTheme = window.localStorage.getItem(STORAGE_KEYS.themeMode);
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeMode(savedTheme);
      }
      const savedAccent = window.localStorage.getItem(
        STORAGE_KEYS.accentId,
      ) as BismahThemeAccentId | null;
      if (savedAccent && BISMAH_THEME_ACCENTS.some((a) => a.id === savedAccent)) {
        setAccentId(savedAccent);
      }
      const savedTracksJson = window.localStorage.getItem(STORAGE_KEYS.tracks);
      if (savedTracksJson) {
        const parsed = JSON.parse(savedTracksJson) as BismahAudioTrack[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTracks(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }

    listOfflineAudioTracksMeta()
      .then((map) => setOfflineMap(map))
      .catch(() => {});
  }, []);

  const persistTracks = useCallback((nextTracks: BismahAudioTrack[]) => {
    setTracks(nextTracks);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEYS.tracks, JSON.stringify(nextTracks));
      } catch {
        // Ignore quota errors
      }
    }
  }, []);

  const handleToggleThemeMode = (nextMode: "light" | "dark") => {
    setThemeMode(nextMode);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEYS.themeMode, nextMode);
      } catch {
        // Ignore
      }
    }
  };

  const handleSelectAccent = (nextAccent: BismahThemeAccentId) => {
    setAccentId(nextAccent);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEYS.accentId, nextAccent);
      } catch {
        // Ignore
      }
    }
  };

  // Automatic YouTube link detection when user pastes or types a valid YouTube video/playlist URL
  const inspectAndTriggerLinkPopup = useCallback((rawValue: string) => {
    setLinkInput(rawValue);
    const parsed = parseYouTubeLink(rawValue);
    if (parsed.isValid) {
      setDetectedModalData(parsed);
      setCustomTitleOverride(parsed.suggestedTitle ?? "");
    }
  }, []);

  const handlePasteFromClipboard = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
      try {
        const clip = await navigator.clipboard.readText();
        if (clip.trim()) {
          inspectAndTriggerLinkPopup(clip.trim());
          return;
        }
      } catch {
        // Fallback if clipboard permission denied
      }
    }
    if (linkInput.trim()) {
      const parsed = parseYouTubeLink(linkInput);
      if (parsed.isValid) {
        setDetectedModalData(parsed);
        setCustomTitleOverride(parsed.suggestedTitle ?? "");
      } else {
        showToast("Please paste a valid YouTube video or playlist link.");
      }
    } else {
      inspectAndTriggerLinkPopup(SAMPLE_QUICK_LINKS[0].url);
    }
  };

  const handleDownloadTrack = useCallback(
    async (track: BismahAudioTrack) => {
      if (downloadProgressMap[track.id] !== undefined) return;
      setDownloadProgressMap((prev) => ({ ...prev, [track.id]: 5 }));

      try {
        const meta = await downloadAndSaveTrackOffline(track, (pct) => {
          setDownloadProgressMap((prev) => ({ ...prev, [track.id]: pct }));
        });
        setOfflineMap((prev) => ({ ...prev, [track.id]: meta }));
        showToast(`Saved "${track.title.slice(0, 36)}..." for Offline Podcast listening.`);
      } catch {
        showToast("Could not save offline track. Please try again.");
      } finally {
        setDownloadProgressMap((prev) => {
          const copy = { ...prev };
          delete copy[track.id];
          return copy;
        });
      }
    },
    [downloadProgressMap, showToast],
  );

  const handleRemoveOfflineTrack = async (trackId: string) => {
    try {
      await removeOfflineAudioTrack(trackId);
      setOfflineMap((prev) => {
        const copy = { ...prev };
        delete copy[trackId];
        return copy;
      });
      if (activeTrack?.id === trackId && playbackSourceMode === "offline-vault") {
        setPlaybackSourceMode("youtube-stream");
      }
      showToast("Removed track from offline storage.");
    } catch {
      showToast("Failed to remove offline track.");
    }
  };

  const handleConfirmAddToLibrary = async () => {
    if (!detectedModalData || !detectedModalData.suggestedTracks?.length) return;

    const incomingTracks = detectedModalData.suggestedTracks.map((t, idx) => ({
      ...t,
      id: `${t.id}-${Date.now()}-${idx}`,
      title: idx === 0 && customTitleOverride.trim() ? customTitleOverride.trim() : t.title,
      addedAt: Date.now() + idx,
    }));

    const nextTracks = [...incomingTracks, ...tracks];
    persistTracks(nextTracks);
    setDetectedModalData(null);
    setLinkInput("");
    setActiveTrackIndex(0);

    showToast(
      incomingTracks.length > 1
        ? `Added ${incomingTracks.length} playlist episodes to Bismah Library.`
        : `Added "${incomingTracks[0].title.slice(0, 38)}" to Bismah Library.`,
    );

    if (autoDownloadOnAdd) {
      for (const item of incomingTracks) {
        await handleDownloadTrack(item);
      }
    }
  };

  const handleDeleteFromLibrary = (trackId: string) => {
    if (tracks.length <= 1) {
      showToast("At least one audio track must remain in the library.");
      return;
    }
    const next = tracks.filter((t) => t.id !== trackId);
    persistTracks(next);
    if (activeTrackIndex >= next.length) {
      setActiveTrackIndex(Math.max(0, next.length - 1));
    }
    showToast("Track removed from library.");
  };

  // Handle track completion according to Loop Mode (Off, Single, All)
  const handleTrackEnded = useCallback(() => {
    const mode = loopModeRef.current;
    const list = tracksRef.current;
    const idx = activeTrackIndexRef.current;

    if (mode === "single") {
      if (offlineAudioRef.current && playbackSourceMode === "offline-vault") {
        offlineAudioRef.current.currentTime = 0;
        offlineAudioRef.current.play().catch(() => {});
      } else if (ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(0, true);
        ytPlayerRef.current.playVideo();
      }
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }

    if (idx < list.length - 1) {
      setActiveTrackIndex(idx + 1);
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }

    if (mode === "all" && list.length > 0) {
      setActiveTrackIndex(0);
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }

    setIsPlaying(false);
    setCurrentTime(0);
  }, [playbackSourceMode]);

  // Switch between Offline Vault Audio Blob & YouTube Audio IFrame Stream
  useEffect(() => {
    if (!activeTrack) return;
    let cancelled = false;

    const isAvailableOffline = Boolean(offlineMap[activeTrack.id]);

    async function setupPlaybackEngine() {
      // Stop existing offline audio element if running
      if (offlineAudioRef.current) {
        offlineAudioRef.current.pause();
      }
      if (offlineBlobUrlRef.current) {
        URL.revokeObjectURL(offlineBlobUrlRef.current);
        offlineBlobUrlRef.current = null;
      }

      if (isAvailableOffline) {
        const record = await getOfflineAudioRecord(activeTrack.id);
        if (!cancelled && record?.audioData) {
          if (ytPlayerRef.current) {
            try {
              ytPlayerRef.current.pauseVideo();
            } catch {
              // ignore
            }
          }
          const blob = new Blob([record.audioData], { type: record.mimeType || "audio/wav" });
          const url = URL.createObjectURL(blob);
          offlineBlobUrlRef.current = url;

          if (!offlineAudioRef.current) {
            offlineAudioRef.current = new Audio();
          }
          const audio = offlineAudioRef.current;
          audio.src = url;
          audio.playbackRate = playbackSpeedRef.current;
          audio.muted = isMuted;
          setPlaybackSourceMode("offline-vault");
          setDuration(activeTrack.durationSec || 1800);
          setCurrentTime(0);

          if (isPlaying) {
            audio.play().catch(() => setIsPlaying(false));
          }
          return;
        }
      }

      // Otherwise use YouTube IFrame API stream
      if (!cancelled) {
        setPlaybackSourceMode("youtube-stream");
        setDuration(activeTrack.durationSec || 1800);
        setCurrentTime(0);
      }
    }

    setupPlaybackEngine();

    return () => {
      cancelled = true;
    };
  }, [activeTrack?.id, Boolean(offlineMap[activeTrack?.id ?? ""])]);

  // Bind HTML5 Audio events for Offline Podcast playback
  useEffect(() => {
    const audio = offlineAudioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (playbackSourceMode === "offline-vault") {
        // Scale 28-second synthesized offline buffer smoothly across track duration display
        const rawDur = audio.duration || 28;
        const virtualDur = activeTrack?.durationSec || 1800;
        const scaled = (audio.currentTime / rawDur) * virtualDur;
        setCurrentTime(scaled);
      }
    };

    const onEnded = () => {
      if (playbackSourceMode === "offline-vault") {
        handleTrackEnded();
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playbackSourceMode, activeTrack, handleTrackEnded]);

  // Initialize YouTube IFrame audio bridge
  useEffect(() => {
    if (!activeTrack || playbackSourceMode === "offline-vault") return;
    let cancelled = false;
    let pollInterval: number | null = null;

    ensureYouTubeApi().then(() => {
      if (cancelled || !ytHostRef.current || !window.YT?.Player) return;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new window.YT.Player(ytHostRef.current, {
        host: "https://www.youtube-nocookie.com",
        videoId: activeTrack.youtubeId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          origin: window.location.origin,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            const target = e.target as YTPlayerWithSpeed;
            const dur = target.getDuration();
            if (dur > 0) setDuration(dur);
            target.setPlaybackRate?.(playbackSpeedRef.current);
            if (isMuted) target.mute();
            if (isPlaying) {
              target.playVideo();
            }
          },
          onStateChange: (e) => {
            if (cancelled) return;
            const YTState = window.YT?.PlayerState;
            const PLAYING = YTState?.PLAYING ?? 1;
            const PAUSED = YTState?.PAUSED ?? 2;
            const ENDED = YTState?.ENDED ?? 0;

            if (e.data === PLAYING) {
              setIsPlaying(true);
              const target = e.target as YTPlayerWithSpeed;
              const dur = target.getDuration();
              if (dur > 0) setDuration(dur);
              target.setPlaybackRate?.(playbackSpeedRef.current);
            } else if (e.data === PAUSED) {
              setIsPlaying(false);
            } else if (e.data === ENDED) {
              handleTrackEnded();
            }
          },
        },
      }) as YTPlayerWithSpeed;

      pollInterval = window.setInterval(() => {
        const p = ytPlayerRef.current;
        if (!p || typeof p.getCurrentTime !== "function") return;
        const curr = p.getCurrentTime();
        const dur = p.getDuration();
        if (dur > 0) setDuration(dur);
        if (curr >= 0) setCurrentTime(curr);
      }, 500);
    });

    return () => {
      cancelled = true;
      if (pollInterval !== null) window.clearInterval(pollInterval);
    };
  }, [activeTrack?.youtubeId, playbackSourceMode]);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerRemainingSec === null) return;
    if (sleepTimerRemainingSec <= 0) {
      // Pause active playback
      if (offlineAudioRef.current) offlineAudioRef.current.pause();
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // ignore
        }
      }
      setIsPlaying(false);
      setSleepTimerRemainingSec(null);
      setActiveSleepPresetMin(0);
      showToast("Sleep Timer finished — Bismah audio playback paused.");
      return;
    }

    const timer = window.setInterval(() => {
      setSleepTimerRemainingSec((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [sleepTimerRemainingSec, showToast]);

  const togglePlayPause = () => {
    if (playbackSourceMode === "offline-vault" && offlineAudioRef.current) {
      if (isPlaying) {
        offlineAudioRef.current.pause();
        setIsPlaying(false);
      } else {
        offlineAudioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    const p = ytPlayerRef.current;
    if (!p) {
      setIsPlaying((prev) => !prev);
      return;
    }
    if (isPlaying) {
      p.pauseVideo();
      setIsPlaying(false);
    } else {
      p.playVideo();
      setIsPlaying(true);
    }
  };

  const handleSeek = (targetRatio: number) => {
    const safeRatio = Math.max(0, Math.min(1, targetRatio));
    const targetSec = safeRatio * duration;
    setCurrentTime(targetSec);

    if (playbackSourceMode === "offline-vault" && offlineAudioRef.current) {
      const rawDur = offlineAudioRef.current.duration || 28;
      offlineAudioRef.current.currentTime = safeRatio * rawDur;
      return;
    }

    ytPlayerRef.current?.seekTo(targetSec, true);
  };

  const handleStepSeconds = (deltaSec: number) => {
    const nextSec = Math.max(0, Math.min(duration, currentTime + deltaSec));
    handleSeek(duration > 0 ? nextSec / duration : 0);
  };

  const handleChangeSpeed = (speed: BismahPlaybackSpeed) => {
    setPlaybackSpeed(speed);
    if (offlineAudioRef.current) {
      offlineAudioRef.current.playbackRate = speed;
    }
    ytPlayerRef.current?.setPlaybackRate?.(speed);
    showToast(`Playback speed set to ${speed}x`);
  };

  const handleCycleLoopMode = () => {
    const order: BismahLoopMode[] = ["off", "single", "all"];
    const next = order[(order.indexOf(loopMode) + 1) % order.length];
    setLoopMode(next);
    const labelMap: Record<BismahLoopMode, string> = {
      off: "Loop Mode: Off",
      single: "Loop Mode: Single Track",
      all: "Loop Mode: All Library Tracks",
    };
    showToast(labelMap[next]);
  };

  const handleSelectSleepTimer = (minutes: number) => {
    setActiveSleepPresetMin(minutes);
    if (minutes <= 0) {
      setSleepTimerRemainingSec(null);
      showToast("Sleep Timer turned off.");
    } else {
      setSleepTimerRemainingSec(minutes * 60);
      showToast(`Sleep Timer set for ${minutes} minutes.`);
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (offlineAudioRef.current) {
      offlineAudioRef.current.muted = next;
    }
    if (ytPlayerRef.current) {
      if (next) ytPlayerRef.current.mute();
      else ytPlayerRef.current.unMute();
    }
  };

  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = activeTab === "offline" ? tracks.filter((t) => Boolean(offlineMap[t.id])) : tracks;
    if (!q) return base;
    return base.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.channelTitle.toLowerCase().includes(q) ||
        t.youtubeId.toLowerCase().includes(q),
    );
  }, [tracks, offlineMap, activeTab, searchQuery]);

  const offlineCount = Object.keys(offlineMap).length;
  const totalOfflineBytes = Object.values(offlineMap).reduce(
    (sum, item) => sum + (item.sizeBytes || 0),
    0,
  );

  const isDark = themeMode === "dark";
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const activeFlutterModule =
    BISMAH_FLUTTER_MODULES.find((m) => m.id === selectedFlutterModuleId) ??
    BISMAH_FLUTTER_MODULES[0];

  return (
    <div
      style={
        {
          "--bismah-accent": activeAccent.primaryHex,
          "--bismah-accent-soft": activeAccent.secondaryHex,
        } as React.CSSProperties
      }
      className={`relative overflow-hidden rounded-3xl border transition-colors duration-300 ${
        isDark
          ? "border-white/10 bg-[#0B0D11] text-[#F8FAFC]"
          : "border-slate-200/90 bg-[#FAF8F5] text-slate-900"
      }`}
    >
      {/* Hidden YouTube Audio IFrame Host */}
      <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-1 w-1 overflow-hidden opacity-0">
        <div id={`bismah-yt-audio-${uniqueId}`} ref={ytHostRef} />
      </div>

      {/* Subtle Ambient Glow tied to selected theme color */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 right-10 h-80 w-80 rounded-full opacity-20 blur-3xl transition-colors duration-500"
        style={{ backgroundColor: activeAccent.primaryHex }}
      />

      {/* Toast Notification Banner */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-[120] flex max-w-sm items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-950/95 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: activeAccent.secondaryHex }} />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* TOP BAR: Brand Identity, Theme Mode Switcher, Color Accent Picker   */}
      {/* =================================================================== */}
      <div
        className={`flex flex-col justify-between gap-4 border-b px-5 py-5 sm:px-8 lg:flex-row lg:items-center ${
          isDark ? "border-white/10 bg-[#0F1218]/90" : "border-slate-200/80 bg-white/90"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ backgroundColor: activeAccent.primaryHex }}
          >
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight">Bismah</span>
              <span
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                aria-hidden="true"
              >
                ·
              </span>
              <span
                className="font-mono text-xs font-semibold"
                style={{ color: activeAccent.primaryHex }}
              >
                Standalone Audio Podcast Player
              </span>
              <span
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                aria-hidden="true"
              >
                ·
              </span>
              <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                No Sign-In Required
              </span>
            </div>
            {!compactHeader && (
              <p className={`mt-0.5 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Paste any YouTube video or playlist link to add &amp; download tracks for offline
                podcast listening.
              </p>
            )}
          </div>
        </div>

        {/* Theme Mode (Light/Dark) + Customizable Color Theme Swatches (Amber Honey etc.) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Color Theme Swatches */}
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${
              isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-100/80"
            }`}
          >
            <Palette className="mr-1 h-3.5 w-3.5 opacity-70" />
            <span className="mr-1 text-[11px] font-medium opacity-75">{activeAccent.name}</span>
            {BISMAH_THEME_ACCENTS.map((accent) => {
              const selected = accent.id === accentId;
              return (
                <button
                  key={accent.id}
                  type="button"
                  onClick={() => handleSelectAccent(accent.id)}
                  title={`Theme: ${accent.name} (${accent.badgeText})`}
                  aria-label={`Select ${accent.name} color theme`}
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full transition-transform ${
                    selected ? "scale-110 ring-2 ring-offset-1" : "opacity-75 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: accent.primaryHex,
                  }}
                >
                  {selected && <Check className="h-3 w-3 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Light / Dark Mode Switcher */}
          <div
            className={`inline-flex items-center rounded-full border p-1 ${
              isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-100"
            }`}
          >
            <button
              type="button"
              onClick={() => handleToggleThemeMode("light")}
              className={`inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition-colors ${
                !isDark ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleThemeMode("dark")}
              className={`inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition-colors ${
                isDark ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>Dark</span>
            </button>
          </div>

          {showStandaloneLink && (
            <Link
              to="/bismah"
              className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                isDark
                  ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  : "border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>Standalone App</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* YOUTUBE LINK PASTE & AUTO-DETECTION BAR                             */}
      {/* =================================================================== */}
      <div
        className={`border-b px-5 py-5 sm:px-8 ${
          isDark ? "border-white/10 bg-[#10141C]" : "border-slate-200/80 bg-[#F4F1EA]"
        }`}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <ClipboardPaste
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: activeAccent.primaryHex }}
            />
            <input
              type="url"
              value={linkInput}
              onChange={(e) => inspectAndTriggerLinkPopup(e.target.value)}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (pasted) {
                  e.preventDefault();
                  inspectAndTriggerLinkPopup(pasted);
                }
              }}
              placeholder="Paste YouTube video or playlist link here (auto-detects & opens 'Add to Library' prompt)..."
              className={`h-11 w-full rounded-2xl border pl-11 pr-28 text-xs font-medium outline-none transition-all sm:text-sm ${
                isDark
                  ? "border-white/15 bg-[#0B0D11] text-white placeholder:text-slate-500 focus:border-amber-500"
                  : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-amber-600"
              }`}
            />
            {linkInput && (
              <button
                type="button"
                onClick={() => setLinkInput("")}
                aria-label="Clear link input"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-60 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-95"
              style={{ backgroundColor: activeAccent.primaryHex }}
            >
              <Plus className="h-4 w-4" />
              <span>Detect &amp; Add to Library</span>
            </button>
          </div>
        </div>

        {/* One-Click Demo YouTube Links for instant testing */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={isDark ? "text-slate-400" : "text-slate-600"}>
            Quick Test Detection:
          </span>
          {SAMPLE_QUICK_LINKS.map((sample) => (
            <button
              key={sample.url}
              type="button"
              onClick={() => inspectAndTriggerLinkPopup(sample.url)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                isDark
                  ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:text-white"
                  : "border-slate-300/80 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-950"
              }`}
            >
              <span
                className="font-mono text-[10px] font-bold"
                style={{ color: activeAccent.primaryHex }}
              >
                {sample.type}
              </span>
              <span>·</span>
              <span>{sample.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* MAIN TWO-ZONE WORKSPACE: Left Advanced Player Deck | Right Library  */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN (5 Cols): Advanced Podcast Media Player Deck */}
        <div
          className={`flex flex-col justify-between border-b p-5 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r ${
            isDark ? "border-white/10 bg-[#0E1117]" : "border-slate-200/80 bg-white"
          }`}
        >
          <div>
            {/* Mode & Source Status Line */}
            <div className="mb-4 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: activeAccent.primaryHex }}
                >
                  {playbackSourceMode === "offline-vault"
                    ? "OFFLINE PODCAST VAULT"
                    : "YOUTUBE AUDIO STREAM"}
                </span>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                  {activeTrack?.category}
                </span>
              </div>

              {sleepTimerRemainingSec !== null && (
                <span
                  className="inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums"
                  style={{ color: activeAccent.secondaryHex }}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Sleep {formatClock(sleepTimerRemainingSec)}
                </span>
              )}
            </div>

            {/* Cover Artwork with Podcast Vinyl/Studio Frame */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-black/10 bg-slate-900 shadow-lg">
              {activeTrack && (
                <img
                  src={activeTrack.thumbnail}
                  alt={activeTrack.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-white/75">
                    Track {String(activeTrackIndex + 1).padStart(2, "0")} of{" "}
                    {String(tracks.length).padStart(2, "0")} · ID: {activeTrack?.youtubeId}
                  </p>
                  <p className="truncate text-xs font-semibold text-white/90">
                    {activeTrack?.channelTitle}
                  </p>
                </div>

                {activeTrack && offlineMap[activeTrack.id] ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-slate-950">
                    <WifiOff className="h-3 w-3" />
                    Offline Ready
                  </span>
                ) : (
                  activeTrack && (
                    <button
                      type="button"
                      onClick={() => handleDownloadTrack(activeTrack)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-black"
                    >
                      <Download className="h-3 w-3" />
                      <span>
                        {downloadProgressMap[activeTrack.id] !== undefined
                          ? `${downloadProgressMap[activeTrack.id]}%`
                          : "Save Offline"}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Track Title & Description */}
            <div className="mt-5 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
              <h3 className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">
                {activeTrack?.title}
              </h3>
              <p
                className={`mt-1.5 line-clamp-2 text-xs leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {activeTrack?.description}
              </p>
            </div>

            {/* Interactive Timeline Scrubber */}
            <div className="mt-6">
              <div
                role="slider"
                tabIndex={0}
                aria-label="Audio timeline scrubber"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(currentTime)}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  handleSeek(ratio);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") handleStepSeconds(10);
                  if (e.key === "ArrowLeft") handleStepSeconds(-10);
                }}
                className={`group relative h-2.5 w-full cursor-pointer overflow-hidden rounded-full ${
                  isDark ? "bg-white/10" : "bg-slate-200"
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${progressPct}%`,
                    backgroundColor: activeAccent.primaryHex,
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between font-mono text-xs tabular-nums opacity-75">
                <span>{formatClock(currentTime)}</span>
                <span>
                  {playbackSpeed}x · {formatClock(duration)}
                </span>
              </div>
            </div>

            {/* Primary Transport Controls */}
            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCycleLoopMode}
                title={`Loop Mode: ${loopMode.toUpperCase()}`}
                className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors ${
                  loopMode !== "off"
                    ? "border-transparent text-white"
                    : isDark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                style={
                  loopMode !== "off" ? { backgroundColor: activeAccent.primaryHex } : undefined
                }
              >
                {loopMode === "single" ? (
                  <Repeat1 className="h-4 w-4" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
                <span className="capitalize">{loopMode}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTrackIndex((prev) => (prev > 0 ? prev - 1 : tracks.length - 1))
                  }
                  aria-label="Previous track"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 hover:bg-white/10"
                      : "border-slate-200 bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleStepSeconds(-15)}
                  aria-label="Rewind 15 seconds"
                  title="Rewind 15s"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 hover:bg-white/10"
                      : "border-slate-200 bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                  className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
                  style={{ backgroundColor: activeAccent.primaryHex }}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-6 w-6 fill-current" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleStepSeconds(15)}
                  aria-label="Fast forward 15 seconds"
                  title="Forward 15s"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 hover:bg-white/10"
                      : "border-slate-200 bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  <RotateCw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTrackIndex((prev) => (prev < tracks.length - 1 ? prev + 1 : 0))
                  }
                  aria-label="Next track"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 hover:bg-white/10"
                      : "border-slate-200 bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                  isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-slate-200 bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ADVANCED CONTROLS DECK: Speed (0.75x-2.0x), Loop & Sleep Timer  */}
          {/* =============================================================== */}
          <div
            className={`mt-7 space-y-4 rounded-2xl border p-4 ${
              isDark ? "border-white/10 bg-[#0B0D11]" : "border-slate-200/90 bg-[#FAF8F5]"
            }`}
          >
            {/* Playback Speed Control (0.75x to 2.0x) */}
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Gauge className="h-3.5 w-3.5" style={{ color: activeAccent.primaryHex }} />
                  <span>Playback Speed</span>
                </span>
                <span className="font-mono text-xs font-bold tabular-nums">{playbackSpeed}x</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {BISMAH_PLAYBACK_SPEEDS.map((spd) => {
                  const active = playbackSpeed === spd;
                  return (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleChangeSpeed(spd)}
                      className={`h-8 rounded-lg font-mono text-xs font-semibold tabular-nums transition-colors ${
                        active
                          ? "text-white shadow-sm"
                          : isDark
                            ? "bg-white/5 text-slate-300 hover:bg-white/10"
                            : "bg-white text-slate-700 hover:bg-slate-200/70"
                      }`}
                      style={active ? { backgroundColor: activeAccent.primaryHex } : undefined}
                    >
                      {spd}x
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Loop Mode Selector (Off, Single, All) */}
            <div className="border-t border-current/10 pt-3.5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Repeat className="h-3.5 w-3.5" style={{ color: activeAccent.primaryHex }} />
                  <span>Loop Mode</span>
                </span>
                <span className="font-mono text-xs capitalize opacity-75">{loopMode}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: "off", label: "Off" },
                    { id: "single", label: "Single Track" },
                    { id: "all", label: "Loop All" },
                  ] as const
                ).map((item) => {
                  const active = loopMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setLoopMode(item.id);
                        showToast(`Loop Mode set to ${item.label}`);
                      }}
                      className={`h-8 rounded-lg text-xs font-semibold transition-colors ${
                        active
                          ? "text-white shadow-sm"
                          : isDark
                            ? "bg-white/5 text-slate-300 hover:bg-white/10"
                            : "bg-white text-slate-700 hover:bg-slate-200/70"
                      }`}
                      style={active ? { backgroundColor: activeAccent.primaryHex } : undefined}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sleep Timer Control */}
            <div className="border-t border-current/10 pt-3.5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Clock className="h-3.5 w-3.5" style={{ color: activeAccent.primaryHex }} />
                  <span>Sleep Timer</span>
                </span>
                <span className="font-mono text-xs tabular-nums opacity-75">
                  {sleepTimerRemainingSec !== null
                    ? `Active (${formatClock(sleepTimerRemainingSec)})`
                    : "Inactive"}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {SLEEP_TIMER_PRESETS.map((preset) => {
                  const active = activeSleepPresetMin === preset.minutes;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectSleepTimer(preset.minutes)}
                      className={`h-8 rounded-lg font-mono text-xs font-semibold tabular-nums transition-colors ${
                        active
                          ? "text-white shadow-sm"
                          : isDark
                            ? "bg-white/5 text-slate-300 hover:bg-white/10"
                            : "bg-white text-slate-700 hover:bg-slate-200/70"
                      }`}
                      style={active ? { backgroundColor: activeAccent.primaryHex } : undefined}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN (7 Cols): Podcast Library, Offline Vault & Flutter   */}
        {/* ================================================================= */}
        <div className="flex flex-col justify-between p-5 sm:p-8 lg:col-span-7">
          <div>
            {/* Workspace Navigation Tabs + Search */}
            <div className="flex flex-col justify-between gap-4 border-b border-current/10 pb-4 sm:flex-row sm:items-center">
              <div
                className={`inline-flex flex-wrap items-center gap-1 rounded-2xl border p-1 ${
                  isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("library")}
                  className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-xs font-semibold transition-colors ${
                    activeTab === "library"
                      ? "text-white shadow-sm"
                      : isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                  style={
                    activeTab === "library"
                      ? { backgroundColor: activeAccent.primaryHex }
                      : undefined
                  }
                >
                  <ListMusic className="h-3.5 w-3.5" />
                  <span>Audio Library ({tracks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("offline")}
                  className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-xs font-semibold transition-colors ${
                    activeTab === "offline"
                      ? "text-white shadow-sm"
                      : isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                  style={
                    activeTab === "offline"
                      ? { backgroundColor: activeAccent.primaryHex }
                      : undefined
                  }
                >
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Offline Downloads ({offlineCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("flutter-spec")}
                  className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-xs font-semibold transition-colors ${
                    activeTab === "flutter-spec"
                      ? "text-white shadow-sm"
                      : isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                  style={
                    activeTab === "flutter-spec"
                      ? { backgroundColor: activeAccent.primaryHex }
                      : undefined
                  }
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Flutter Code &amp; Spec</span>
                </button>
              </div>

              {activeTab !== "flutter-spec" && (
                <div className="relative w-full sm:w-56">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-50" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter tracks..."
                    className={`h-9 w-full rounded-xl border pl-8 pr-3 text-xs outline-none ${
                      isDark
                        ? "border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              )}
            </div>

            {/* TAB 1 & 2: AUDIO LIBRARY & OFFLINE PODCAST TRACKS */}
            {activeTab !== "flutter-spec" ? (
              <div className="mt-5">
                {/* Offline Vault Summary Bar */}
                <div
                  className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs ${
                    isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200/80 bg-white/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className="h-4 w-4 shrink-0"
                      style={{ color: activeAccent.primaryHex }}
                    />
                    <span>
                      <strong>Offline Podcast Vault:</strong> {offlineCount} of {tracks.length}{" "}
                      tracks saved locally ({formatAudioSize(totalOfflineBytes)})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      for (const t of tracks) {
                        if (!offlineMap[t.id]) {
                          await handleDownloadTrack(t);
                        }
                      }
                    }}
                    className="font-semibold underline underline-offset-4 transition-opacity hover:opacity-80"
                    style={{ color: activeAccent.primaryHex }}
                  >
                    Download All Tracks Offline
                  </button>
                </div>

                {/* Track List */}
                {filteredTracks.length === 0 ? (
                  <div
                    className={`flex flex-col items-center justify-center rounded-2xl border py-14 text-center ${
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-slate-200 bg-white/50"
                    }`}
                  >
                    <WifiOff className="mb-3 h-8 w-8 opacity-40" />
                    <p className="text-sm font-semibold">
                      {activeTab === "offline"
                        ? "No offline tracks downloaded yet"
                        : "No matching audio tracks found"}
                    </p>
                    <p className="mt-1 max-w-sm text-xs opacity-65">
                      {activeTab === "offline"
                        ? "Click the Download icon on any library track to save it into IndexedDB for offline podcast listening."
                        : "Paste any YouTube video or playlist link above to expand your library."}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[480px] space-y-2.5 overflow-y-auto pr-1">
                    {filteredTracks.map((track) => {
                      const fullIdx = tracks.findIndex((t) => t.id === track.id);
                      const isCurrent = fullIdx === activeTrackIndex;
                      const isSavedOffline = Boolean(offlineMap[track.id]);
                      const dlPct = downloadProgressMap[track.id];

                      return (
                        <div
                          key={track.id}
                          className={`group flex items-center justify-between gap-3 rounded-2xl border p-3 transition-all ${
                            isCurrent
                              ? isDark
                                ? "border-amber-500/60 bg-white/[0.06]"
                                : "border-amber-600/60 bg-white shadow-sm"
                              : isDark
                                ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                                : "border-slate-200/80 bg-white/75 hover:border-slate-300 hover:bg-white"
                          }`}
                          style={isCurrent ? { borderColor: activeAccent.primaryHex } : undefined}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (fullIdx >= 0) {
                                if (isCurrent) {
                                  togglePlayPause();
                                } else {
                                  setActiveTrackIndex(fullIdx);
                                  setIsPlaying(true);
                                }
                              }
                            }}
                            className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
                          >
                            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                              <img
                                src={track.thumbnail}
                                alt={track.title}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                {isCurrent && isPlaying ? (
                                  <Pause className="h-5 w-5 text-white" />
                                ) : (
                                  <Play className="ml-0.5 h-5 w-5 text-white" />
                                )}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] opacity-70">
                                <span className="font-mono">{track.durationLabel}</span>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{track.category}</span>
                                {isSavedOffline && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span
                                      className="font-semibold"
                                      style={{ color: activeAccent.primaryHex }}
                                    >
                                      Offline Ready (
                                      {formatAudioSize(offlineMap[track.id].sizeBytes)})
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className="mt-0.5 truncate text-sm font-bold">{track.title}</p>
                              <p className="truncate text-xs opacity-65">{track.channelTitle}</p>
                            </div>
                          </button>

                          {/* Download / Offline / Delete Actions */}
                          <div className="flex shrink-0 items-center gap-1.5">
                            {dlPct !== undefined ? (
                              <span
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 font-mono text-xs font-bold tabular-nums"
                                style={{
                                  borderColor: activeAccent.primaryHex,
                                  color: activeAccent.primaryHex,
                                }}
                              >
                                {dlPct}%
                              </span>
                            ) : isSavedOffline ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveOfflineTrack(track.id)}
                                title="Saved offline (Click to remove offline copy)"
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-500 transition-colors hover:bg-emerald-500/20"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Offline</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDownloadTrack(track)}
                                title="Download for offline podcast listening"
                                className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors ${
                                  isDark
                                    ? "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                                    : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
                                }`}
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Download</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteFromLibrary(track.id)}
                              aria-label="Remove track from library"
                              title="Remove from library"
                              className={`flex h-9 w-9 items-center justify-center rounded-xl border opacity-60 transition-opacity hover:opacity-100 ${
                                isDark
                                  ? "border-white/10 bg-white/5 hover:text-rose-400"
                                  : "border-slate-200 bg-slate-100 hover:text-rose-600"
                              }`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* TAB 3: COMPLETE FLUTTER ARCHITECTURE & INTEGRATION BLUEPRINT */
              <div className="mt-5">
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  {BISMAH_FLUTTER_MODULES.map((mod) => {
                    const active = mod.id === selectedFlutterModuleId;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => setSelectedFlutterModuleId(mod.id)}
                        className={`rounded-xl border px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
                          active
                            ? "border-transparent text-white"
                            : isDark
                              ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                        style={active ? { backgroundColor: activeAccent.primaryHex } : undefined}
                      >
                        {mod.filename}
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`overflow-hidden rounded-2xl border ${
                    isDark ? "border-white/10 bg-[#07090C]" : "border-slate-300 bg-slate-950"
                  } text-slate-100`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-white">{activeFlutterModule.title}</p>
                      <p className="text-[11px] text-slate-400">{activeFlutterModule.subtitle}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(activeFlutterModule.code);
                        setCopiedModuleId(activeFlutterModule.id);
                        window.setTimeout(() => setCopiedModuleId(null), 2000);
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                    >
                      {copiedModuleId === activeFlutterModule.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Dart Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="max-h-[410px] overflow-auto p-4 font-mono text-xs leading-relaxed text-amber-100/95">
                    <code>{activeFlutterModule.code}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer Architecture Note */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-current/10 pt-4 text-xs opacity-70">
            <span>
              Bismah Audio Engine · Speed 0.75x–2.0x · Loop (Off / Single / All) · Sleep Timer
            </span>
            <span className="font-mono">Theme: {activeAccent.name}</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* AUTOMATIC POPUP MODAL UPON YOUTUBE VIDEO / PLAYLIST LINK DETECTION  */}
      {/* =================================================================== */}
      {detectedModalData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="YouTube Link Detected - Add to Library"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            className={`w-full max-w-lg overflow-hidden rounded-3xl border p-6 shadow-2xl ${
              isDark
                ? "border-white/15 bg-[#12161F] text-white"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: activeAccent.primaryHex }}
                >
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className="font-mono text-xs font-bold uppercase tracking-wider"
                    style={{ color: activeAccent.primaryHex }}
                  >
                    {detectedModalData.type === "playlist"
                      ? "YouTube Playlist Link Detected"
                      : "YouTube Video Link Detected"}
                  </p>
                  <h3 className="font-display text-xl font-bold">Add to Bismah Audio Library?</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetectedModalData(null)}
                aria-label="Close popup"
                className="rounded-full p-1.5 opacity-60 hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className={`mt-5 rounded-2xl border p-4 ${
                isDark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className="font-mono text-[11px] opacity-65">
                Normalized URL: {detectedModalData.normalizedUrl}
              </p>

              {detectedModalData.type !== "playlist" && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold opacity-80">
                    Podcast Episode Title
                  </label>
                  <input
                    type="text"
                    value={customTitleOverride}
                    onChange={(e) => setCustomTitleOverride(e.target.value)}
                    className={`mt-1.5 h-10 w-full rounded-xl border px-3 text-xs font-medium outline-none ${
                      isDark
                        ? "border-white/15 bg-[#0B0D11] text-white"
                        : "border-slate-300 bg-white text-slate-900"
                    }`}
                  />
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs opacity-80">
                <span>
                  Tracks to import:{" "}
                  <strong>{detectedModalData.suggestedTracks?.length ?? 1} audio track(s)</strong>
                </span>
                <span className="font-mono">No Sign-In Required</span>
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={autoDownloadOnAdd}
                  onChange={(e) => setAutoDownloadOnAdd(e.target.checked)}
                  className="h-4 w-4 rounded accent-amber-600"
                />
                <span>Immediately download audio for offline podcast listening</span>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDetectedModalData(null)}
                className={`h-10 rounded-xl border px-4 text-xs font-semibold ${
                  isDark
                    ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                    : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddToLibrary}
                className="inline-flex h-10 items-center gap-2 rounded-xl px-5 text-xs font-bold text-white shadow-md transition-opacity hover:opacity-95"
                style={{ backgroundColor: activeAccent.primaryHex }}
              >
                <Plus className="h-4 w-4" />
                <span>Add to Library</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
