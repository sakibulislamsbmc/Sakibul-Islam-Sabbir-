import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  AudioLines,
  Check,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Disc3,
  Download,
  Gauge,
  Home,
  LayoutGrid,
  Loader2,
  Monitor,
  Moon,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Repeat,
  Repeat1,
  Rows2,
  Settings,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sun,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  BISMAH_PLAYBACK_SPEEDS,
  BISMAH_SLEEP_PRESETS,
  BISMAH_THEME_ACCENTS,
  extractYouTubeIds,
  formatDurationClock,
  resolveYouTubeLinkTracks,
  type BismahAppearanceMode,
  type BismahAudioTrack,
  type BismahLoopMode,
  type BismahPlaybackSpeed,
  type BismahThemeAccentId,
  type BismahViewStyle,
} from "@/data/bismah-audio-data";
import {
  clearAllOfflineAudioEntries,
  downloadTrackForOffline,
  formatStorageMb,
  getOfflineAudioEntry,
  listOfflineAudioMeta,
  removeOfflineAudioEntry,
  saveLocalAudioFileToVault,
  type OfflineAudioMeta,
} from "@/lib/offline-audio-storage";

interface YTPlayerFull {
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
  loadVideoById?: (arg: string | { videoId: string; startSeconds?: number }) => void;
}

let ytIframePromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytIframePromise) return ytIframePromise;

  ytIframePromise = new Promise((resolve) => {
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

  return ytIframePromise;
}

const STORAGE_KEYS = {
  tracks: "bismah_audiobook_tracks_v2",
  appearance: "bismah_audiobook_appearance_v2",
  accent: "bismah_audiobook_accent_v2",
  viewStyle: "bismah_audiobook_view_style_v2",
  clipboardPrompt: "bismah_audiobook_clipboard_prompt_v2",
};

interface DownloadProgressState {
  percent: number;
  status: string;
}

export function BismahAudioPlayerApp({
  showStandaloneLink = false,
  fullHeight = false,
}: {
  showStandaloneLink?: boolean;
  fullHeight?: boolean;
}) {
  const uniqueId = useId().replace(/:/g, "");

  // Settings & Preferences (Clean Light Mode + Website Minimal default)
  const [appearance, setAppearance] = useState<BismahAppearanceMode>("light");
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(false);
  const [accentId, setAccentId] = useState<BismahThemeAccentId>("website-minimal");
  const [viewStyle, setViewStyle] = useState<BismahViewStyle>("grid");
  const [clipboardPromptEnabled, setClipboardPromptEnabled] = useState<boolean>(true);

  // Screens & Modals
  const [screen, setScreen] = useState<"library" | "settings">("library");
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [nowPlayingExpanded, setNowPlayingExpanded] = useState<boolean>(false);
  const [audioControlsOpen, setAudioControlsOpen] = useState<boolean>(false);

  // Add Track / Playlist Modal State
  const [urlInput, setUrlInput] = useState<string>("");
  const [isResolvingUrl, setIsResolvingUrl] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const lastClipboardPromptedRef = useRef<string>("");

  // Library (STARTS COMPLETELY EMPTY — ONLY USER-ADDED AUDIO)
  const [tracks, setTracks] = useState<BismahAudioTrack[]>([]);
  const [offlineMap, setOfflineMap] = useState<Record<string, OfflineAudioMeta>>({});
  const [downloadsMap, setDownloadsMap] = useState<Record<string, DownloadProgressState>>({});

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Player State
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<BismahPlaybackSpeed>(1.0);
  const [loopMode, setLoopMode] = useState<BismahLoopMode>("off");
  const [sleepTimerMin, setSleepTimerMin] = useState<number>(0);
  const [sleepRemainingSec, setSleepRemainingSec] = useState<number | null>(null);
  const [activeEngine, setActiveEngine] = useState<"none" | "youtube" | "native">("none");

  // Media Refs
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const nativeBlobUrlRef = useRef<string | null>(null);
  const ytHostRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerFull | null>(null);
  const ytReadyRef = useRef<boolean>(false);
  const pendingYtVideoIdRef = useRef<string | null>(null);
  const ytPollTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Latest-state refs for async callbacks
  const tracksRef = useRef<BismahAudioTrack[]>(tracks);
  const activeTrackIdRef = useRef<string | null>(activeTrackId);
  const loopModeRef = useRef<BismahLoopMode>(loopMode);
  const speedRef = useRef<BismahPlaybackSpeed>(playbackSpeed);
  const activeEngineRef = useRef<"none" | "youtube" | "native">(activeEngine);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);
  useEffect(() => {
    activeTrackIdRef.current = activeTrackId;
  }, [activeTrackId]);
  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);
  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);
  useEffect(() => {
    activeEngineRef.current = activeEngine;
  }, [activeEngine]);

  const showToast = useCallback((message: string) => {
    setToastMsg(message);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const id = window.setTimeout(() => setToastMsg(null), 3400);
    return () => window.clearTimeout(id);
  }, [toastMsg]);

  // System dark mode detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDark = appearance === "dark" || (appearance === "system" && systemPrefersDark);

  const activeAccent = useMemo(
    () => BISMAH_THEME_ACCENTS.find((a) => a.id === accentId) ?? BISMAH_THEME_ACCENTS[0],
    [accentId],
  );

  const accentColor = isDark ? activeAccent.darkPrimaryHex : activeAccent.primaryHex;
  const onAccentColor = isDark ? activeAccent.onPrimaryDark : activeAccent.onPrimaryLight;
  const accentSoftBg = isDark ? activeAccent.softTintDark : activeAccent.softTintLight;

  const activeTrack = useMemo(
    () => tracks.find((t) => t.id === activeTrackId) ?? null,
    [tracks, activeTrackId],
  );

  // Hydrate saved user library & preferences from localStorage + IndexedDB (zero sign-in)
  const refreshOfflineStorage = useCallback(async () => {
    const meta = await listOfflineAudioMeta();
    setOfflineMap(meta);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedApp = window.localStorage.getItem(
        STORAGE_KEYS.appearance,
      ) as BismahAppearanceMode | null;
      if (savedApp === "light" || savedApp === "dark" || savedApp === "system") {
        setAppearance(savedApp);
      }
      const savedAccent = window.localStorage.getItem(
        STORAGE_KEYS.accent,
      ) as BismahThemeAccentId | null;
      if (savedAccent && BISMAH_THEME_ACCENTS.some((a) => a.id === savedAccent)) {
        setAccentId(savedAccent);
      }
      const savedView = window.localStorage.getItem(
        STORAGE_KEYS.viewStyle,
      ) as BismahViewStyle | null;
      if (savedView === "grid" || savedView === "list") {
        setViewStyle(savedView);
      }
      const savedClip = window.localStorage.getItem(STORAGE_KEYS.clipboardPrompt);
      if (savedClip === "false") {
        setClipboardPromptEnabled(false);
      }
      const savedTracksRaw = window.localStorage.getItem(STORAGE_KEYS.tracks);
      if (savedTracksRaw) {
        const parsed = JSON.parse(savedTracksRaw) as BismahAudioTrack[];
        if (Array.isArray(parsed)) {
          setTracks(parsed);
        }
      }
    } catch {
      // Ignore storage read errors
    }

    refreshOfflineStorage().catch(() => {});
  }, [refreshOfflineStorage]);

  const persistTracks = useCallback((next: BismahAudioTrack[]) => {
    setTracks(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEYS.tracks, JSON.stringify(next));
      } catch {
        // Ignore quota errors
      }
    }
  }, []);

  const updateTrackDuration = useCallback((trackId: string, sec: number) => {
    if (!Number.isFinite(sec) || sec <= 0) return;
    const rounded = Math.round(sec);
    setTracks((prev) => {
      let changed = false;
      const next = prev.map((t) => {
        if (t.id === trackId && Math.abs((t.durationSec || 0) - rounded) >= 2) {
          changed = true;
          return { ...t, durationSec: rounded };
        }
        return t;
      });
      if (changed && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEYS.tracks, JSON.stringify(next));
        } catch {
          // Ignore
        }
      }
      return changed ? next : prev;
    });
  }, []);

  // Optional Clipboard Link Detection on window focus (matching Settings toggle)
  useEffect(() => {
    if (!clipboardPromptEnabled || typeof window === "undefined") return;
    const checkClipboard = async () => {
      if (addModalOpen || screen !== "library") return;
      if (!navigator.clipboard?.readText) return;
      try {
        const text = (await navigator.clipboard.readText()).trim();
        if (!text || text === lastClipboardPromptedRef.current) return;
        const parsed = extractYouTubeIds(text);
        if (parsed.isValid) {
          lastClipboardPromptedRef.current = text;
          setUrlInput(text);
          setUrlError(null);
          setAddModalOpen(true);
        }
      } catch {
        // Browser did not grant passive clipboard permission — ignore quietly
      }
    };

    window.addEventListener("focus", checkClipboard);
    return () => window.removeEventListener("focus", checkClipboard);
  }, [clipboardPromptEnabled, addModalOpen, screen]);

  // Save preference helpers
  const changeAppearance = (next: BismahAppearanceMode) => {
    setAppearance(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.appearance, next);
    } catch {
      // Ignore
    }
  };

  const changeAccent = (next: BismahThemeAccentId) => {
    setAccentId(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.accent, next);
    } catch {
      // Ignore
    }
  };

  const changeViewStyle = (next: BismahViewStyle) => {
    setViewStyle(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.viewStyle, next);
    } catch {
      // Ignore
    }
  };

  const toggleClipboardPrompt = () => {
    const next = !clipboardPromptEnabled;
    setClipboardPromptEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.clipboardPrompt, String(next));
    } catch {
      // Ignore
    }
  };

  // =========================================================================
  // ROCK-SOLID DUAL AUDIO ENGINE (Native HTML5 Audio Blob + Persistent YT API)
  // =========================================================================

  const stopBothEngines = useCallback(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }
    if (ytPlayerRef.current && ytReadyRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        // Ignore
      }
    }
  }, []);

  const handlePlaybackFinishedRef = useRef<() => void>(() => {});

  const ensureYouTubePlayerInitialized = useCallback(
    (initialVideoId: string) => {
      pendingYtVideoIdRef.current = initialVideoId;

      if (ytPlayerRef.current && ytReadyRef.current) {
        try {
          ytPlayerRef.current.loadVideoById?.({ videoId: initialVideoId, startSeconds: 0 });
          ytPlayerRef.current.setPlaybackRate?.(speedRef.current);
          ytPlayerRef.current.playVideo();
        } catch {
          // Ignore
        }
        return;
      }

      loadYouTubeIframeApi().then(() => {
        if (!ytHostRef.current || !window.YT?.Player) return;
        if (ytPlayerRef.current) {
          if (ytReadyRef.current && pendingYtVideoIdRef.current) {
            ytPlayerRef.current.loadVideoById?.({
              videoId: pendingYtVideoIdRef.current,
              startSeconds: 0,
            });
            ytPlayerRef.current.setPlaybackRate?.(speedRef.current);
            ytPlayerRef.current.playVideo();
          }
          return;
        }

        const vidToLoad = pendingYtVideoIdRef.current || initialVideoId;
        ytPlayerRef.current = new window.YT.Player(ytHostRef.current, {
          host: "https://www.youtube.com",
          videoId: vidToLoad,
          playerVars: {
            autoplay: 1,
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
            onReady: (event) => {
              ytReadyRef.current = true;
              const target = event.target as YTPlayerFull;
              target.setPlaybackRate?.(speedRef.current);
              const dur = target.getDuration();
              if (dur > 0) {
                setDuration(dur);
                if (activeTrackIdRef.current) {
                  updateTrackDuration(activeTrackIdRef.current, dur);
                }
              }
              if (pendingYtVideoIdRef.current && pendingYtVideoIdRef.current !== vidToLoad) {
                target.loadVideoById?.({
                  videoId: pendingYtVideoIdRef.current,
                  startSeconds: 0,
                });
              }
              target.playVideo();
            },
            onStateChange: (event) => {
              const YTState = window.YT?.PlayerState;
              const PLAYING = YTState?.PLAYING ?? 1;
              const PAUSED = YTState?.PAUSED ?? 2;
              const BUFFERING = YTState?.BUFFERING ?? 3;
              const ENDED = YTState?.ENDED ?? 0;

              if (activeEngineRef.current !== "youtube") return;

              if (event.data === PLAYING) {
                setIsBuffering(false);
                setIsPlaying(true);
                const target = event.target as YTPlayerFull;
                target.setPlaybackRate?.(speedRef.current);
                const dur = target.getDuration();
                if (dur > 0) {
                  setDuration(dur);
                  if (activeTrackIdRef.current) {
                    updateTrackDuration(activeTrackIdRef.current, dur);
                  }
                }
              } else if (event.data === BUFFERING) {
                setIsBuffering(true);
              } else if (event.data === PAUSED) {
                setIsBuffering(false);
                setIsPlaying(false);
              } else if (event.data === ENDED) {
                setIsBuffering(false);
                handlePlaybackFinishedRef.current();
              }
            },
          },
        }) as YTPlayerFull;

        if (ytPollTimerRef.current !== null) {
          window.clearInterval(ytPollTimerRef.current);
        }
        ytPollTimerRef.current = window.setInterval(() => {
          if (activeEngineRef.current !== "youtube") return;
          const p = ytPlayerRef.current;
          if (!p || !ytReadyRef.current || typeof p.getCurrentTime !== "function") return;
          const curr = p.getCurrentTime();
          const dur = p.getDuration();
          if (dur > 0) {
            setDuration(dur);
            if (activeTrackIdRef.current) {
              updateTrackDuration(activeTrackIdRef.current, dur);
            }
          }
          if (curr >= 0) setCurrentTime(curr);
        }, 400);
      });
    },
    [updateTrackDuration],
  );

  // Cleanup YouTube player & object URLs on unmount
  useEffect(() => {
    return () => {
      if (ytPollTimerRef.current !== null) {
        window.clearInterval(ytPollTimerRef.current);
      }
      if (nativeBlobUrlRef.current) {
        URL.revokeObjectURL(nativeBlobUrlRef.current);
      }
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignore
        }
        ytPlayerRef.current = null;
      }
    };
  }, []);

  // Preload YouTube IFrame script eagerly so first play is instant
  useEffect(() => {
    loadYouTubeIframeApi().catch(() => {});
  }, []);

  // Start playing a specific track (handles BOTH real offline audio Blob & YouTube stream reliably!)
  const playTrack = useCallback(
    async (track: BismahAudioTrack) => {
      setActiveTrackId(track.id);
      activeTrackIdRef.current = track.id;
      setCurrentTime(0);
      setDuration(track.durationSec || 0);
      setIsBuffering(true);

      // Pause both engines first
      stopBothEngines();

      // Check if we have a REAL audio binary stored in IndexedDB (either real extracted audio or local MP3/M4A)
      const offlineMeta = offlineMap[track.id];
      if (offlineMeta?.hasAudioBlob || track.sourceType === "local") {
        const entry = await getOfflineAudioEntry(track.id);
        if (entry?.hasAudioBlob && entry.audioData && htmlAudioRef.current) {
          if (nativeBlobUrlRef.current) {
            URL.revokeObjectURL(nativeBlobUrlRef.current);
          }
          const blob = new Blob([entry.audioData], {
            type: entry.mimeType || "audio/mpeg",
          });
          const blobUrl = URL.createObjectURL(blob);
          nativeBlobUrlRef.current = blobUrl;

          const audio = htmlAudioRef.current;
          setActiveEngine("native");
          activeEngineRef.current = "native";
          audio.src = blobUrl;
          audio.playbackRate = speedRef.current;
          audio.currentTime = 0;

          try {
            await audio.play();
            setIsBuffering(false);
            setIsPlaying(true);
            return;
          } catch {
            // If native blob fails for any codec reason and track has youtubeId, fall back seamlessly to YouTube engine!
            if (!track.youtubeId) {
              setIsBuffering(false);
              setIsPlaying(false);
              showToast("Tap play again to start audio playback.");
              return;
            }
          }
        }
      }

      // Play real YouTube audio via persistent YouTube IFrame engine (works BOTH before & after Download!)
      if (track.youtubeId) {
        setActiveEngine("youtube");
        activeEngineRef.current = "youtube";
        setIsPlaying(true);
        ensureYouTubePlayerInitialized(track.youtubeId);
      } else {
        setIsBuffering(false);
        setIsPlaying(false);
        showToast("Audio source unavailable for this track.");
      }
    },
    [offlineMap, stopBothEngines, ensureYouTubePlayerInitialized, showToast],
  );

  // Wire Track-Ended logic for Loop Mode (Off, Single, Repeat All)
  useEffect(() => {
    handlePlaybackFinishedRef.current = () => {
      const mode = loopModeRef.current;
      const list = tracksRef.current;
      const currId = activeTrackIdRef.current;
      const idx = list.findIndex((t) => t.id === currId);

      if (mode === "single") {
        if (activeEngineRef.current === "native" && htmlAudioRef.current) {
          htmlAudioRef.current.currentTime = 0;
          htmlAudioRef.current.play().catch(() => {});
        } else if (activeEngineRef.current === "youtube" && ytPlayerRef.current) {
          ytPlayerRef.current.seekTo(0, true);
          ytPlayerRef.current.playVideo();
        }
        setCurrentTime(0);
        setIsPlaying(true);
        return;
      }

      if (idx >= 0 && idx < list.length - 1) {
        playTrack(list[idx + 1]);
        return;
      }

      if (mode === "all" && list.length > 0) {
        playTrack(list[0]);
        return;
      }

      setIsPlaying(false);
      setCurrentTime(0);
    };
  }, [playTrack]);

  // Toggle Play / Pause on active track
  const togglePlayPause = useCallback(() => {
    if (!activeTrack) {
      if (tracks.length > 0) {
        playTrack(tracks[0]);
      }
      return;
    }

    if (activeEngineRef.current === "native" && htmlAudioRef.current) {
      if (isPlaying) {
        htmlAudioRef.current.pause();
        setIsPlaying(false);
      } else {
        htmlAudioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => playTrack(activeTrack));
      }
      return;
    }

    if (activeEngineRef.current === "youtube" && ytPlayerRef.current && ytReadyRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
      return;
    }

    // If neither engine has loaded yet, start the active track cleanly
    playTrack(activeTrack);
  }, [activeTrack, tracks, isPlaying, playTrack]);

  const handlePlayPrevious = useCallback(() => {
    if (tracks.length === 0) return;
    if (currentTime > 4) {
      // Restart current track if more than 4s in
      setCurrentTime(0);
      if (activeEngineRef.current === "native" && htmlAudioRef.current) {
        htmlAudioRef.current.currentTime = 0;
      } else if (activeEngineRef.current === "youtube" && ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(0, true);
      }
      return;
    }
    const idx = tracks.findIndex((t) => t.id === activeTrackId);
    const prevIdx = idx > 0 ? idx - 1 : tracks.length - 1;
    playTrack(tracks[prevIdx]);
  }, [tracks, activeTrackId, currentTime, playTrack]);

  const handlePlayNext = useCallback(() => {
    if (tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === activeTrackId);
    const nextIdx = idx >= 0 && idx < tracks.length - 1 ? idx + 1 : 0;
    playTrack(tracks[nextIdx]);
  }, [tracks, activeTrackId, playTrack]);

  const handleSeekRatio = (ratio: number) => {
    const safe = Math.max(0, Math.min(1, ratio));
    if (duration <= 0) return;
    const targetSec = safe * duration;
    setCurrentTime(targetSec);

    if (activeEngineRef.current === "native" && htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = targetSec;
    } else if (activeEngineRef.current === "youtube" && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(targetSec, true);
    }
  };

  const handleChangeSpeed = (spd: BismahPlaybackSpeed) => {
    setPlaybackSpeed(spd);
    speedRef.current = spd;
    if (htmlAudioRef.current) {
      htmlAudioRef.current.playbackRate = spd;
    }
    if (ytPlayerRef.current && ytReadyRef.current) {
      ytPlayerRef.current.setPlaybackRate?.(spd);
    }
  };

  const handleCycleLoopMode = () => {
    const order: BismahLoopMode[] = ["off", "single", "all"];
    const next = order[(order.indexOf(loopMode) + 1) % order.length];
    setLoopMode(next);
  };

  const handleSelectSleepTimer = (minutes: number) => {
    setSleepTimerMin(minutes);
    if (minutes <= 0) {
      setSleepRemainingSec(null);
    } else {
      setSleepRemainingSec(minutes * 60);
    }
  };

  // Sleep Timer Countdown
  useEffect(() => {
    if (sleepRemainingSec === null) return;
    if (sleepRemainingSec <= 0) {
      stopBothEngines();
      setIsPlaying(false);
      setSleepRemainingSec(null);
      setSleepTimerMin(0);
      showToast("Sleep Timer ended — playback paused");
      return;
    }

    const timer = window.setInterval(() => {
      setSleepRemainingSec((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sleepRemainingSec, stopBothEngines, showToast]);

  // =========================================================================
  // ADD TRACK / PLAYLIST, DOWNLOAD, LOCAL IMPORT & DELETE HANDLERS
  // =========================================================================

  const handlePasteClipboardIntoModal = async () => {
    if (!navigator.clipboard?.readText) {
      setUrlError("Clipboard paste unavailable. Paste manually with Ctrl+V.");
      return;
    }
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) {
        setUrlInput(text);
        setUrlError(null);
      } else {
        setUrlError("Clipboard is empty.");
      }
    } catch {
      setUrlError("Clipboard access denied. Paste the URL directly into the field.");
    }
  };

  const handleAddYouTubeSubmit = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError("Please enter a YouTube video or playlist link.");
      return;
    }
    const parsed = extractYouTubeIds(trimmed);
    if (!parsed.isValid) {
      setUrlError("Invalid YouTube URL. Paste a watch, youtu.be, shorts, or playlist link.");
      return;
    }

    setIsResolvingUrl(true);
    setUrlError(null);

    try {
      const result = await resolveYouTubeLinkTracks(trimmed);
      const nextTracks = [...result.tracks, ...tracks];
      persistTracks(nextTracks);

      setAddModalOpen(false);
      setUrlInput("");

      if (result.tracks.length === 1) {
        showToast(`Added "${result.tracks[0].title}"`);
      } else {
        showToast(`Added ${result.tracks.length} tracks from playlist`);
      }
    } catch (err) {
      setUrlError(
        err instanceof Error ? err.message : "Could not add this link. Please try again.",
      );
    } finally {
      setIsResolvingUrl(false);
    }
  };

  const handleImportLocalAudioFile = async (file: File) => {
    const trackId = `local-${Date.now()}`;
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
    try {
      const meta = await saveLocalAudioFileToVault(trackId, cleanTitle, "Local Audio Book", file);
      const newTrack: BismahAudioTrack = {
        id: trackId,
        sourceType: "local",
        title: cleanTitle,
        channelTitle: "Local Audio Book",
        durationSec: 0,
        thumbnail: "",
        sourceUrl: file.name,
        addedAt: Date.now(),
      };
      persistTracks([newTrack, ...tracks]);
      setOfflineMap((prev) => ({ ...prev, [trackId]: meta }));
      setAddModalOpen(false);
      setUrlInput("");
      showToast(`Added "${cleanTitle}" for offline playback`);
    } catch {
      setUrlError("Could not save this audio file to offline storage.");
    }
  };

  const handleDownloadTrack = async (track: BismahAudioTrack) => {
    if (downloadsMap[track.id]) return;

    setDownloadsMap((prev) => ({
      ...prev,
      [track.id]: { percent: 10, status: "Connecting to YouTube ..." },
    }));

    try {
      const meta = await downloadTrackForOffline(track, (percent, status) => {
        setDownloadsMap((prev) => ({
          ...prev,
          [track.id]: { percent, status },
        }));
      });

      setOfflineMap((prev) => ({ ...prev, [track.id]: meta }));
      showToast(`Downloaded "${track.title}"`);
    } catch {
      showToast("Download failed. Please try again.");
    } finally {
      setDownloadsMap((prev) => {
        const copy = { ...prev };
        delete copy[track.id];
        return copy;
      });
    }
  };

  const handleDeleteTrack = async (track: BismahAudioTrack) => {
    if (activeTrackId === track.id) {
      stopBothEngines();
      setIsPlaying(false);
      setActiveTrackId(null);
      setActiveEngine("none");
      setNowPlayingExpanded(false);
    }
    const next = tracks.filter((t) => t.id !== track.id);
    persistTracks(next);

    await removeOfflineAudioEntry(track.id);
    setOfflineMap((prev) => {
      const copy = { ...prev };
      delete copy[track.id];
      return copy;
    });
    showToast(`Removed "${track.title}"`);
  };

  // Storage metrics for Settings screen
  const totalStorageBytes = useMemo(
    () => Object.values(offlineMap).reduce((sum, entry) => sum + (entry.sizeBytes || 0), 0),
    [offlineMap],
  );

  const uniquePlaylistCount = useMemo(() => {
    const ids = new Set(tracks.map((t) => t.playlistId).filter(Boolean));
    return ids.size;
  }, [tracks]);

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const loopStatusLabel =
    loopMode === "off" ? "Loop Off" : loopMode === "single" ? "Loop Single" : "Repeat All";

  // Surface tokens — crisp Website Light theme by default, deep minimal Dark mode when toggled
  const canvasBg = isDark ? "bg-[#111312] text-[#F4F4F2]" : "bg-[#FFFFFF] text-[#18181B]";
  const cardBg = isDark ? "bg-[#191C1B] border-white/[0.08]" : "bg-[#F8F8F7] border-[#E4E4E2]";
  const elevatedBg = isDark ? "bg-[#1D201F] border-white/[0.1]" : "bg-[#FFFFFF] border-[#E4E4E2]";
  const mutedText = isDark ? "text-[#9A9E9C]" : "text-[#71717A]";
  const toggleTrackBg = isDark
    ? "bg-[#1C1F1E] border-white/[0.08]"
    : "bg-[#F3F3F1] border-[#E4E4E2]";

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-3xl border transition-colors duration-200 ${canvasBg} ${
        isDark ? "border-white/10" : "border-border"
      } ${fullHeight ? "min-h-[calc(100vh-8rem)]" : "min-h-[640px]"}`}
    >
      {/* Permanently Mounted Native HTML5 Audio Element (User-gesture safe for offline files/blobs) */}
      <audio
        ref={htmlAudioRef}
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) {
            setDuration(d);
            if (activeTrackIdRef.current) {
              updateTrackDuration(activeTrackIdRef.current, d);
            }
          }
        }}
        onTimeUpdate={(e) => {
          if (activeEngineRef.current === "native") {
            setCurrentTime(e.currentTarget.currentTime);
          }
        }}
        onPlay={() => {
          if (activeEngineRef.current === "native") {
            setIsPlaying(true);
            setIsBuffering(false);
          }
        }}
        onPause={() => {
          if (activeEngineRef.current === "native") {
            setIsPlaying(false);
          }
        }}
        onEnded={() => {
          if (activeEngineRef.current === "native") {
            handlePlaybackFinishedRef.current();
          }
        }}
        className="hidden"
      />

      {/* Persistent Active-Viewport YouTube Audio Bridge (sized properly so browsers never suspend audio) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[113px] w-[200px] overflow-hidden opacity-[0.001]"
      >
        <div id={`bismah-yt-engine-${uniqueId}`} ref={ytHostRef} />
      </div>

      {/* Hidden local file input for optional native MP3/M4A audiobook import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImportLocalAudioFile(file);
            e.target.value = "";
          }
        }}
      />

      {/* =================================================================== */}
      {/* VIEW A: MAIN LIBRARY SCREEN (Screenshots 1, 2, 4, 5, 7)             */}
      {/* =================================================================== */}
      {screen === "library" && (
        <div className="relative flex flex-1 flex-col">
          {/* Top App Header Bar */}
          <header
            className={`flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6 ${
              isDark ? "border-white/[0.07]" : "border-[#EFEFED]"
            }`}
          >
            {/* Brand Icon + Bismah Title + Track Counter */}
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs"
                style={{
                  backgroundColor: accentSoftBg,
                  color: accentColor,
                }}
              >
                <Disc3 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-display text-lg font-bold leading-tight tracking-tight">
                    Bismah
                  </h2>
                  {showStandaloneLink && (
                    <Link
                      to="/bismah"
                      title="Open Bismah Standalone Page"
                      className={`hidden items-center gap-0.5 text-[11px] font-medium transition-opacity hover:opacity-100 sm:inline-flex ${mutedText} opacity-75`}
                    >
                      <span>Standalone</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                <p className={`truncate text-xs ${mutedText}`}>
                  {tracks.length === 0
                    ? "Tap + to add audio"
                    : `${tracks.length} ${tracks.length === 1 ? "track" : "tracks"}`}
                </p>
              </div>
            </div>

            {/* Right Controls: [Grid|List] + [Sun|Moon] + Settings Gear */}
            <div className="flex shrink-0 items-center gap-2">
              {/* Grid / List View Segmented Pill */}
              <div
                className={`inline-flex items-center rounded-full border p-0.5 ${toggleTrackBg}`}
                role="group"
                aria-label="View style"
              >
                <button
                  type="button"
                  onClick={() => changeViewStyle("grid")}
                  aria-label="Grid view"
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    viewStyle === "grid"
                      ? isDark
                        ? "bg-white/15"
                        : "bg-white shadow-xs"
                      : `${mutedText} hover:opacity-100`
                  }`}
                  style={viewStyle === "grid" ? { color: accentColor } : undefined}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => changeViewStyle("list")}
                  aria-label="List view"
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    viewStyle === "list"
                      ? isDark
                        ? "bg-white/15"
                        : "bg-white shadow-xs"
                      : `${mutedText} hover:opacity-100`
                  }`}
                  style={viewStyle === "list" ? { color: accentColor } : undefined}
                >
                  <Rows2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Light / Dark Mode Quick Pill */}
              <div
                className={`inline-flex items-center rounded-full border p-0.5 ${toggleTrackBg}`}
                role="group"
                aria-label="Theme mode"
              >
                <button
                  type="button"
                  onClick={() => changeAppearance("light")}
                  aria-label="Light mode"
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    !isDark ? "bg-white text-amber-500 shadow-xs" : `${mutedText} hover:text-white`
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => changeAppearance("dark")}
                  aria-label="Dark mode"
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    isDark
                      ? "bg-white/15 text-sky-400 shadow-xs"
                      : `${mutedText} hover:text-slate-900`
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Settings Gear Button */}
              <button
                type="button"
                onClick={() => {
                  refreshOfflineStorage().catch(() => {});
                  setScreen("settings");
                }}
                aria-label="Open Settings"
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                }`}
              >
                <Settings className="h-[18px] w-[18px]" />
              </button>
            </div>
          </header>

          {/* Main Content Area: Empty State OR Grid/List Library */}
          <div className={`flex-1 px-4 py-6 sm:px-6 ${activeTrack ? "pb-36" : "pb-24"}`}>
            {tracks.length === 0 ? (
              /* EMPTY COLLECTION STATE (Screenshots 1 & 5) */
              <div className="flex min-h-[420px] flex-col items-center justify-center px-4 text-center">
                <div
                  className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: accentSoftBg,
                    color: accentColor,
                  }}
                >
                  <Home className="h-8 w-8 stroke-[1.75]" />
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  Your Collection is Empty
                </h3>
                <p className={`mt-2 max-w-xs text-sm leading-relaxed ${mutedText}`}>
                  Paste any YouTube video or playlist link to add audio to your offline library.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUrlError(null);
                    setAddModalOpen(true);
                  }}
                  className="mt-7 inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold shadow-sm transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: accentColor,
                    color: onAccentColor,
                  }}
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Add YouTube Audio</span>
                </button>
              </div>
            ) : viewStyle === "list" ? (
              /* LIST VIEW (Screenshot 2) */
              <div className="mx-auto max-w-3xl space-y-3">
                {tracks.map((track) => {
                  const isCurrent = activeTrackId === track.id;
                  const isTrackPlaying = isCurrent && isPlaying;
                  const downloadState = downloadsMap[track.id];
                  const isDownloaded = Boolean(offlineMap[track.id]);

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (isCurrent) {
                          togglePlayPause();
                        } else {
                          playTrack(track);
                        }
                      }}
                      className={`group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3 transition-all duration-150 ${
                        isTrackPlaying ? "border-transparent shadow-sm" : cardBg
                      }`}
                      style={
                        isTrackPlaying
                          ? { backgroundColor: accentColor, color: onAccentColor }
                          : undefined
                      }
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3.5">
                        {/* Square Rounded Thumbnail */}
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/10 sm:h-16 sm:w-16">
                          {track.thumbnail ? (
                            <img
                              src={track.thumbnail}
                              alt={track.title}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center"
                              style={{ backgroundColor: accentSoftBg, color: accentColor }}
                            >
                              <Disc3 className="h-6 w-6" />
                            </div>
                          )}
                          {downloadState && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-[11px] font-bold text-white">
                              {downloadState.percent}%
                            </div>
                          )}
                        </div>

                        {/* Title & Author */}
                        <div className="min-w-0 flex-1 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
                          <p className="truncate text-sm font-bold sm:text-base">{track.title}</p>
                          <p
                            className={`mt-0.5 truncate text-xs ${
                              isTrackPlaying ? "opacity-85" : mutedText
                            }`}
                          >
                            {downloadState
                              ? downloadState.status
                              : `${track.channelTitle}${track.durationSec > 0 ? ` · ${formatDurationClock(track.durationSec)}` : ""}`}
                          </p>
                        </div>
                      </div>

                      {/* Right Action Controls: Download / Playing / Play + Delete */}
                      <div
                        className="flex shrink-0 items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {downloadState ? (
                          <span
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 font-mono text-xs font-semibold tabular-nums"
                            style={{ backgroundColor: accentSoftBg, color: accentColor }}
                          >
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>{downloadState.percent}%</span>
                          </span>
                        ) : isTrackPlaying ? (
                          <button
                            type="button"
                            onClick={togglePlayPause}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-bold shadow-xs"
                            style={{ color: accentColor }}
                          >
                            <Pause className="h-3.5 w-3.5 fill-current" />
                            <span>Playing</span>
                          </button>
                        ) : isDownloaded ? (
                          <button
                            type="button"
                            onClick={() => playTrack(track)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition-opacity hover:opacity-90"
                            style={{ backgroundColor: accentSoftBg, color: accentColor }}
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Play</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDownloadTrack(track)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition-opacity hover:opacity-90"
                            style={{ backgroundColor: accentSoftBg, color: accentColor }}
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteTrack(track)}
                          aria-label={`Delete ${track.title}`}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-opacity hover:opacity-100 ${
                            isTrackPlaying ? "opacity-80" : `${mutedText} opacity-65`
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* GRID VIEW (Screenshots 4 & 7) */
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
                {tracks.map((track) => {
                  const isCurrent = activeTrackId === track.id;
                  const isTrackPlaying = isCurrent && isPlaying;
                  const downloadState = downloadsMap[track.id];
                  const isDownloaded = Boolean(offlineMap[track.id]);
                  const ringRadius = 18;
                  const ringCirc = 2 * Math.PI * ringRadius;
                  const ringOffset =
                    downloadState !== undefined
                      ? ringCirc - (downloadState.percent / 100) * ringCirc
                      : ringCirc;

                  return (
                    <article
                      key={track.id}
                      onClick={() => {
                        if (downloadState) return;
                        if (isCurrent) {
                          togglePlayPause();
                        } else {
                          playTrack(track);
                        }
                      }}
                      className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all duration-200 ${
                        isTrackPlaying ? "border-transparent shadow-md" : cardBg
                      }`}
                      style={
                        isTrackPlaying
                          ? { backgroundColor: accentColor, color: onAccentColor }
                          : undefined
                      }
                    >
                      {/* Thumbnail Area */}
                      <div className="relative aspect-[16/11] w-full overflow-hidden bg-black/15">
                        {track.thumbnail ? (
                          <img
                            src={track.thumbnail}
                            alt={track.title}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center"
                            style={{ backgroundColor: accentSoftBg, color: accentColor }}
                          >
                            <Disc3 className="h-10 w-10" />
                          </div>
                        )}

                        {/* PLAYING Badge top-left (Screenshot 7) */}
                        {isTrackPlaying && (
                          <span
                            className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold tracking-wider shadow-xs"
                            style={{ color: accentColor }}
                          >
                            PLAYING
                          </span>
                        )}

                        {/* Duration Badge bottom-right (Screenshots 4 & 7) */}
                        {track.durationSec > 0 && (
                          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-white backdrop-blur-xs">
                            {formatDurationClock(track.durationSec)}
                          </span>
                        )}

                        {/* Downloading Circular Ring Overlay (Screenshot 4) */}
                        {downloadState && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px]">
                            <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
                              <circle
                                cx="22"
                                cy="22"
                                r={ringRadius}
                                fill="none"
                                stroke="rgba(255,255,255,0.22)"
                                strokeWidth="3.5"
                              />
                              <circle
                                cx="22"
                                cy="22"
                                r={ringRadius}
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeDasharray={ringCirc}
                                strokeDashoffset={ringOffset}
                                className="transition-all duration-200"
                              />
                            </svg>
                            <span className="mt-1 font-mono text-xs font-bold tabular-nums text-white">
                              {downloadState.percent}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-1 flex-col justify-between p-3.5 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
                        <div>
                          <h4 className="line-clamp-2 text-sm font-bold leading-snug">
                            {track.title}
                          </h4>
                          <p
                            className={`mt-1 truncate text-xs ${
                              isTrackPlaying ? "opacity-85" : mutedText
                            }`}
                          >
                            {track.channelTitle}
                          </p>
                        </div>

                        {/* Card Footer Action Row */}
                        <div
                          className="mt-3.5 flex items-center justify-between gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {downloadState ? (
                            <span
                              className="truncate text-xs font-medium"
                              style={{ color: accentColor }}
                            >
                              {downloadState.status}
                            </span>
                          ) : isTrackPlaying ? (
                            <>
                              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">
                                Playing
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTrack(track)}
                                  aria-label={`Delete ${track.title}`}
                                  className="flex h-8 w-8 items-center justify-center rounded-full opacity-80 transition-opacity hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={togglePlayPause}
                                  aria-label="Pause"
                                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-xs"
                                  style={{ color: accentColor }}
                                >
                                  <Pause className="h-4 w-4 fill-current" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              {isDownloaded ? (
                                <button
                                  type="button"
                                  onClick={() => playTrack(track)}
                                  className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold"
                                  style={{ backgroundColor: accentSoftBg, color: accentColor }}
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Saved</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadTrack(track)}
                                  className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-opacity hover:opacity-90"
                                  style={{ backgroundColor: accentSoftBg, color: accentColor }}
                                >
                                  <Download className="h-3 w-3" />
                                  <span>Download</span>
                                </button>
                              )}

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTrack(track)}
                                  aria-label={`Delete ${track.title}`}
                                  className={`flex h-8 w-8 items-center justify-center rounded-full ${mutedText} opacity-65 transition-opacity hover:opacity-100`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => playTrack(track)}
                                  aria-label={`Play ${track.title}`}
                                  className="flex h-8 w-8 items-center justify-center rounded-full shadow-xs transition-transform hover:scale-105"
                                  style={{
                                    backgroundColor: accentColor,
                                    color: onAccentColor,
                                  }}
                                >
                                  <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Floating Toast Notification (Screenshot 2) */}
          {toastMsg && (
            <div
              className={`pointer-events-none absolute left-4 right-20 z-30 flex justify-center sm:left-6 sm:right-24 ${
                activeTrack ? "bottom-24" : "bottom-6"
              }`}
            >
              <div
                className={`inline-flex max-w-md items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-lg backdrop-blur-md ${elevatedBg}`}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
                <span className="truncate font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
                  {toastMsg}
                </span>
              </div>
            </div>
          )}

          {/* Floating '+' Add FAB (Screenshots 1, 2, 4, 5, 7) */}
          <button
            type="button"
            onClick={() => {
              setUrlError(null);
              setAddModalOpen(true);
            }}
            aria-label="Add YouTube Track or Playlist"
            className={`absolute right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 sm:right-6 ${
              activeTrack ? "bottom-24" : "bottom-5"
            }`}
            style={{
              backgroundColor: accentColor,
              color: onAccentColor,
            }}
          >
            <Plus className="h-6 w-6 stroke-[2.25]" />
          </button>

          {/* Bottom Floating Mini Player Bar (Screenshot 7) */}
          {activeTrack && (
            <div className="absolute inset-x-3 bottom-3 z-30 sm:inset-x-5 sm:bottom-4">
              <div
                onClick={() => setNowPlayingExpanded(true)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 shadow-xl backdrop-blur-xl transition-transform hover:scale-[1.005] ${elevatedBg}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-black/15">
                    {activeTrack.thumbnail ? (
                      <img
                        src={activeTrack.thumbnail}
                        alt={activeTrack.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ backgroundColor: accentSoftBg, color: accentColor }}
                      >
                        <Disc3 className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
                    <p className="truncate text-sm font-bold">{activeTrack.title}</p>
                    <p className={`truncate text-xs ${mutedText}`}>
                      {isBuffering ? "Loading audio..." : activeTrack.channelTitle}
                    </p>
                  </div>
                </div>

                <div
                  className="flex shrink-0 items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handleCycleLoopMode}
                    aria-label={`Loop mode: ${loopStatusLabel}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      loopMode !== "off" ? "" : mutedText
                    }`}
                    style={loopMode !== "off" ? { color: accentColor } : undefined}
                  >
                    {loopMode === "single" ? (
                      <Repeat1 className="h-4 w-4" />
                    ) : (
                      <Repeat className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-transform hover:scale-105"
                    style={{
                      backgroundColor: accentColor,
                      color: onAccentColor,
                    }}
                  >
                    {isBuffering ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="ml-0.5 h-4 w-4 fill-current" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW B: SETTINGS SCREEN (Screenshot 9)                              */}
      {/* =================================================================== */}
      {screen === "settings" && (
        <div className="flex flex-1 flex-col">
          {/* Settings Top Bar */}
          <header
            className={`flex items-center gap-3 border-b px-4 py-4 sm:px-6 ${
              isDark ? "border-white/[0.07]" : "border-[#EFEFED]"
            }`}
          >
            <button
              type="button"
              onClick={() => setScreen("library")}
              aria-label="Back to library"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                isDark ? "hover:bg-white/10" : "hover:bg-black/5"
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="font-display text-xl font-bold tracking-tight">Settings</h2>
          </header>

          <div className="mx-auto w-full max-w-2xl flex-1 space-y-7 px-4 py-6 sm:px-6">
            {/* Appearance: Light / Dark / System */}
            <section>
              <h3 className={`mb-2.5 text-xs font-semibold ${mutedText}`}>Appearance</h3>
              <div className={`grid grid-cols-3 gap-1.5 rounded-2xl border p-1.5 ${cardBg}`}>
                {(
                  [
                    { id: "light", label: "Light", Icon: Sun },
                    { id: "dark", label: "Dark", Icon: Moon },
                    { id: "system", label: "System", Icon: Monitor },
                  ] as const
                ).map(({ id, label, Icon }) => {
                  const active = appearance === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => changeAppearance(id)}
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all ${
                        active ? "shadow-xs" : `${mutedText} hover:opacity-100`
                      }`}
                      style={
                        active ? { backgroundColor: accentColor, color: onAccentColor } : undefined
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Color Theme: 2-Column Grid matching Screenshot 9 + Website Minimal */}
            <section>
              <h3 className={`mb-2.5 text-xs font-semibold ${mutedText}`}>Color Theme</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {BISMAH_THEME_ACCENTS.map((preset) => {
                  const selected = preset.id === accentId;
                  const swatchColor = isDark ? preset.darkPrimaryHex : preset.primaryHex;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => changeAccent(preset.id)}
                      className={`flex h-12 items-center justify-between gap-2 rounded-2xl border px-3.5 text-left transition-all ${cardBg}`}
                      style={
                        selected
                          ? {
                              borderColor: swatchColor,
                              backgroundColor: isDark ? preset.softTintDark : preset.softTintLight,
                            }
                          : undefined
                      }
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                          style={{ backgroundColor: swatchColor }}
                        />
                        <span className="truncate text-xs font-semibold">{preset.name}</span>
                      </span>
                      {selected && (
                        <Check className="h-4 w-4 shrink-0" style={{ color: swatchColor }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Library Preferences */}
            <section>
              <h3 className={`mb-2.5 text-xs font-semibold ${mutedText}`}>Library</h3>
              <div
                className={`divide-y rounded-2xl border ${cardBg} ${isDark ? "divide-white/[0.07]" : "divide-[#E4E4E2]"}`}
              >
                {/* View Style Row */}
                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <span className="text-sm font-semibold">View Style</span>
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => changeViewStyle("grid")}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition-colors ${
                        viewStyle === "grid" ? "shadow-xs" : mutedText
                      }`}
                      style={
                        viewStyle === "grid"
                          ? { backgroundColor: accentColor, color: onAccentColor }
                          : undefined
                      }
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span>Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => changeViewStyle("list")}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition-colors ${
                        viewStyle === "list" ? "shadow-xs" : mutedText
                      }`}
                      style={
                        viewStyle === "list"
                          ? { backgroundColor: accentColor, color: onAccentColor }
                          : undefined
                      }
                    >
                      <Rows2 className="h-3.5 w-3.5" />
                      <span>List</span>
                    </button>
                  </div>
                </div>

                {/* Clipboard Link Prompt Toggle */}
                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold">Clipboard Link Prompt</p>
                    <p className={`text-xs ${mutedText}`}>Detect copied YouTube links on open</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={clipboardPromptEnabled}
                    onClick={toggleClipboardPrompt}
                    className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: clipboardPromptEnabled
                        ? accentColor
                        : isDark
                          ? "rgba(255,255,255,0.16)"
                          : "#D4D4D8",
                    }}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition-transform ${
                        clipboardPromptEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Storage Section */}
            <section>
              <h3 className={`mb-2.5 text-xs font-semibold ${mutedText}`}>Storage</h3>
              <div
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-4 py-4 ${cardBg}`}
              >
                <div>
                  <p className="font-mono text-base font-bold tabular-nums">
                    {formatStorageMb(totalStorageBytes)} Used
                  </p>
                  <p className={`mt-0.5 text-xs ${mutedText}`}>
                    {tracks.length} {tracks.length === 1 ? "track" : "tracks"} ·{" "}
                    {uniquePlaylistCount} {uniquePlaylistCount === 1 ? "playlist" : "playlists"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {totalStorageBytes > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        await clearAllOfflineAudioEntries();
                        setOfflineMap({});
                        showToast("Cleared offline cache");
                      }}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors ${
                        isDark
                          ? "border-white/10 hover:bg-white/5"
                          : "border-border hover:bg-black/5"
                      }`}
                    >
                      Clear Cache
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      await refreshOfflineStorage();
                      showToast("Storage refreshed");
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: accentSoftBg, color: accentColor }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: "ADD TRACK OR PLAYLIST" DIALOG (Screenshot 3)              */}
      {/* =================================================================== */}
      {addModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add Track or Playlist"
          className="fixed inset-0 z-[105] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
          onClick={() => !isResolvingUrl && setAddModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${elevatedBg}`}
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: accentSoftBg, color: accentColor }}
              >
                <Repeat className="h-4 w-4" />
              </div>
              <h3 className="font-display text-lg font-bold tracking-tight">
                Add Track or Playlist
              </h3>
            </div>

            <p className={`mt-3 text-sm leading-relaxed ${mutedText}`}>
              Paste any YouTube video or playlist link to add it to your library.
            </p>

            {/* Outlined Floating-Label URL Input Box */}
            <div className="relative mt-5">
              <label
                htmlFor={`bismah-url-input-${uniqueId}`}
                className={`absolute -top-2.5 left-3.5 z-10 px-1.5 text-xs font-semibold ${
                  isDark ? "bg-[#1D201F]" : "bg-[#FFFFFF]"
                }`}
                style={{ color: accentColor }}
              >
                YouTube URL or Playlist link
              </label>

              <div
                className="flex items-center rounded-2xl border-2 px-3.5 py-2.5 transition-colors"
                style={{ borderColor: accentColor }}
              >
                <input
                  id={`bismah-url-input-${uniqueId}`}
                  type="url"
                  autoFocus
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddYouTubeSubmit();
                    }
                  }}
                  placeholder="https://youtu.be/... or playlist?list=..."
                  className="w-full bg-transparent text-sm outline-none placeholder:opacity-50"
                />
                <button
                  type="button"
                  onClick={handlePasteClipboardIntoModal}
                  aria-label="Paste from clipboard"
                  title="Paste from clipboard"
                  className={`ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                  }`}
                >
                  <Clipboard className="h-4 w-4 opacity-75" />
                </button>
              </div>
            </div>

            {urlError && <p className="mt-2.5 text-xs font-medium text-rose-500">{urlError}</p>}

            {/* Secondary Option: Import Local MP3/M4A File for 100% Native Offline Playback */}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4 transition-opacity hover:opacity-100 ${mutedText} opacity-80`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Or import local audio file</span>
              </button>
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isResolvingUrl}
                onClick={() => setAddModalOpen(false)}
                className={`h-10 rounded-xl px-4 text-sm font-semibold transition-colors ${mutedText} hover:opacity-100`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResolvingUrl || !urlInput.trim()}
                onClick={handleAddYouTubeSubmit}
                className="inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition-opacity disabled:opacity-45"
                style={{
                  backgroundColor: accentColor,
                  color: onAccentColor,
                }}
              >
                {isResolvingUrl && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isResolvingUrl ? "Fetching..." : "Add to Library"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: EXPANDED NOW PLAYING SHEET (Screenshot 6)                  */}
      {/* =================================================================== */}
      {nowPlayingExpanded && activeTrack && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Now Playing"
          className={`fixed inset-0 z-[110] flex flex-col justify-between overflow-y-auto px-5 py-6 sm:px-8 ${canvasBg}`}
        >
          {/* Top Collapse Bar */}
          <div className="mx-auto flex w-full max-w-md items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setAudioControlsOpen(false);
                setNowPlayingExpanded(false);
              }}
              aria-label="Minimize player"
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                isDark ? "hover:bg-white/10" : "hover:bg-black/5"
              }`}
            >
              <ChevronDown className="h-6 w-6" />
            </button>
            <div className={`h-1 w-10 rounded-full ${isDark ? "bg-white/15" : "bg-black/15"}`} />
            <div className="h-10 w-10" />
          </div>

          {/* Center Artwork, Title, Progress Scrubber & Transport Controls */}
          <div className="mx-auto my-auto w-full max-w-md py-6">
            {/* Large Square Rounded Artwork */}
            <div className="mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl bg-black shadow-2xl">
              {activeTrack.thumbnail ? (
                <img
                  src={activeTrack.thumbnail}
                  alt={activeTrack.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ backgroundColor: accentSoftBg, color: accentColor }}
                >
                  <Disc3 className="h-20 w-20" />
                </div>
              )}
            </div>

            {/* Title & Channel */}
            <div className="mt-8 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
              <h3 className="line-clamp-2 text-2xl font-bold leading-snug tracking-tight">
                {activeTrack.title}
              </h3>
              <p className={`mt-1.5 truncate text-sm ${mutedText}`}>{activeTrack.channelTitle}</p>
            </div>

            {/* Interactive Progress Scrubber */}
            <div className="mt-7">
              <div
                role="slider"
                tabIndex={0}
                aria-label="Seek audio position"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(currentTime)}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  handleSeekRatio((e.clientX - rect.left) / rect.width);
                }}
                className={`relative h-1.5 w-full cursor-pointer rounded-full ${
                  isDark ? "bg-white/15" : "bg-black/10"
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${progressPct}%`,
                    backgroundColor: accentColor,
                  }}
                />
                <div
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm"
                  style={{
                    left: `${progressPct}%`,
                    backgroundColor: accentColor,
                  }}
                />
              </div>
              <div
                className={`mt-2.5 flex items-center justify-between font-mono text-xs tabular-nums ${mutedText}`}
              >
                <span>{formatDurationClock(currentTime)}</span>
                <span>{formatDurationClock(duration)}</span>
              </div>
            </div>

            {/* 5-Button Transport Controls Row (Exact match to Screenshot 6) */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCycleLoopMode}
                aria-label={`Loop mode: ${loopStatusLabel}`}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  loopMode !== "off" ? "" : mutedText
                }`}
                style={loopMode !== "off" ? { color: accentColor } : undefined}
              >
                {loopMode === "single" ? (
                  <Repeat1 className="h-5 w-5" />
                ) : (
                  <Repeat className="h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                onClick={handlePlayPrevious}
                aria-label="Previous track"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-75"
              >
                <SkipBack className="h-6 w-6 fill-current" />
              </button>

              <button
                type="button"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-[68px] w-[68px] items-center justify-center rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: accentColor,
                  color: onAccentColor,
                }}
              >
                {isBuffering ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-7 w-7 fill-current" />
                ) : (
                  <Play className="ml-1 h-7 w-7 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={handlePlayNext}
                aria-label="Next track"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-75"
              >
                <SkipForward className="h-6 w-6 fill-current" />
              </button>

              <button
                type="button"
                onClick={() => setAudioControlsOpen(true)}
                aria-label="Open Audio Controls"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-75"
                style={
                  playbackSpeed !== 1.0 || sleepRemainingSec !== null
                    ? { color: accentColor }
                    : undefined
                }
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bottom Quality Pill (Screenshot 6) */}
          <div className="mx-auto flex w-full max-w-md justify-center pb-2">
            <button
              type="button"
              onClick={() => setAudioControlsOpen(true)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${cardBg}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: accentColor }} />
              <span>
                {activeEngine === "native" ? "Offline Audio" : "High Quality Audio"} · Bismah Player
                {sleepRemainingSec !== null
                  ? ` · Sleep ${formatDurationClock(sleepRemainingSec)}`
                  : ""}
              </span>
            </button>
          </div>

          {/* =============================================================== */}
          {/* AUDIO CONTROLS BOTTOM SHEET (Screenshot 8)                      */}
          {/* =============================================================== */}
          {audioControlsOpen && (
            <div
              className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4"
              onClick={() => setAudioControlsOpen(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md rounded-t-3xl border p-5 shadow-2xl sm:rounded-3xl ${elevatedBg}`}
              >
                {/* Sheet Handle */}
                <div className="mb-4 flex justify-center">
                  <div
                    className={`h-1 w-10 rounded-full ${isDark ? "bg-white/20" : "bg-black/15"}`}
                  />
                </div>

                {/* Sheet Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: accentSoftBg, color: accentColor }}
                    >
                      <AudioLines className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-bold">Audio Controls</h4>
                      <p className={`text-xs ${mutedText}`}>
                        {playbackSpeed}x Speed · {loopStatusLabel}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAudioControlsOpen(false)}
                    aria-label="Close audio controls"
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Section 1: Playback Speed (0.75x - 2.0x) */}
                <div className={`mt-5 rounded-2xl border p-4 ${cardBg}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Gauge className="h-4 w-4" style={{ color: accentColor }} />
                      <span>Playback Speed</span>
                    </span>
                    <span
                      className="rounded-lg px-2 py-0.5 font-mono text-xs font-bold tabular-nums"
                      style={{ backgroundColor: accentSoftBg, color: accentColor }}
                    >
                      {playbackSpeed}x
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {BISMAH_PLAYBACK_SPEEDS.map((spd) => {
                      const selected = playbackSpeed === spd;
                      return (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => handleChangeSpeed(spd)}
                          className={`h-10 rounded-xl border font-mono text-xs font-semibold tabular-nums transition-all ${
                            selected
                              ? "border-transparent shadow-xs"
                              : isDark
                                ? "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08]"
                                : "border-[#E4E4E2] bg-white hover:bg-black/[0.03]"
                          }`}
                          style={
                            selected
                              ? { backgroundColor: accentColor, color: onAccentColor }
                              : undefined
                          }
                        >
                          {spd}x
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Loop Mode (Off, Single, Repeat All) */}
                <div className={`mt-3.5 rounded-2xl border p-4 ${cardBg}`}>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
                    <Repeat className="h-4 w-4" style={{ color: accentColor }} />
                    <span>Loop Mode</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "off", label: "Off", Icon: Repeat },
                        { id: "single", label: "Single", Icon: Repeat1 },
                        { id: "all", label: "Repeat All", Icon: Repeat },
                      ] as const
                    ).map(({ id, label, Icon }) => {
                      const selected = loopMode === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setLoopMode(id)}
                          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-semibold transition-all ${
                            selected
                              ? "border-transparent shadow-xs"
                              : isDark
                                ? "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08]"
                                : "border-[#E4E4E2] bg-white hover:bg-black/[0.03]"
                          }`}
                          style={
                            selected
                              ? { backgroundColor: accentColor, color: onAccentColor }
                              : undefined
                          }
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Sleep Timer (Off, 15m, 30m, 60m) */}
                <div className={`mt-3.5 rounded-2xl border p-4 ${cardBg}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Moon className="h-4 w-4 text-amber-500" />
                      <span>Sleep Timer</span>
                    </span>
                    <span
                      className={`rounded-lg px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ${mutedText}`}
                    >
                      {sleepRemainingSec !== null ? formatDurationClock(sleepRemainingSec) : "Off"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {BISMAH_SLEEP_PRESETS.map((preset) => {
                      const selected = sleepTimerMin === preset.minutes;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleSelectSleepTimer(preset.minutes)}
                          className={`h-10 rounded-xl border font-mono text-xs font-semibold tabular-nums transition-all ${
                            selected
                              ? "border-transparent bg-[#EAB365] text-[#18181B] shadow-xs"
                              : isDark
                                ? "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08]"
                                : "border-[#E4E4E2] bg-white hover:bg-black/[0.03]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
