import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Expand,
  ExternalLink,
  Film,
  Globe,
  Layout,
  Maximize2,
  Menu,
  Minimize2,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  X,
} from "lucide-react";
import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import {
  ANDROID_PROJECTS,
  DESIGN_CONCEPTS,
  LONG_FORM_VIDEOS,
  PORTFOLIO_PLACEHOLDER_IMAGES,
  SHORT_FORM_VIDEOS,
  WEBSITE_PROJECTS,
  type ProjectShowcaseItem,
  type VideoItem,
} from "@/data/portfolio-data";

type PortfolioTab = "all" | "design" | "video" | "website" | "android";

function parsePortfolioTab(val: unknown): PortfolioTab | undefined {
  if (
    val === "all" ||
    val === "design" ||
    val === "video" ||
    val === "website" ||
    val === "android"
  ) {
    return val;
  }
  return undefined;
}

export const Route = createFileRoute("/portfolio")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: parsePortfolioTab(search.tab),
  }),
  head: () => ({
    meta: [
      { title: "Portfolio — Design, Video, Web & Android | Sakibul Islam" },
      {
        name: "description",
        content:
          "Selected client design concepts, long-form and short-form video productions, custom websites, and native Android apps by Sakibul Islam.",
      },
      { property: "og:title", content: "Portfolio — Sakibul Islam" },
      {
        property: "og:description",
        content:
          "Explore 36 design concepts, 8 video productions, 6 website builds, and 4 Android applications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

const NAV = [
  { label: "Home", href: "/" },
  { label: "Education", href: "/education" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Me", href: "/about-me" },
  { label: "Thankful", href: "/thankful" },
  { label: "Contact", href: "/contact" },
];

const ALL_WORKS_SECTION_CAP = 8;

function NativeYouTubeCard({
  video,
  isPlaying,
  onTogglePlay,
  onOpenFullscreen,
}: {
  video: VideoItem;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenFullscreen: () => void;
}) {
  const isShort = video.format === "short";
  const embedSrc = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${video.youtubeId}`;

  return (
    <article className="group flex flex-col rounded-3xl border border-border/80 bg-background/35 p-3.5 shadow-xl shadow-black/[0.04] ring-1 ring-inset ring-foreground/[0.05] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 hover:border-foreground/25 hover:bg-background/50 hover:shadow-2xl">
      {/* Transparent Glass Video Frame */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-border/60 bg-background/25 p-1.5 backdrop-blur-xl ${
          isShort ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
          {isPlaying ? (
            <>
              <iframe
                src={embedSrc}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                className="pointer-events-none h-[116%] w-[116%] -translate-x-[8%] -translate-y-[8%] border-0 object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/20 p-3 opacity-0 transition-opacity duration-200 hover:opacity-100">
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onOpenFullscreen}
                    aria-label="Watch in full-screen mode"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 text-[11px] font-semibold text-white backdrop-blur-md transition-transform hover:scale-105"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Full Screen
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={onTogglePlay}
                    aria-label="Pause video"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/65 text-white backdrop-blur-md transition-transform hover:scale-105"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenFullscreen}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/90 px-3.5 text-[11px] font-semibold text-black shadow-md transition-transform hover:scale-105"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    {isShort ? "Phone Fullscreen" : "Cinema Fullscreen"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <img
                src={video.thumbnail}
                alt={video.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={`Play ${video.title}`}
                className="absolute inset-0 flex items-center justify-center focus-visible:outline-none"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                </span>
              </button>

              <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium tabular-nums text-white/90">
                  {video.duration}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFullscreen();
                  }}
                  aria-label={`Open ${video.title} in full-screen`}
                  className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 text-[11px] font-semibold text-white backdrop-blur-md transition-all duration-150 hover:scale-105 hover:bg-white hover:text-black"
                >
                  <Maximize2 className="h-3 w-3" />
                  Full Screen
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transparent Glass Details Container Below Video */}
      <div className="mt-3 flex flex-1 flex-col justify-between rounded-2xl border border-border/60 bg-background/45 p-4 backdrop-blur-xl transition-colors duration-200 group-hover:border-border/90 group-hover:bg-background/65">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">
              {video.code} · {isShort ? "Short-Form (9:16)" : "Long-Form (16:9)"}
            </span>
            <button
              type="button"
              onClick={onOpenFullscreen}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/80 transition-colors hover:text-foreground"
            >
              <Expand className="h-3 w-3" />
              Expand
            </button>
          </div>
          <h4 className="mt-1 font-display text-base font-bold tracking-tight text-foreground">
            {video.title}
          </h4>
        </div>
        <p className="mt-2 border-t border-border/50 pt-2.5 text-xs font-light text-muted-foreground">
          {video.subtitle}
        </p>
      </div>
    </article>
  );
}

function PortfolioPage() {
  const { tab: initialTab } = Route.useSearch();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PortfolioTab>(initialTab ?? "all");
  const [selectedDesignIndex, setSelectedDesignIndex] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectShowcaseItem | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<VideoItem | null>(null);
  const [fullscreenPaused, setFullscreenPaused] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const archiveTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const switchCategory = (nextTab: PortfolioTab, scrollToTop = false) => {
    setActiveTab(nextTab);
    if (scrollToTop && archiveTopRef.current) {
      archiveTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openVideoFullscreen = (video: VideoItem) => {
    setPlayingVideoId(null);
    setFullscreenPaused(false);
    setFullscreenVideo(video);
    setTimeout(() => {
      const el = fullscreenContainerRef.current;
      if (el && el.requestFullscreen) {
        el.requestFullscreen().catch(() => {
          // Fallback to fixed viewport full-screen overlay
        });
      }
    }, 50);
  };

  const closeVideoFullscreen = () => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setFullscreenVideo(null);
    setFullscreenPaused(false);
  };

  const totalVideos = LONG_FORM_VIDEOS.length + SHORT_FORM_VIDEOS.length;
  const totalWorks =
    DESIGN_CONCEPTS.length + totalVideos + WEBSITE_PROJECTS.length + ANDROID_PROJECTS.length;

  // In "All Works": show 8 Design Concepts (4 top row + 4 bottom row); in "Design" tab show all 36 serially
  const visibleDesigns =
    activeTab === "all" ? DESIGN_CONCEPTS.slice(0, ALL_WORKS_SECTION_CAP) : DESIGN_CONCEPTS;
  const visibleWebsites =
    activeTab === "all" ? WEBSITE_PROJECTS.slice(0, ALL_WORKS_SECTION_CAP) : WEBSITE_PROJECTS;
  const visibleAndroidApps =
    activeTab === "all" ? ANDROID_PROJECTS.slice(0, ALL_WORKS_SECTION_CAP) : ANDROID_PROJECTS;

  const selectedDesign = selectedDesignIndex !== null ? DESIGN_CONCEPTS[selectedDesignIndex] : null;

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Ambient architectural background glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[560px] w-[560px] rounded-full bg-foreground/[0.045] blur-3xl" />
        <div className="absolute right-1/5 top-1/3 h-[500px] w-[500px] rounded-full bg-foreground/[0.035] blur-3xl" />
        <div className="absolute bottom-1/4 left-1/5 h-[460px] w-[460px] rounded-full bg-foreground/[0.04] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 z-[60] flex h-16 w-full items-center border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex w-full items-center justify-between gap-8 px-4 lg:px-8">
          <Link
            to="/"
            className="group flex shrink-0 items-center whitespace-nowrap font-display text-xl font-bold tracking-tighter"
          >
            SS<span className="transition-transform duration-300 group-hover:scale-125">.</span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
            {NAV.map((item) => {
              const isActive = item.label === "Portfolio";
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`relative shrink-0 whitespace-nowrap text-xs uppercase tracking-wider transition-all duration-200 hover:text-foreground ${
                    isActive
                      ? "font-bold text-foreground"
                      : "font-semibold text-muted-foreground/80"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <PWAInstallButton variant="header" />
            <Link
              to="/contact"
              className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90"
            >
              Start a Project
            </Link>
            <Link
              to="/account"
              aria-label="Account"
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border shadow-sm transition-transform duration-200 hover:scale-105"
            >
              <img
                src={PORTFOLIO_PLACEHOLDER_IMAGES[0]}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-top"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <PWAInstallButton variant="header" />
            <button className="p-2" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <MobileHeaderMenu open={open} activePath="/portfolio" onClose={() => setOpen(false)} />
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-28 sm:px-6 md:pt-36 lg:px-8">
        {/* Portfolio Hero Header */}
        <section className="mb-12 md:mb-16">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/45 p-6 shadow-xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl sm:p-10 lg:p-12">
            <div className="max-w-3xl">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Portfolio · Design, Motion, Web &amp; Mobile Archive
              </p>
              <h1 className="mb-5 font-display text-4xl font-bold leading-[1.08] tracking-tight [text-wrap:balance] sm:text-5xl lg:text-6xl">
                Crafted visuals, motion &amp;{" "}
                <span className="text-muted-foreground/80">scalable engineering.</span>
              </h1>
              <p className="max-w-2xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
                A unified archive of client design concepts, native video productions, custom
                full-stack websites, and Android applications. Browse the curated overview or open
                any section to inspect every project in serial order.
              </p>
            </div>

            {/* Section Filter Controls */}
            <div
              ref={archiveTopRef}
              className="mt-8 scroll-mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => switchCategory("all")}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeTab === "all"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  All Works ({totalWorks})
                </button>
                <button
                  type="button"
                  onClick={() => switchCategory("design")}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeTab === "design"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <Palette className="h-3.5 w-3.5" />
                  01. Design ({DESIGN_CONCEPTS.length})
                </button>
                <button
                  type="button"
                  onClick={() => switchCategory("video")}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeTab === "video"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <Film className="h-3.5 w-3.5" />
                  02. Video ({totalVideos})
                </button>
                <button
                  type="button"
                  onClick={() => switchCategory("website")}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeTab === "website"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  03. Website Development ({WEBSITE_PROJECTS.length})
                </button>
                <button
                  type="button"
                  onClick={() => switchCategory("android")}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeTab === "android"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  04. Android App Development ({ANDROID_PROJECTS.length})
                </button>
              </div>

              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {DESIGN_CONCEPTS.length} Designs · {totalVideos} Videos · {WEBSITE_PROJECTS.length}{" "}
                Websites · {ANDROID_PROJECTS.length} Android Apps
              </span>
            </div>
          </div>
        </section>

        {/* Master Glassmorphism Portfolio Container */}
        <div className="space-y-20 rounded-3xl border border-border/80 bg-background/30 p-4 shadow-2xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl sm:p-8 lg:p-10">
          {/* Focused Category Return Strip when viewing a single category */}
          {activeTab !== "all" && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5">
              <button
                type="button"
                onClick={() => switchCategory("all", true)}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background/70 px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to All Works Overview
              </button>
              <span className="text-xs text-muted-foreground">
                Showing complete serial archive for selected category
              </span>
            </div>
          )}

          {/* PART 1: DESIGN SECTION (All Works: 4 top + 4 bottom = 8; Design Tab: All 36 serial) */}
          {(activeTab === "all" || activeTab === "design") && (
            <section id="design-section" className="scroll-mt-24">
              <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    01. Client Visual Archive ·{" "}
                    {activeTab === "all"
                      ? `Showing 08 Featured of ${DESIGN_CONCEPTS.length}`
                      : `Complete Serial Archive (${DESIGN_CONCEPTS.length})`}
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Design <span className="text-muted-foreground/75">Projects.</span>
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {activeTab === "all" ? (
                    <button
                      type="button"
                      onClick={() => switchCategory("design", true)}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      View All {DESIGN_CONCEPTS.length} Designs
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                      All {DESIGN_CONCEPTS.length} uploaded client design concepts arranged in
                      serial order (01–{DESIGN_CONCEPTS.length}). Click any card to inspect full
                      screen.
                    </p>
                  )}
                </div>
              </div>

              {/* All Works: 4 columns × 2 rows (8 items); Design Tab: full 36 serial grid */}
              <div
                className={
                  activeTab === "all"
                    ? "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4"
                    : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                }
              >
                {visibleDesigns.map((item) => {
                  const fullIndex = item.id - 1;
                  return (
                    <article
                      key={item.id}
                      onClick={() => setSelectedDesignIndex(fullIndex)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedDesignIndex(fullIndex);
                        }
                      }}
                      className="group flex cursor-pointer flex-col rounded-2xl border border-border/75 bg-background/35 p-2.5 shadow-lg shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 hover:border-foreground/30 hover:bg-background/55 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border/60 bg-background/25 p-1 backdrop-blur-xl">
                        <div className="relative h-full w-full overflow-hidden rounded-lg bg-muted/40">
                          <img
                            src={item.image}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/55 via-transparent to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <span className="font-mono text-[10px] font-medium text-white">
                              #{item.code}
                            </span>
                            <Expand className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-1 flex-col justify-between rounded-xl border border-border/60 bg-background/45 px-2.5 py-2 backdrop-blur-xl transition-colors duration-200 group-hover:border-border/90 group-hover:bg-background/65">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                            {item.code}/{DESIGN_CONCEPTS.length}
                          </span>
                        </div>
                        <h3 className="mt-0.5 truncate font-display text-xs font-bold tracking-tight text-foreground sm:text-sm">
                          {item.title}
                        </h3>
                        <p className="mt-0.5 truncate text-[11px] font-light text-muted-foreground">
                          {item.clientCategory}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              {activeTab === "all" && DESIGN_CONCEPTS.length > ALL_WORKS_SECTION_CAP && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => switchCategory("design", true)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background/70 px-6 text-xs font-semibold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    Explore All {DESIGN_CONCEPTS.length} Design Projects (Serial 01–
                    {DESIGN_CONCEPTS.length})
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* PART 2: VIDEO SECTION (4 Long-Form top + 4 Short-Form bottom = 8 videos) */}
          {(activeTab === "all" || activeTab === "video") && (
            <section id="video-section" className="scroll-mt-24 space-y-12">
              <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    02. Native Motion Showcase · {totalVideos} Productions
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Video <span className="text-muted-foreground/75">Productions.</span>
                  </h2>
                </div>

                {activeTab === "all" ? (
                  <button
                    type="button"
                    onClick={() => switchCategory("video", true)}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:self-auto"
                  >
                    Open Video Archive ({totalVideos})
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                    All long-form widescreen edits and vertical short-form reels arranged in serial
                    order with native full-screen viewing.
                  </p>
                )}
              </div>

              {/* Subsection 2A: Long-Form Videos (Row of 4) */}
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    Long-Form <span className="text-muted-foreground/75">Videos</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {LONG_FORM_VIDEOS.length} Widescreen Productions (16:9) · Native Playback &amp;
                    Cinema Full-Screen
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {LONG_FORM_VIDEOS.map((video) => (
                    <NativeYouTubeCard
                      key={video.id}
                      video={video}
                      isPlaying={playingVideoId === video.id}
                      onTogglePlay={() =>
                        setPlayingVideoId((prev) => (prev === video.id ? null : video.id))
                      }
                      onOpenFullscreen={() => openVideoFullscreen(video)}
                    />
                  ))}
                </div>
              </div>

              {/* Subsection 2B: Short-Form Videos (Row of 4) */}
              <div className="space-y-5 border-t border-border/60 pt-10">
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    Short-Form <span className="text-muted-foreground/75">Videos</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {SHORT_FORM_VIDEOS.length} Vertical Reels &amp; Shorts (9:16) · Tailored for
                    Phone Full-Screen Viewing
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {SHORT_FORM_VIDEOS.map((video) => (
                    <NativeYouTubeCard
                      key={video.id}
                      video={video}
                      isPlaying={playingVideoId === video.id}
                      onTogglePlay={() =>
                        setPlayingVideoId((prev) => (prev === video.id ? null : video.id))
                      }
                      onOpenFullscreen={() => openVideoFullscreen(video)}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* PART 3: WEBSITE DEVELOPMENT SECTION */}
          {(activeTab === "all" || activeTab === "website") && (
            <section id="website-development" className="scroll-mt-24">
              <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    03. Web Engineering Showcase · {WEBSITE_PROJECTS.length} Builds
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Website <span className="text-muted-foreground/75">Development.</span>
                  </h2>
                </div>

                {activeTab === "all" ? (
                  <button
                    type="button"
                    onClick={() => switchCategory("website", true)}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:self-auto"
                  >
                    View All {WEBSITE_PROJECTS.length} Websites
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                    All {WEBSITE_PROJECTS.length} custom client websites, SaaS platforms, and
                    e-commerce storefronts arranged in serial order (01–0{WEBSITE_PROJECTS.length}).
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleWebsites.map((project) => (
                  <article
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedProject(project);
                      }
                    }}
                    className="group flex cursor-pointer flex-col rounded-3xl border border-border/80 bg-background/35 p-3.5 shadow-xl shadow-black/[0.04] ring-1 ring-inset ring-foreground/[0.05] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 hover:border-foreground/25 hover:bg-background/55 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {/* Browser-Style Glass Preview Container */}
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/30 p-1.5 backdrop-blur-xl">
                      <div className="mb-1.5 flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3 py-1.5 text-[11px] text-muted-foreground">
                        <span className="truncate font-mono">{project.previewDomainOrPackage}</span>
                        <Layout className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      </div>

                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted/40">
                        <img
                          src={project.image}
                          alt={project.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-1 flex-col justify-between rounded-2xl border border-border/60 bg-background/45 p-5 backdrop-blur-xl transition-colors duration-200 group-hover:border-border/90 group-hover:bg-background/65">
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">
                            {project.code} · {project.clientType}
                          </span>
                          <span className="font-mono tabular-nums">{project.year}</span>
                        </div>

                        <h3 className="mt-2 font-display text-lg font-bold leading-snug tracking-tight text-foreground">
                          {project.name}
                        </h3>

                        <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                          {project.summary}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-border/50 pt-3.5">
                        <p className="truncate font-mono text-[11px] text-foreground/75">
                          {project.stackSummary}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-foreground">
                          <span>View Case Study</span>
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* PART 4: ANDROID APP DEVELOPMENT SECTION */}
          {(activeTab === "all" || activeTab === "android") && (
            <section id="android-app-development" className="scroll-mt-24">
              <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    04. Mobile Engineering Showcase · {ANDROID_PROJECTS.length} Applications
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Android App <span className="text-muted-foreground/75">Development.</span>
                  </h2>
                </div>

                {activeTab === "all" ? (
                  <button
                    type="button"
                    onClick={() => switchCategory("android", true)}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:self-auto"
                  >
                    View All {ANDROID_PROJECTS.length} Android Apps
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                    All {ANDROID_PROJECTS.length} native and cross-platform Android applications
                    arranged in serial order (01–0{ANDROID_PROJECTS.length}).
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {visibleAndroidApps.map((app) => (
                  <article
                    key={app.id}
                    onClick={() => setSelectedProject(app)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedProject(app);
                      }
                    }}
                    className="group flex cursor-pointer flex-col rounded-3xl border border-border/80 bg-background/35 p-3.5 shadow-xl shadow-black/[0.04] ring-1 ring-inset ring-foreground/[0.05] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 hover:border-foreground/25 hover:bg-background/55 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/25 p-2 backdrop-blur-xl">
                      <div className="mb-1.5 flex items-center justify-between px-2 font-mono text-[10px] text-muted-foreground">
                        <span>ANDROID APK</span>
                        <Smartphone className="h-3.5 w-3.5 text-muted-foreground/80" />
                      </div>

                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted/40">
                        <img
                          src={app.image}
                          alt={app.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-1 flex-col justify-between rounded-2xl border border-border/60 bg-background/45 p-4 backdrop-blur-xl transition-colors duration-200 group-hover:border-border/90 group-hover:bg-background/65">
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">
                            {app.code} · {app.clientType}
                          </span>
                          <span className="font-mono tabular-nums">{app.year}</span>
                        </div>

                        <h3 className="mt-1.5 font-display text-base font-bold leading-snug tracking-tight text-foreground">
                          {app.name}
                        </h3>

                        <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                          {app.summary}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-border/50 pt-3">
                        <p className="truncate font-mono text-[10px] text-foreground/75">
                          {app.stackSummary}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between text-xs font-semibold text-foreground">
                          <span>Inspect Android App</span>
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Lightbox Modal for Design Concepts */}
      {selectedDesign && selectedDesignIndex !== null && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl"
          onClick={() => setSelectedDesignIndex(null)}
        >
          <div
            className="relative flex w-full max-w-3xl flex-col gap-6 overflow-hidden rounded-3xl border border-border/90 bg-background/85 p-6 shadow-2xl ring-1 ring-inset ring-foreground/10 backdrop-blur-2xl sm:flex-row sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedDesignIndex(null)}
              aria-label="Close design preview"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="aspect-[4/5] w-full shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-background/40 p-1.5 backdrop-blur-md sm:w-72">
              <img
                src={selectedDesign.image}
                alt={selectedDesign.title}
                referrerPolicy="no-referrer"
                className="h-full w-full rounded-xl object-cover object-top"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between py-1">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Concept {selectedDesign.code} of {DESIGN_CONCEPTS.length} ·{" "}
                  {selectedDesign.clientCategory}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {selectedDesign.title}
                </h3>
                <div className="mt-5 rounded-2xl border border-border/70 bg-background/50 p-4 backdrop-blur-xl">
                  <p className="text-sm font-light leading-relaxed text-muted-foreground">
                    Client design concept crafted with custom typography, visual hierarchy, and
                    brand-aligned composition. Ready to be updated with your final project artwork.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDesignIndex(
                        (selectedDesignIndex - 1 + DESIGN_CONCEPTS.length) % DESIGN_CONCEPTS.length,
                      )
                    }
                    aria-label="Previous design concept"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDesignIndex((selectedDesignIndex + 1) % DESIGN_CONCEPTS.length)
                    }
                    aria-label="Next design concept"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-muted"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDesignIndex(null)}
                  className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Study & Technical Breakdown Modal for Website & Android Projects */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col gap-6 overflow-y-auto rounded-3xl border border-border/90 bg-background/90 p-6 shadow-2xl ring-1 ring-inset ring-foreground/10 backdrop-blur-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project breakdown"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/40 p-1.5 backdrop-blur-md sm:col-span-5">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.name}
                  referrerPolicy="no-referrer"
                  className="aspect-[4/5] h-full w-full rounded-xl object-cover object-top"
                />
              </div>

              <div className="flex flex-col justify-between sm:col-span-7">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {selectedProject.category === "website"
                      ? "Website Development"
                      : "Android App Development"}{" "}
                    · {selectedProject.clientType}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {selectedProject.name}
                  </h3>
                  <p className="mt-2 font-mono text-xs text-foreground/80">
                    {selectedProject.stackSummary}
                  </p>

                  <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
                    {selectedProject.summary}
                  </p>

                  <div className="mt-5 space-y-2.5 rounded-2xl border border-border/70 bg-background/50 p-4 backdrop-blur-xl">
                    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-foreground">
                      <Code2 className="h-3.5 w-3.5" />
                      Key Engineering Deliverables
                    </p>
                    <ul className="space-y-2">
                      {selectedProject.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs font-light leading-relaxed text-muted-foreground"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                  <Link
                    to="/contact"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                  >
                    Request Similar Project
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-Website Full-Screen Video Player (Phone 9:16 or Cinema 16:9) */}
      {fullscreenVideo && (
        <div
          ref={fullscreenContainerRef}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/95 p-0 backdrop-blur-2xl sm:p-4"
          onClick={closeVideoFullscreen}
        >
          <div
            className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 py-4 sm:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-white">
              <span className="font-mono text-xs uppercase tracking-widest text-white/70">
                {fullscreenVideo.format === "short"
                  ? "Phone Full-Screen (9:16)"
                  : "Cinema Full-Screen (16:9)"}
              </span>
              <span aria-hidden="true" className="text-white/40">
                ·
              </span>
              <span className="font-display text-sm font-bold">{fullscreenVideo.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFullscreenPaused(false);
                  setReloadKey((k) => k + 1);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Replay
              </button>
              <button
                type="button"
                onClick={closeVideoFullscreen}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-black shadow-lg transition-transform hover:scale-105"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                Exit Full Screen
              </button>
            </div>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className={
              fullscreenVideo.format === "short"
                ? "relative h-dvh w-full max-w-[460px] overflow-hidden bg-black shadow-2xl sm:h-[90dvh] sm:rounded-3xl sm:border sm:border-white/20"
                : "relative aspect-video w-full max-w-6xl overflow-hidden bg-black shadow-2xl sm:rounded-3xl sm:border sm:border-white/20"
            }
          >
            {!fullscreenPaused ? (
              <iframe
                key={`${fullscreenVideo.id}-${reloadKey}`}
                src={`https://www.youtube-nocookie.com/embed/${fullscreenVideo.youtubeId}?autoplay=1&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${fullscreenVideo.youtubeId}`}
                title={fullscreenVideo.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                className="pointer-events-none h-[114%] w-[114%] -translate-x-[7%] -translate-y-[7%] border-0 object-cover"
              />
            ) : (
              <div className="relative h-full w-full">
                <img
                  src={fullscreenVideo.thumbnail}
                  alt={fullscreenVideo.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top opacity-60"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setFullscreenPaused((prev) => !prev)}
              aria-label={fullscreenPaused ? "Play video" : "Pause video"}
              className="group absolute inset-0 flex items-center justify-center bg-transparent focus:outline-none"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white shadow-2xl backdrop-blur-xl transition-all duration-200 ${
                  fullscreenPaused
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                }`}
              >
                {fullscreenPaused ? (
                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                ) : (
                  <Pause className="h-6 w-6" />
                )}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activePath="/portfolio" />
    </div>
  );
}
