import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  Volume2,
  VolumeX,
} from "lucide-react";

interface YTPlayerInstance {
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
}

interface ScreenOrientationWithLock {
  lock?: (orientation: "landscape" | "portrait" | "any") => Promise<void>;
  unlock?: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options: {
          host?: string;
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayerInstance }) => void;
            onStateChange?: (e: { data: number; target: YTPlayerInstance }) => void;
          };
        },
      ) => YTPlayerInstance;
      PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      resolve();
    };

    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
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

export function CourseVideoPlayer({
  youtubeId,
  title,
  thumbnail,
  isCompleted,
  onVideoCompleted,
}: {
  youtubeId: string;
  title: string;
  thumbnail: string;
  isCompleted: boolean;
  onVideoCompleted: () => void;
}) {
  const uniqueId = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const maxWatchedRef = useRef<number>(0);
  const completedRef = useRef<boolean>(isCompleted);
  const hideControlsTimerRef = useRef<number | null>(null);

  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatched, setMaxWatched] = useState(0);
  const [skipWarning, setSkipWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotationActive, setIsRotationActive] = useState(false);
  const [useCssRotation, setUseCssRotation] = useState(false);
  const [fsControlsVisible, setFsControlsVisible] = useState(true);

  useEffect(() => {
    completedRef.current = isCompleted;
  }, [isCompleted]);

  const resetRotationState = useCallback(() => {
    setIsRotationActive(false);
    setUseCssRotation(false);
    try {
      const orientation = screen.orientation as unknown as ScreenOrientationWithLock | undefined;
      orientation?.unlock?.();
    } catch {
      // Ignore orientation unlock restriction
    }
  }, []);

  // Listen to native fullscreen exit & Escape key in fallback fullscreen
  useEffect(() => {
    const onFsChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active) {
        resetRotationState();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen && !document.fullscreenElement) {
        setIsFullscreen(false);
        resetRotationState();
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen, resetRotationState]);

  // Auto-hide fullscreen icon-only controls after 2.5s when video is playing
  const bumpFullscreenControls = useCallback(() => {
    setFsControlsVisible(true);
    if (hideControlsTimerRef.current !== null) {
      window.clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = null;
    }
    if (isFullscreen && isPlaying) {
      hideControlsTimerRef.current = window.setTimeout(() => {
        setFsControlsVisible(false);
      }, 2500);
    }
  }, [isFullscreen, isPlaying]);

  useEffect(() => {
    if (!isFullscreen) {
      setFsControlsVisible(true);
      if (hideControlsTimerRef.current !== null) {
        window.clearTimeout(hideControlsTimerRef.current);
        hideControlsTimerRef.current = null;
      }
      return;
    }

    if (!isPlaying) {
      setFsControlsVisible(true);
      if (hideControlsTimerRef.current !== null) {
        window.clearTimeout(hideControlsTimerRef.current);
        hideControlsTimerRef.current = null;
      }
      return;
    }

    bumpFullscreenControls();
    return () => {
      if (hideControlsTimerRef.current !== null) {
        window.clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [isFullscreen, isPlaying, bumpFullscreenControls]);

  // Initialize Privacy-Enhanced YouTube IFrame API player once user starts watching
  useEffect(() => {
    if (!started) return;

    let cancelled = false;
    let pollTimer: number | null = null;

    loadYouTubeIframeAPI().then(() => {
      if (cancelled || !playerHostRef.current || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player(playerHostRef.current, {
        host: "https://www.youtube-nocookie.com",
        videoId: youtubeId,
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
            if (cancelled) return;
            const dur = event.target.getDuration();
            if (dur > 0) setDuration(dur);
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event) => {
            if (cancelled) return;
            const YTState = window.YT?.PlayerState;
            const PLAYING = YTState?.PLAYING ?? 1;
            const PAUSED = YTState?.PAUSED ?? 2;
            const ENDED = YTState?.ENDED ?? 0;

            if (event.data === PLAYING) {
              setIsPlaying(true);
              const dur = event.target.getDuration();
              if (dur > 0) setDuration(dur);
            } else if (event.data === PAUSED) {
              setIsPlaying(false);
            } else if (event.data === ENDED) {
              setIsPlaying(false);
              const dur = event.target.getDuration();
              // Verify user actually watched sequentially without jumping to the end
              if (completedRef.current || (dur > 0 && maxWatchedRef.current >= dur * 0.92)) {
                completedRef.current = true;
                onVideoCompleted();
              } else {
                event.target.seekTo(maxWatchedRef.current, true);
              }
            }
          },
        },
      });

      // Strict anti-seek poll every 400ms
      pollTimer = window.setInterval(() => {
        const p = playerRef.current;
        if (!p || typeof p.getCurrentTime !== "function") return;
        const curr = p.getCurrentTime();
        const dur = p.getDuration();
        if (dur > 0) setDuration(dur);

        // Allow seeking backward anytime, allow forward seek only inside already-watched region
        if (!completedRef.current && curr > maxWatchedRef.current + 2.5) {
          p.seekTo(maxWatchedRef.current, true);
          setSkipWarning(true);
          window.setTimeout(() => setSkipWarning(false), 3200);
          return;
        }

        setCurrentTime(curr);
        if (curr > maxWatchedRef.current && curr <= maxWatchedRef.current + 2.5) {
          maxWatchedRef.current = curr;
          setMaxWatched(curr);
        }

        // Complete once watched >= 97% cleanly without skipping
        if (!completedRef.current && dur > 5 && maxWatchedRef.current >= dur * 0.97) {
          completedRef.current = true;
          onVideoCompleted();
        }
      }, 400);
    });

    return () => {
      cancelled = true;
      if (pollTimer !== null) window.clearInterval(pollTimer);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore destroy errors
        }
        playerRef.current = null;
      }
    };
  }, [started, youtubeId, onVideoCompleted]);

  const togglePlayPause = () => {
    const p = playerRef.current;
    if (!p) {
      setStarted(true);
      return;
    }
    if (isPlaying) {
      p.pauseVideo();
      setIsPlaying(false);
    } else {
      p.playVideo();
      setIsPlaying(true);
    }
    if (isFullscreen) {
      bumpFullscreenControls();
    }
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setIsMuted(false);
    } else {
      p.mute();
      setIsMuted(true);
    }
  };

  const handleRestart = () => {
    const p = playerRef.current;
    if (!p) {
      setStarted(true);
      return;
    }
    p.seekTo(0, true);
    p.playVideo();
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = playerRef.current;
    if (!p || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSec = clickRatio * duration;

    if (!completedRef.current && targetSec > maxWatchedRef.current) {
      setSkipWarning(true);
      window.setTimeout(() => setSkipWarning(false), 3000);
      return;
    }
    p.seekTo(targetSec, true);
    setCurrentTime(targetSec);
  };

  const enterFullscreen = async (rotateAfter = false) => {
    if (!started) setStarted(true);
    const el = wrapperRef.current;
    if (!el) return;

    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen(true);
      }
    } else {
      setIsFullscreen(true);
    }

    if (rotateAfter) {
      await activateLandscapeRotation();
    }
  };

  const exitFullscreen = async () => {
    resetRotationState();
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore exit error
      }
    }
    setIsFullscreen(false);
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen(false);
    }
  };

  const activateLandscapeRotation = async () => {
    let lockedNatively = false;
    try {
      const orientation = screen.orientation as unknown as ScreenOrientationWithLock | undefined;
      if (orientation?.lock) {
        await orientation.lock("landscape");
        lockedNatively = true;
      }
    } catch {
      lockedNatively = false;
    }

    setIsRotationActive(true);
    // Use clean CSS 90deg viewport rotation when native orientation lock isn't applied or viewport remains portrait
    if (!lockedNatively || window.innerHeight > window.innerWidth) {
      setUseCssRotation(true);
    } else {
      setUseCssRotation(false);
    }
  };

  const toggleRotationMode = async () => {
    if (!isFullscreen) {
      await enterFullscreen(true);
      return;
    }

    if (isRotationActive) {
      resetRotationState();
    } else {
      await activateLandscapeRotation();
    }
    bumpFullscreenControls();
  };

  const watchedPct =
    duration > 0
      ? Math.min(100, Math.round((Math.max(maxWatched, currentTime) / duration) * 100))
      : 0;
  const currentPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      ref={wrapperRef}
      onMouseMove={() => {
        if (isFullscreen) bumpFullscreenControls();
      }}
      onTouchStart={() => {
        if (isFullscreen) bumpFullscreenControls();
      }}
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
          : "relative w-full overflow-hidden rounded-2xl border border-border bg-black shadow-md"
      }
    >
      {/* Pure Video Canvas — Full Edge-to-Edge Clarity & CSS 90deg Rotation Support in Fullscreen */}
      <div
        className={`relative overflow-hidden bg-black ${
          isFullscreen
            ? useCssRotation
              ? "aspect-video w-[100dvh] max-h-[100dvw] shrink-0 rotate-90"
              : "aspect-video h-full max-h-screen w-full max-w-[100vw]"
            : "aspect-video w-full"
        }`}
      >
        {started ? (
          <>
            {/* Uncropped 100% frame in fullscreen so all whiteboard Arabic visuals remain sharp and visible */}
            <div
              id={`yt-host-${uniqueId}`}
              ref={playerHostRef}
              className="pointer-events-none h-full w-full"
            />

            {/* Transparent click guard blocking third-party YouTube overlays/ads redirects */}
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "ভিডিও থামান" : "ভিডিও চালু করুন"}
              className="absolute inset-0 z-10 cursor-pointer bg-transparent focus:outline-none"
            />

            {/* Fullscreen ONLY: minimal center Play icon when paused (ZERO text) */}
            {isFullscreen && !isPlaying && (
              <button
                type="button"
                onClick={togglePlayPause}
                aria-label="ভিডিও চালু করুন"
                className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/55 text-white backdrop-blur-md transition-transform hover:scale-110"
              >
                <Play className="ml-0.5 h-7 w-7 fill-current" />
              </button>
            )}
          </>
        ) : (
          <>
            <img
              src={thumbnail}
              alt={title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />
            <button
              type="button"
              onClick={() => setStarted(true)}
              aria-label={`${title} শুরু করুন`}
              className="group absolute inset-0 flex cursor-pointer items-center justify-center focus:outline-none"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white text-black shadow-2xl transition-transform duration-200 group-hover:scale-110 sm:h-20 sm:w-20">
                <Play className="ml-1 h-7 w-7 fill-current" />
              </span>
            </button>
          </>
        )}

        {/* Normal Mode ONLY: Anti-Skip Notice & Completion Indicator (ZERO text shown in fullscreen) */}
        {!isFullscreen && skipWarning && (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/85 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span>ভিডিও টেনে দেখা যাবে না — সম্পূর্ণ ক্লাস ধারাবাহিকভাবে দেখুন</span>
            </div>
          </div>
        )}

        {!isFullscreen && isCompleted && (
          <div className="pointer-events-none absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-[11px] font-semibold text-emerald-400 backdrop-blur-md">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>ভিডিও দেখা সম্পন্ন</span>
          </div>
        )}
      </div>

      {/* FULLSCREEN ONLY: Auto-hiding icon-only floating controls (Rotation + Exit Fullscreen — ZERO TEXT) */}
      {isFullscreen && (
        <div
          className={`fixed right-4 top-4 z-[110] flex items-center gap-2.5 transition-opacity duration-300 ${
            fsControlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={toggleRotationMode}
            aria-label="স্ক্রিন রোটেট মোড পরিবর্তন"
            title="স্ক্রিন রোটেট মোড"
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
              isRotationActive
                ? "border-white bg-white text-black"
                : "border-white/30 bg-black/55 text-white hover:bg-black/80"
            }`}
          >
            <RotateCw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={exitFullscreen}
            aria-label="ফুল স্ক্রিন বন্ধ করুন"
            title="স্বাভাবিক মোড"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* NORMAL MODE ONLY: Website Control Bar Under Player (Completely hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="flex flex-col gap-2.5 border-t border-white/10 bg-neutral-950 px-3.5 py-3 text-white">
          {/* Non-Skippable Scrubber Track */}
          <div
            onClick={handleProgressBarClick}
            title={
              isCompleted
                ? "যেকোনো স্থানে যান"
                : "দেখা অংশের ভেতর ফিরে যেতে ক্লিক করুন (সামনে টানা যাবে না)"
            }
            className="relative h-2 w-full cursor-pointer overflow-hidden rounded-full bg-white/15"
          >
            <div
              className="absolute inset-y-0 left-0 bg-white/30"
              style={{ width: `${isCompleted ? 100 : watchedPct}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-white transition-all duration-150"
              style={{ width: `${currentPct}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayPause}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-semibold text-neutral-950 transition-opacity hover:opacity-90"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    <span>বিরতি</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{started ? "চালু করুন" : "ক্লাস দেখুন"}</span>
                  </>
                )}
              </button>

              {started && (
                <>
                  <button
                    type="button"
                    onClick={handleRestart}
                    aria-label="শুরু থেকে দেখুন"
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? "সাউন্ড চালু করুন" : "মিউট করুন"}
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="h-3.5 w-3.5" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </>
              )}

              <span className="ml-1 font-mono text-[11px] tabular-nums text-white/75">
                {formatClock(currentTime)} / {duration > 0 ? formatClock(duration) : "--:--"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                title="YouTube No-Cookie প্রাইভেসি অ্যাড-ব্লকিং প্লেয়ার সক্রিয়"
                className="hidden items-center gap-1 text-[11px] text-emerald-400/90 md:inline-flex"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>অ্যাড-মুক্ত</span>
              </span>

              <span className="hidden text-[11px] text-white/65 sm:inline">
                {isCompleted ? "সম্পূর্ণ দেখা হয়েছে" : `অগ্রগতি: ${watchedPct}%`}
              </span>

              <button
                type="button"
                onClick={toggleRotationMode}
                aria-label="রোটেট ফুল স্ক্রিন মোড"
                title="স্ক্রিন রোটেট মোড"
                className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">রোটেট</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-black"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>ফুল স্ক্রিন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
