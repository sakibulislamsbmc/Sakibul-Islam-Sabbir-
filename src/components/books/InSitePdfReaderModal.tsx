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
  Move,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
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
  isPreviewMode?: boolean;
  offlineMeta: OfflineBookMeta | null;
  onOfflineStatusChange: (bookId: string, meta: OfflineBookMeta | null) => void;
  onRequestShare: (book: BookItem) => void;
  onRequestOrder?: (book: BookItem) => void;
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
  isPreviewMode = false,
  offlineMeta,
  onOfflineStatusChange,
  onRequestShare,
  onRequestOrder,
  onClose,
}: InSitePdfReaderModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<PdfJsDoc | null>(null);
  const loadingTaskRef = useRef<PdfJsLoadingTask | null>(null);
  const rawBytesRef = useRef<Uint8Array | null>(null);
  const activeRenderTaskRef = useRef<{ cancel: () => void } | null>(null);

  // Desktop mouse drag-to-pan state (mobile uses smooth native 2D touch scrolling)
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  }>({ active: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

  const [isDraggingPan, setIsDraggingPan] = useState(false);
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

  const effectivePreview = Boolean(isPreviewMode && !hasFullAccess && book?.previewStreamUrl);

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

  const goToPage = useCallback(
    (nextPage: number) => {
      if (numPages <= 0) return;
      const clamped = Math.max(1, Math.min(numPages, nextPage));
      setPageNumber(clamped);
      if (stageRef.current) {
        stageRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    },
    [numPages],
  );

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
      setStageWidth(Math.max(300, Math.min(w - 40, 860)));
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
        setZoomPct((z) => Math.min(260, z + 15));
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

  // Load PDF bytes (Offline IndexedDB Vault first for full access, else same-origin protected stream)
  useEffect(() => {
    if (!book || (!hasFullAccess && !effectivePreview)) return;
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
        const targetStreamUrl =
          effectivePreview && book.previewStreamUrl ? book.previewStreamUrl : book.secureStreamUrl;

        // 1. Check Offline Vault first for full-access instant & zero-internet reading
        if (!effectivePreview) {
          const offlineRecord = await getOfflineBookRecord(book.id);
          if (offlineRecord && offlineRecord.data.byteLength > 100) {
            bytes = new Uint8Array(offlineRecord.data.slice(0));
            if (!cancelled) {
              setLoadedFromOffline(true);
              setLoadProgress(85);
            }
          }
        }

        if (!bytes) {
          // 2. Fetch securely from same-origin protected stream
          bytes = await fetchSecureBookBytes(targetStreamUrl, (pct) => {
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
  }, [book, hasFullAccess, effectivePreview]);

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

  // Smooth desktop mouse click-and-drag panning in all 4 directions (left, right, up, down)
  function handleStagePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = stageRef.current;
    if (!el) return;
    const canScrollX = el.scrollWidth > el.clientWidth + 4;
    const canScrollY = el.scrollHeight > el.clientHeight + 4;
    if (!canScrollX && !canScrollY) return;

    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    setIsDraggingPan(true);
  }

  function handleStagePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStateRef.current.active) return;
    const el = stageRef.current;
    if (!el) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    el.scrollLeft = dragStateRef.current.scrollLeft - dx;
    el.scrollTop = dragStateRef.current.scrollTop - dy;
  }

  function handleStagePointerEnd() {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    setIsDraggingPan(false);
  }

  async function handleToggleOfflineSave() {
    if (!book || savingOffline || effectivePreview) return;
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
    theme === "night"
      ? "bg-[radial-gradient(ellipse_at_top,_#141824_0%,_#07090d_70%,_#040507_100%)]"
      : theme === "sepia"
        ? "bg-[radial-gradient(ellipse_at_top,_#efe6d2_0%,_#dfd0b2_75%,_#d2bf9b_100%)]"
        : "bg-[radial-gradient(ellipse_at_top,_#1c202a_0%,_#0e1017_65%,_#08090d_100%)]";

  const progressPct = numPages > 0 ? Math.round((pageNumber / numPages) * 100) : 0;

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className="fixed inset-0 z-[95] flex flex-col bg-[#08090d] text-white select-none print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Secure Fullscreen Reader — ${book.title}`}
    >
      {/* Top Frosted Glassmorphic Luxury Reader Header */}
      <div className="relative z-30 border-b border-white/12 bg-neutral-950/65 px-3 py-2.5 shadow-[0_12px_38px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Book Title & Protected Sanctuary Badge */}
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-xl">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="max-w-[165px] truncate font-['Hind_Siliguri'] text-sm font-bold tracking-tight text-white sm:max-w-[320px] sm:text-[15px]">
                  {book.title}
                </h2>
                {effectivePreview ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/30 bg-amber-400/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-200 backdrop-blur-md">
                    <Sparkles className="h-3 w-3" />
                    Preview
                  </span>
                ) : (
                  <span className="hidden items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-md sm:inline-flex">
                    <ShieldCheck className="h-3 w-3" />
                    Protected Sanctuary
                  </span>
                )}
                {loadedFromOffline && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-sky-200 backdrop-blur-md">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </span>
                )}
              </div>
              <p className="truncate font-['Hind_Siliguri'] text-[11px] text-neutral-300/80">
                {book.authorBn} •{" "}
                {zoomPct > 100
                  ? "জুম মোড সক্রিয় — ডানে-বামে ও উপরে-নিচে স্ক্রল করে পড়ুন"
                  : "প্রিমিয়াম ইন-সাইট রিডিং মোড"}
              </p>
            </div>
          </div>

          {/* Right: Glass Zoom, Theme, Offline Save, Share, Fullscreen, Close */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Zoom Out / Reset / Zoom In Controls */}
            <div className="flex items-center gap-0.5 rounded-xl border border-white/15 bg-white/[0.08] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setZoomPct((z) => Math.max(60, z - 15))}
                disabled={zoomPct <= 60}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-100 transition-all hover:bg-white/15 active:scale-95 disabled:opacity-35"
                title="Zoom Out (-)"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomPct(100)}
                className="min-w-[48px] rounded-lg px-1.5 py-1 text-center font-mono text-xs font-semibold tabular-nums text-white transition-colors hover:bg-white/15"
                title="Reset Zoom to 100%"
              >
                {zoomPct}%
              </button>
              <button
                type="button"
                onClick={() => setZoomPct((z) => Math.min(260, z + 15))}
                disabled={zoomPct >= 260}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-100 transition-all hover:bg-white/15 active:scale-95 disabled:opacity-35"
                title="Zoom In (+)"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              {zoomPct !== 100 && (
                <button
                  type="button"
                  onClick={() => setZoomPct(100)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-200 transition-colors hover:bg-white/15 hover:text-white"
                  title="Fit Width (100%)"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Eye Comfort Theme Switch (Accessible on both mobile & desktop) */}
            <div className="flex items-center gap-0.5 rounded-xl border border-white/15 bg-white/[0.08] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setTheme("day")}
                className={`rounded-lg p-1.5 transition-all ${
                  theme === "day"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-300 hover:text-white"
                }`}
                title="Day Mode"
                aria-label="Day mode"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("sepia")}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                  theme === "sepia"
                    ? "bg-[#f3e8d2] text-neutral-900 shadow-sm"
                    : "text-neutral-300 hover:text-white"
                }`}
                title="Sepia Eye-Comfort"
              >
                Sepia
              </button>
              <button
                type="button"
                onClick={() => setTheme("night")}
                className={`rounded-lg p-1.5 transition-all ${
                  theme === "night"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-300 hover:text-white"
                }`}
                title="Night Mode"
                aria-label="Night mode"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Save for Offline Reading (Full Access Only) or Order Full Edition (Preview Only) */}
            {effectivePreview && onRequestOrder ? (
              <button
                type="button"
                onClick={() => {
                  const target = book;
                  handleClose();
                  onRequestOrder(target);
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-amber-300/40 bg-amber-400/20 px-3 text-xs font-semibold text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-xl transition-all hover:bg-amber-400/30"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="font-['Hind_Siliguri']">অর্ডার ৳{book.priceBdt}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={savingOffline || loading}
                onClick={handleToggleOfflineSave}
                className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition-all disabled:opacity-50 ${
                  offlineMeta
                    ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                    : "border-white/15 bg-white/[0.1] text-white hover:bg-white/20"
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
                {offlineMeta && <Trash2 className="ml-0.5 hidden h-3 w-3 opacity-70 lg:inline" />}
              </button>
            )}

            {/* Share Book */}
            <button
              type="button"
              onClick={() => onRequestShare(book)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.08] px-3 text-xs font-semibold text-neutral-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-xl transition-all hover:bg-white/18"
              title="Share book on social media"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] text-neutral-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-xl transition-all hover:bg-white/18"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Close Reader */}
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all hover:border-rose-400/50 hover:bg-rose-500/80"
              title="Close Reader"
              aria-label="Close reader"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Reading Completion Hairline */}
        {!loading && !loadError && numPages > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-300/90 via-white to-emerald-300/90 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Transient Offline Save Notification Bar */}
      {offlineFeedback && (
        <div className="relative z-20 border-b border-emerald-400/25 bg-emerald-950/80 px-4 py-2 text-center font-['Hind_Siliguri'] text-xs font-medium text-emerald-200 backdrop-blur-xl">
          {offlineFeedback}
        </div>
      )}

      {/* Main Protected Reading Stage Wrapper */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Scrollable 2D Viewport (Up, Down, Left AND Right — zero flex left-clipping!) */}
        <div
          ref={stageRef}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={handleStagePointerEnd}
          onPointerCancel={handleStagePointerEnd}
          onPointerLeave={handleStagePointerEnd}
          className={`relative h-full w-full flex-1 overflow-auto overscroll-contain touch-pan-x touch-pan-y ${stageBgClass} ${
            zoomPct > 100 ? (isDraggingPan ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {loading ? (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                <Loader2 className="h-7 w-7 animate-spin text-white" />
              </div>
              <div>
                <p className="font-['Hind_Siliguri'] text-base font-semibold text-white">
                  প্রিমিয়াম ফুল-স্ক্রিন রিডারে বইটি প্রস্তুত হচ্ছে…
                </p>
                <p className="mt-1 font-mono text-xs tabular-nums text-neutral-400">
                  {loadProgress}% loaded
                </p>
              </div>
              <div className="h-1.5 w-60 overflow-hidden rounded-full bg-white/12">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-200 via-white to-emerald-200 transition-all duration-300"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </div>
          ) : loadError ? (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/20 text-rose-200 backdrop-blur-xl">
                <WifiOff className="h-7 w-7" />
              </div>
              <p className="max-w-md font-['Hind_Siliguri'] text-sm leading-relaxed text-neutral-200">
                {loadError}
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-10 items-center rounded-xl border border-white/20 bg-white px-5 text-xs font-semibold text-neutral-950 transition-opacity hover:opacity-90"
              >
                বন্ধ করুন
              </button>
            </div>
          ) : (
            /* Block container with min-w-full + w-fit guarantees full 4-way scroll without clipping left edge */
            <div className="min-h-full min-w-full w-fit px-4 pt-5 pb-32 sm:px-10 sm:pt-8 sm:pb-36">
              {/* Subtle Zoom Pan Indicator */}
              {zoomPct > 100 && (
                <div className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1 font-['Hind_Siliguri'] text-[11px] font-medium text-neutral-200 shadow-lg backdrop-blur-xl">
                  <Move className="h-3 w-3 text-amber-300" />
                  <span>উপরে-নিচে ও ডানে-বামে সহজেই স্ক্রল বা ড্র্যাগ করে পড়ুন</span>
                </div>
              )}

              {/* Elevated Fine-Paper Book Canvas Frame */}
              <div className="relative mx-auto w-fit overflow-hidden rounded-xl shadow-[0_32px_90px_rgba(0,0,0,0.68),0_0_0_1px_rgba(255,255,255,0.14)]">
                <canvas
                  ref={canvasRef}
                  onContextMenu={(e) => e.preventDefault()}
                  className="block max-w-none bg-white transition-[filter] duration-200"
                  style={{ filter: canvasFilterStyle }}
                />
                {/* Protective non-interactive overlay preventing image save / drag */}
                <div
                  aria-hidden="true"
                  onContextMenu={(e) => e.preventDefault()}
                  className="pointer-events-none absolute inset-0"
                />
                {renderingPage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-neutral-950/65 shadow-xl backdrop-blur-xl">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Preview End Upgrade Card (when previewing a paid book on its last page) */}
              {effectivePreview && numPages > 0 && pageNumber === numPages && onRequestOrder && (
                <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/20 bg-neutral-900/75 p-5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                    END OF FREE PREVIEW
                  </p>
                  <h3 className="mt-1.5 font-['Hind_Siliguri'] text-lg font-bold text-white">
                    সম্পূর্ণ বইটি আনলক করে পড়ুন
                  </h3>
                  <p className="mt-1 font-['Hind_Siliguri'] text-xs leading-relaxed text-neutral-300">
                    মাত্র ৳{book.priceBdt} টাকায় একবার অর্ডার করে অ্যাডমিন ভেরিফিকেশনের পর লাইফটাইম
                    সম্পূর্ণ বই ও অফলাইন রিডিং সুবিধা আনলক করুন।
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const target = book;
                      handleClose();
                      onRequestOrder(target);
                    }}
                    className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-300/40 bg-white px-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-neutral-950 shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Order Full Book — ৳{book.priceBdt}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Desktop Left/Right Glassmorphic Page-Turn Orbs */}
        {!loading && !loadError && numPages > 1 && (
          <>
            <button
              type="button"
              disabled={pageNumber <= 1}
              onClick={() => goToPage(pageNumber - 1)}
              aria-label="Previous page"
              title="আগের পাতা (←)"
              className="group absolute top-1/2 left-5 z-20 hidden h-13 w-13 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/25 bg-neutral-900/45 text-white shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-2xl transition-all duration-200 hover:scale-105 hover:border-white/40 hover:bg-white/20 active:scale-95 disabled:pointer-events-none disabled:opacity-20 lg:flex"
            >
              <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
            </button>

            <button
              type="button"
              disabled={pageNumber >= numPages}
              onClick={() => goToPage(pageNumber + 1)}
              aria-label="Next page"
              title="পরের পাতা (→)"
              className="group absolute top-1/2 right-5 z-20 hidden h-13 w-13 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/25 bg-neutral-900/45 text-white shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-2xl transition-all duration-200 hover:scale-105 hover:border-white/40 hover:bg-white/20 active:scale-95 disabled:pointer-events-none disabled:opacity-20 lg:flex"
            >
              <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        )}

        {/* Floating Glassmorphic Bottom Page Navigation Capsule */}
        {!loading && !loadError && numPages > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-3 sm:bottom-6">
            <div className="pointer-events-auto flex w-full max-w-[540px] items-center justify-between gap-2 rounded-2xl border border-white/22 bg-neutral-950/55 p-2 shadow-[0_20px_56px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.26)] ring-1 ring-inset ring-white/10 backdrop-blur-2xl sm:gap-3 sm:px-3 sm:py-2.5">
              {/* Frosted Glass Previous Page Button */}
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => goToPage(pageNumber - 1)}
                className="group inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-gradient-to-b from-white/[0.2] to-white/[0.08] px-3.5 font-['Hind_Siliguri'] text-xs font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl transition-all duration-200 hover:border-white/45 hover:from-white/[0.28] hover:to-white/[0.14] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:text-sm"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span>আগের পাতা</span>
              </button>

              {/* Frosted Center Page Picker + Progress Indicator */}
              <div className="flex flex-col items-center gap-0.5">
                <label className="sr-only" htmlFor="reader-page-select">
                  Jump to page
                </label>
                <select
                  id="reader-page-select"
                  value={pageNumber}
                  onChange={(e) => goToPage(Number(e.target.value))}
                  className="h-9 cursor-pointer rounded-xl border border-white/20 bg-white/[0.1] px-2.5 text-center font-mono text-xs font-semibold tabular-nums text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] outline-none backdrop-blur-xl transition-colors hover:bg-white/[0.18] focus:border-white/45 sm:px-3.5"
                >
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p} className="bg-neutral-950 text-white">
                      Page {p} / {numPages}
                    </option>
                  ))}
                </select>
                <span className="font-mono text-[9px] font-medium tracking-[0.14em] text-neutral-300/80">
                  {progressPct}% READ
                </span>
              </div>

              {/* Frosted Glass Next Page Button */}
              <button
                type="button"
                disabled={pageNumber >= numPages}
                onClick={() => goToPage(pageNumber + 1)}
                className="group inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-gradient-to-b from-white/[0.22] to-white/[0.1] px-3.5 font-['Hind_Siliguri'] text-xs font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl transition-all duration-200 hover:border-white/45 hover:from-white/[0.3] hover:to-white/[0.16] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:text-sm"
              >
                <span>পরের পাতা</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
