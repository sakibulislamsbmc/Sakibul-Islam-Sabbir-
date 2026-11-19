import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  Moon,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sun,
  Trash2,
  WifiOff,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import type { BookItem } from "../../data/books-data";
import {
  fetchSecureBookBytes,
  formatBytesMb,
  getOfflineBookRecord,
  removeOfflineBook,
  saveBookOffline,
  type OfflineBookMeta,
} from "../../lib/offline-book-storage";

interface InSitePdfReaderModalProps {
  book: BookItem | null;
  hasFullAccess: boolean;
  offlineMeta: OfflineBookMeta | null;
  onOfflineStatusChange: (bookId: string, meta: OfflineBookMeta | null) => void;
  onRequestShare: (book: BookItem) => void;
  onClose: () => void;
}

type ReaderTheme = "day" | "sepia" | "night";

type PdfJsDoc = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getViewport: (opts: { scale: number }) => { width: number; height: number };
    render: (opts: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
      canvas?: HTMLCanvasElement;
    }) => { promise: Promise<void>; cancel: () => void };
  }>;
  cleanup?: (keepLoadedFonts?: boolean) => Promise<void>;
  destroy?: () => Promise<void>;
};

type PdfJsLoadingTask = {
  promise: Promise<unknown>;
  destroy?: () => Promise<void>;
};

function safeReleasePdf(doc: PdfJsDoc | null, task: PdfJsLoadingTask | null): void {
  try {
    if (doc && typeof doc.destroy === "function") {
      void Promise.resolve(doc.destroy()).catch(() => {});
    } else if (doc && typeof doc.cleanup === "function") {
      void Promise.resolve(doc.cleanup()).catch(() => {});
    }
  } catch {
    // Ignore document cleanup error
  }
  try {
    if (task && typeof task.destroy === "function") {
      void Promise.resolve(task.destroy()).catch(() => {});
    }
  } catch {
    // Ignore loadingTask destroy error
  }
}

export function InSitePdfReaderModal({
  book,
  hasFullAccess,
  offlineMeta,
  onOfflineStatusChange,
  onRequestShare,
  onClose,
}: InSitePdfReaderModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<PdfJsDoc | null>(null);
  const loadingTaskRef = useRef<PdfJsLoadingTask | null>(null);
  const rawBytesRef = useRef<Uint8Array | null>(null);
  const activeRenderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedFromOffline, setLoadedFromOffline] = useState(false);

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoomPct, setZoomPct] = useState(100);
  const [theme, setTheme] = useState<ReaderTheme>("day");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderingPage, setRenderingPage] = useState(false);

  const [savingOffline, setSavingOffline] = useState(false);
  const [offlineFeedback, setOfflineFeedback] = useState<string | null>(null);
  const [stageWidth, setStageWidth] = useState(820);

  const exitBrowserFullscreen = useCallback(() => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleClose = useCallback(() => {
    exitBrowserFullscreen();
    onClose();
  }, [exitBrowserFullscreen, onClose]);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      const target = containerRef.current ?? document.documentElement;
      if (typeof target.requestFullscreen === "function") {
        target.requestFullscreen().catch(() => {});
      }
    }
  }, []);

  // Track browser fullscreen state
  useEffect(() => {
    if (!book) return;
    const syncFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    syncFs();
    document.addEventListener("fullscreenchange", syncFs);
    return () => document.removeEventListener("fullscreenchange", syncFs);
  }, [book]);

  // Measure available stage width for responsive base canvas fit
  useEffect(() => {
    if (!book) return;
    const updateWidth = () => {
      const w = stageRef.current?.clientWidth ?? window.innerWidth;
      setStageWidth(Math.max(300, Math.min(w - 32, 920)));
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [book, isFullscreen]);

  // Lock body scroll & block print/save/view-source keyboard shortcuts while reading
  useEffect(() => {
    if (!book) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === "p" || key === "s" || key === "u")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.key === "Escape" && !document.fullscreenElement) {
        handleClose();
      } else if (e.key === "ArrowRight") {
        setPageNumber((p) => (numPages > 0 ? Math.min(p + 1, numPages) : p));
      } else if (e.key === "ArrowLeft") {
        setPageNumber((p) => Math.max(1, p - 1));
      } else if (e.key === "+" || e.key === "=") {
        setZoomPct((z) => Math.min(240, z + 15));
      } else if (e.key === "-") {
        setZoomPct((z) => Math.max(60, z - 15));
      } else if (e.key === "0") {
        setZoomPct(100);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [book, handleClose, numPages]);

  // Load PDF bytes (Offline IndexedDB Vault first, else same-origin protected stream)
  useEffect(() => {
    if (!book || !hasFullAccess) return;
    let cancelled = false;

    async function loadPdf() {
      if (!book) return;
      setLoading(true);
      setLoadProgress(10);
      setLoadError(null);
      setNumPages(0);
      setPageNumber(1);
      setZoomPct(100);
      setLoadedFromOffline(false);
      rawBytesRef.current = null;

      safeReleasePdf(pdfDocRef.current, loadingTaskRef.current);
      pdfDocRef.current = null;
      loadingTaskRef.current = null;

      try {
        let bytes: Uint8Array | null = null;

        // 1. Check Offline Vault first for instant & zero-internet reading
        const offlineRecord = await getOfflineBookRecord(book.id);
        if (offlineRecord && offlineRecord.data.byteLength > 100) {
          bytes = new Uint8Array(offlineRecord.data.slice(0));
          if (!cancelled) {
            setLoadedFromOffline(true);
            setLoadProgress(85);
          }
        } else {
          // 2. Fetch securely from same-origin protected stream
          bytes = await fetchSecureBookBytes(book.secureStreamUrl, (pct) => {
            if (!cancelled) setLoadProgress(Math.max(15, Math.round(pct * 0.85)));
          });
        }

        if (cancelled) return;
        rawBytesRef.current = new Uint8Array(bytes);

        // Dynamic client-only import of pdfjs-dist (SSR safe)
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.mjs";

        // Pass a fresh copy to pdf.js because worker may transfer the buffer
        const dataCopy = new Uint8Array(bytes.byteLength);
        dataCopy.set(bytes);

        const loadingTask = pdfjs.getDocument({
          data: dataCopy,
          isEvalSupported: false,
          useSystemFonts: true,
        }) as unknown as PdfJsLoadingTask;
        loadingTaskRef.current = loadingTask;

        const doc = (await loadingTask.promise) as unknown as PdfJsDoc;
        if (cancelled) {
          safeReleasePdf(doc, loadingTask);
          if (loadingTaskRef.current === loadingTask) {
            loadingTaskRef.current = null;
          }
          return;
        }

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setLoadProgress(100);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        const offlineHint =
          typeof navigator !== "undefined" && !navigator.onLine
            ? "আপনার ইন্টারনেট সংযোগ বিচ্ছিন্ন রয়েছে এবং এই বইটি এখনো অফলাইনে সেভ করা হয়নি। অনলাইনে এসে 'অফলাইন সেভ' করে রাখলে পরবর্তীতে ইন্টারনেট ছাড়াই পড়তে পারবেন।"
            : err instanceof Error
              ? err.message
              : "বইটি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
        setLoadError(offlineHint);
        setLoading(false);
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel();
        } catch {
          // Ignore cancel error
        }
        activeRenderTaskRef.current = null;
      }
      safeReleasePdf(pdfDocRef.current, loadingTaskRef.current);
      pdfDocRef.current = null;
      loadingTaskRef.current = null;
    };
  }, [book, hasFullAccess]);

  // Render active page to HiDPI protected <canvas>
  useEffect(() => {
    const doc = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!book || loading || !doc || !canvas || numPages === 0) return;

    let cancelled = false;

    async function renderCurrentPage() {
      if (!doc || !canvas) return;
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel();
        } catch {
          // Ignore cancel error
        }
        activeRenderTaskRef.current = null;
      }

      setRenderingPage(true);
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const fitScale = stageWidth / baseViewport.width;
        const displayScale = Math.max(0.35, fitScale * (zoomPct / 100));
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

        const renderViewport = page.getViewport({ scale: displayScale * dpr });
        const cssViewport = page.getViewport({ scale: displayScale });

        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = `${Math.floor(cssViewport.width)}px`;
        canvas.style.height = `${Math.floor(cssViewport.height)}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport: renderViewport,
          canvas,
        });
        activeRenderTaskRef.current = renderTask;
        await renderTask.promise;
        if (!cancelled) {
          setRenderingPage(false);
        }
      } catch (err) {
        if (!cancelled && !(err instanceof Error && err.name === "RenderingCancelledException")) {
          console.error("PDF page render error:", err);
          setRenderingPage(false);
        }
      }
    }

    void renderCurrentPage();
    return () => {
      cancelled = true;
    };
  }, [book, loading, numPages, pageNumber, zoomPct, stageWidth]);

  async function handleToggleOfflineSave() {
    if (!book || savingOffline) return;
    setSavingOffline(true);
    setOfflineFeedback(null);
    try {
      if (offlineMeta) {
        await removeOfflineBook(book.id);
        onOfflineStatusChange(book.id, null);
        setLoadedFromOffline(false);
        setOfflineFeedback("অফলাইন কপি রিমুভ করা হয়েছে।");
      } else {
        let bytes = rawBytesRef.current;
        if (!bytes) {
          bytes = await fetchSecureBookBytes(book.secureStreamUrl);
          rawBytesRef.current = bytes;
        }
        const meta = await saveBookOffline(book.id, book.title, bytes);
        onOfflineStatusChange(book.id, meta);
        setLoadedFromOffline(true);
        setOfflineFeedback(
          `অফলাইনে সেভ হয়েছে (${formatBytesMb(meta.sizeBytes)}) — এখন ইন্টারনেট ছাড়াই পড়তে পারবেন!`,
        );
      }
    } catch (err) {
      setOfflineFeedback(
        err instanceof Error ? err.message : "অফলাইনে সেভ করা যায়নি। আবার চেষ্টা করুন।",
      );
    } finally {
      setSavingOffline(false);
      window.setTimeout(() => setOfflineFeedback(null), 4000);
    }
  }

  if (!book) return null;

  const canvasFilterStyle =
    theme === "night"
      ? "invert(0.92) hue-rotate(180deg) contrast(0.95)"
      : theme === "sepia"
        ? "sepia(0.32) contrast(0.96) brightness(0.97)"
        : "none";

  const stageBgClass =
    theme === "night" ? "bg-[#0d0f12]" : theme === "sepia" ? "bg-[#e7dec9]" : "bg-neutral-900";

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className="fixed inset-0 z-[95] flex flex-col bg-neutral-950 text-white select-none print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Secure Fullscreen Reader — ${book.title}`}
    >
      {/* Top Protected Reader Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-neutral-950 px-3 py-2.5 sm:px-5">
        {/* Left: Book Title & Protected Status */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="max-w-[180px] truncate font-['Hind_Siliguri'] text-sm font-bold text-white sm:max-w-[320px] sm:text-base">
                {book.title}
              </h2>
              <span className="hidden items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-300 sm:inline-flex">
                <ShieldCheck className="h-3 w-3" />
                In-Site Protected
              </span>
              {loadedFromOffline && (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                  <WifiOff className="h-3 w-3" />
                  Offline Ready
                </span>
              )}
            </div>
            <p className="truncate font-['Hind_Siliguri'] text-[11px] text-neutral-400">
              {book.authorBn} • শুধুমাত্র ওয়েবসাইটের ভেতর পড়ার জন্য সুরক্ষিত
            </p>
          </div>
        </div>

        {/* Right: Zoom, Theme, Offline Save, Share, Fullscreen, Close */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Zoom Out / Reset / Zoom In Controls */}
          <div className="flex items-center gap-0.5 rounded-xl border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setZoomPct((z) => Math.max(60, z - 15))}
              disabled={zoomPct <= 60}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-200 transition-colors hover:bg-white/15 disabled:opacity-35"
              title="Zoom Out (-)"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomPct(100)}
              className="min-w-[52px] rounded-lg px-1.5 py-1 text-center font-mono text-xs font-semibold tabular-nums text-white transition-colors hover:bg-white/15"
              title="Reset Zoom to 100%"
            >
              {zoomPct}%
            </button>
            <button
              type="button"
              onClick={() => setZoomPct((z) => Math.min(240, z + 15))}
              disabled={zoomPct >= 240}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-200 transition-colors hover:bg-white/15 disabled:opacity-35"
              title="Zoom In (+)"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {zoomPct !== 100 && (
              <button
                type="button"
                onClick={() => setZoomPct(100)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-white/15 hover:text-white"
                title="Fit Width (100%)"
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Eye Comfort Theme Switch */}
          <div className="hidden items-center gap-0.5 rounded-xl border border-white/15 bg-white/5 p-1 md:flex">
            <button
              type="button"
              onClick={() => setTheme("day")}
              className={`rounded-lg p-1.5 transition-colors ${
                theme === "day" ? "bg-white text-neutral-950" : "text-neutral-300 hover:text-white"
              }`}
              title="Day Mode"
              aria-label="Day mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("sepia")}
              className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
                theme === "sepia"
                  ? "bg-[#f3e8d2] text-neutral-900"
                  : "text-neutral-300 hover:text-white"
              }`}
              title="Sepia Eye-Comfort"
            >
              Sepia
            </button>
            <button
              type="button"
              onClick={() => setTheme("night")}
              className={`rounded-lg p-1.5 transition-colors ${
                theme === "night"
                  ? "bg-white text-neutral-950"
                  : "text-neutral-300 hover:text-white"
              }`}
              title="Night Mode"
              aria-label="Night mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Save for Offline Reading (In-App Vault Only) */}
          <button
            type="button"
            disabled={savingOffline || loading}
            onClick={handleToggleOfflineSave}
            className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${
              offlineMeta
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                : "border-white/15 bg-white/10 text-white hover:bg-white/20"
            }`}
            title={
              offlineMeta
                ? "অফলাইনে সেভ আছে — রিমুভ করতে ক্লিক করুন"
                : "ইন্টারনেট ছাড়াই পড়ার জন্য অফলাইনে সেভ করুন"
            }
          >
            {savingOffline ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : offlineMeta ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span className="hidden font-['Hind_Siliguri'] sm:inline">
              {offlineMeta ? "অফলাইন সেভড" : "অফলাইন সেভ"}
            </span>
            {offlineMeta && <Trash2 className="ml-0.5 hidden h-3 w-3 opacity-65 lg:inline" />}
          </button>

          {/* Share Book */}
          <button
            type="button"
            onClick={() => onRequestShare(book)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-neutral-100 transition-colors hover:bg-white/15"
            title="Share book on social media"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-neutral-100 transition-colors hover:bg-white/15"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Close Reader */}
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-rose-500/80"
            title="Close Reader"
            aria-label="Close reader"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transient Offline Save Notification Bar */}
      {offlineFeedback && (
        <div className="border-b border-emerald-500/30 bg-emerald-950/90 px-4 py-2 text-center font-['Hind_Siliguri'] text-xs font-medium text-emerald-200">
          {offlineFeedback}
        </div>
      )}

      {/* Main Protected Canvas Reading Viewport */}
      <div ref={stageRef} className={`relative flex-1 overflow-auto p-4 sm:p-6 ${stageBgClass}`}>
        {loading ? (
          <div className="flex h-full min-h-[55vh] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            </div>
            <div>
              <p className="font-['Hind_Siliguri'] text-base font-semibold text-white">
                সুরক্ষিত ফুল-স্ক্রিন রিডারে বইটি লোড হচ্ছে…
              </p>
              <p className="mt-1 font-mono text-xs tabular-nums text-neutral-400">
                {loadProgress}% loaded
              </p>
            </div>
            <div className="h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        ) : loadError ? (
          <div className="flex h-full min-h-[55vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300">
              <WifiOff className="h-7 w-7" />
            </div>
            <p className="max-w-md font-['Hind_Siliguri'] text-sm leading-relaxed text-neutral-200">
              {loadError}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 items-center rounded-xl bg-white px-5 text-xs font-semibold text-neutral-950"
            >
              বন্ধ করুন
            </button>
          </div>
        ) : (
          <div className="flex min-h-full items-start justify-center">
            <div className="relative inline-block overflow-hidden rounded-lg shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <canvas
                ref={canvasRef}
                onContextMenu={(e) => e.preventDefault()}
                className="block max-w-none bg-white transition-[filter] duration-200"
                style={{ filter: canvasFilterStyle }}
              />
              {/* Subtle protective transparent shield preventing image save / drag */}
              <div
                aria-hidden="true"
                onContextMenu={(e) => e.preventDefault()}
                className="pointer-events-none absolute inset-0"
              />
              {renderingPage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                  <Loader2 className="h-7 w-7 animate-spin text-neutral-900" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Page Navigation Bar */}
      {!loading && !loadError && numPages > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-neutral-950 px-3 py-2.5 sm:px-6">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35 sm:px-4"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>আগের পাতা</span>
          </button>

          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="reader-page-select">
              Jump to page
            </label>
            <select
              id="reader-page-select"
              value={pageNumber}
              onChange={(e) => setPageNumber(Number(e.target.value))}
              className="h-9 rounded-xl border border-white/15 bg-neutral-900 px-3 font-mono text-xs font-semibold tabular-nums text-white outline-none focus:border-white/40"
            >
              {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Page {p} / {numPages}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35 sm:px-4"
          >
            <span>পরের পাতা</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
