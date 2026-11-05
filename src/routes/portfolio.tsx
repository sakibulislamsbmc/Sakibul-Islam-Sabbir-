import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Film,
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

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Sakibul Islam" },
      {
        name: "description",
        content:
          "Selected client design concepts, long-form edits, and short-form vertical reels by Sakibul Islam.",
      },
      { property: "og:title", content: "Portfolio — Sakibul Islam" },
      {
        property: "og:description",
        content:
          "Explore 36 client design concepts and native long-form and short-form video productions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Me", href: "/about-me" },
  { label: "Thankful", href: "/thankful" },
  { label: "Contact", href: "/contact" },
];

const PLACEHOLDER_IMAGES = [
  "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png",
  "https://www.image2url.com/r2/default/images/1793830267590-654c4729-bbde-4ca9-8721-fef466601fa0.png",
  "https://www.image2url.com/r2/default/images/1793830305704-e179d36b-b9ab-42bd-abcd-003dda243066.png",
  "https://www.image2url.com/r2/default/images/1793830412305-08adbd21-af0b-48e9-a6ea-195463fd1fad.png",
] as const;

const DESIGN_CATEGORIES = [
  "Brand Identity",
  "Social Media Campaign",
  "Thumbnail Architecture",
  "Poster & Key Art",
  "UI / Visual System",
  "Editorial Layout",
] as const;

export type DesignConcept = {
  id: number;
  code: string;
  title: string;
  clientCategory: string;
  image: string;
};

// 36 Design Concepts (arranged 6 per row on desktop)
const DESIGN_CONCEPTS: DesignConcept[] = Array.from({ length: 36 }, (_, idx) => {
  const num = idx + 1;
  const code = String(num).padStart(2, "0");
  const image = PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]!;
  const clientCategory = DESIGN_CATEGORIES[idx % DESIGN_CATEGORIES.length]!;
  return {
    id: num,
    code,
    title: `Design Concept ${code}`,
    clientCategory,
    image,
  };
});

export type VideoItem = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  duration: string;
  youtubeId: string;
  thumbnail: string;
  format: "long" | "short";
};

// 4 Long-Form Videos (16:9 widescreen)
const LONG_FORM_VIDEOS: VideoItem[] = [
  {
    id: "long-1",
    code: "01",
    title: "Barnoi Lifestyle TVC Ads Project",
    subtitle: "TV Commercial & Lifestyle Brand Film",
    duration: "01:24",
    youtubeId: "qrsIbB93Uhk",
    thumbnail: "https://i.ytimg.com/vi/qrsIbB93Uhk/maxresdefault.jpg",
    format: "long",
  },
  {
    id: "long-2",
    code: "02",
    title: "Nafees Selim Podcast In As-Sunnah Skill",
    subtitle: "Long-Form Interview & Educational Podcast",
    duration: "24:15",
    youtubeId: "iGTBJB_OLMI",
    thumbnail: "https://i.ytimg.com/vi/iGTBJB_OLMI/maxresdefault.jpg",
    format: "long",
  },
  {
    id: "long-3",
    code: "03",
    title: "SAS Animation Video Technology Update",
    subtitle: "Tech Breakdown & Motion Graphics Edit",
    duration: "03:40",
    youtubeId: "VqmB74aXV9s",
    thumbnail: "https://i.ytimg.com/vi/VqmB74aXV9s/maxresdefault.jpg",
    format: "long",
  },
  {
    id: "long-4",
    code: "04",
    title: "Promotional Ads Video for Ghorer Bazar",
    subtitle: "E-Commerce Promotional Campaign & Pacing",
    duration: "01:05",
    youtubeId: "HWWI6WyThQ8",
    thumbnail: "https://i.ytimg.com/vi/HWWI6WyThQ8/maxresdefault.jpg",
    format: "long",
  },
];

// 4 Short-Form Videos (9:16 vertical phone format)
const SHORT_FORM_VIDEOS: VideoItem[] = [
  {
    id: "short-1",
    code: "01",
    title: "Modiology Brand Product Promotion",
    subtitle: "Product Commercial & Motion Reel",
    duration: "0:45",
    youtubeId: "iYqOrHPYuaA",
    thumbnail: "https://i.ytimg.com/vi/iYqOrHPYuaA/maxresdefault.jpg",
    format: "short",
  },
  {
    id: "short-2",
    code: "02",
    title: "2D Animation Storytelling Short",
    subtitle: "Storytelling, Voiceover & Dynamic Motion",
    duration: "0:48",
    youtubeId: "tWEah--CBco",
    thumbnail: "https://i.ytimg.com/vi/tWEah--CBco/maxresdefault.jpg",
    format: "short",
  },
  {
    id: "short-3",
    code: "03",
    title: "Product Motion Graphics Video",
    subtitle: "3D/2D Motion Design & Dynamic Pacing",
    duration: "0:36",
    youtubeId: "lZWfel4Hpgg",
    thumbnail: "https://i.ytimg.com/vi/lZWfel4Hpgg/maxresdefault.jpg",
    format: "short",
  },
  {
    id: "short-4",
    code: "04",
    title: "Animation Video Editing with AI",
    subtitle: "AI-Powered Animation Workflow & Tutorial",
    duration: "0:42",
    youtubeId: "nKyBhlKxZIE",
    thumbnail: "https://i.ytimg.com/vi/nKyBhlKxZIE/maxresdefault.jpg",
    format: "short",
  },
];

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
              {/* Scale slightly & mask pointer events on iframe so YouTube title/share chrome never appears */}
              <iframe
                src={embedSrc}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                className="pointer-events-none h-[116%] w-[116%] -translate-x-[8%] -translate-y-[8%] border-0 object-cover"
              />
              {/* Custom native control surface */}
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

              {/* Center Play Option Only */}
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

              {/* Bottom bar with duration & in-website fullscreen button */}
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
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "design" | "video">("all");
  const [selectedDesignIndex, setSelectedDesignIndex] = useState<number | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<VideoItem | null>(null);
  const [fullscreenPaused, setFullscreenPaused] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const openVideoFullscreen = (video: VideoItem) => {
    setPlayingVideoId(null);
    setFullscreenPaused(false);
    setFullscreenVideo(video);
    setTimeout(() => {
      const el = fullscreenContainerRef.current;
      if (el && el.requestFullscreen) {
        el.requestFullscreen().catch(() => {
          // Fallback to fixed viewport full-screen overlay if browser blocks native requestFullscreen
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

  const selectedDesign = selectedDesignIndex !== null ? DESIGN_CONCEPTS[selectedDesignIndex] : null;

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Ambient architectural background glow for glassmorphic depth */}
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
              const isInternal = item.href.startsWith("/");
              return isInternal ? (
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
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="relative shrink-0 whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 transition-all duration-200 hover:text-foreground"
                >
                  {item.label}
                </a>
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
                src={PLACEHOLDER_IMAGES[0]}
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
        {/* Glassmorphic Portfolio Hero Header */}
        <section className="mb-12 md:mb-16">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/45 p-6 shadow-xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl sm:p-10 lg:p-12">
            <div className="max-w-3xl">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Portfolio · Design & Motion Archive
              </p>
              <h1 className="mb-5 font-display text-4xl font-bold leading-[1.08] tracking-tight [text-wrap:balance] sm:text-5xl lg:text-6xl">
                Crafted visuals &{" "}
                <span className="text-muted-foreground/80">native storytelling.</span>
              </h1>
              <p className="max-w-2xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
                A curated showcase of client design concepts, widescreen long-form productions, and
                vertical short-form reels—presented inside transparent glassmorphic frames with
                native in-website playback.
              </p>
            </div>

            {/* Section Filter Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeTab === "all"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  All Works (44)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("design")}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeTab === "design"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <Palette className="h-3.5 w-3.5" />
                  01. Design Section (36)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("video")}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeTab === "video"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <Film className="h-3.5 w-3.5" />
                  02. Video Section (8)
                </button>
              </div>

              <span className="text-xs text-muted-foreground">
                36 Client Designs (6 per row) · 4 Long-Form · 4 Short-Form
              </span>
            </div>
          </div>
        </section>

        {/* Master Glassmorphism Portfolio Container */}
        <div className="space-y-16 rounded-3xl border border-border/80 bg-background/30 p-4 shadow-2xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl sm:p-8 lg:p-10">
          {/* PART 1: DESIGN SECTION (36 Concepts, 6 per row) */}
          {(activeTab === "all" || activeTab === "design") && (
            <section id="design-section" className="scroll-mt-24">
              <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    01. Client Visual Archive
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Design <span className="text-muted-foreground/75">Projects.</span>
                  </h2>
                </div>
                <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                  36 client design concepts arranged 6 per row inside transparent glassmorphic
                  frames. Click any concept to inspect full screen.
                </p>
              </div>

              {/* 6-Per-Row Grid for 36 Design Concepts */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {DESIGN_CONCEPTS.map((item, idx) => (
                  <article
                    key={item.id}
                    onClick={() => setSelectedDesignIndex(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedDesignIndex(idx);
                      }
                    }}
                    className="group flex cursor-pointer flex-col rounded-2xl border border-border/75 bg-background/35 p-2.5 shadow-lg shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 hover:border-foreground/30 hover:bg-background/55 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {/* Transparent Glass Container for Rounded-Rectangle Image */}
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

                    {/* Transparent Glass Caption Area Below Image */}
                    <div className="mt-2 flex flex-1 flex-col justify-between rounded-xl border border-border/60 bg-background/45 px-2.5 py-2 backdrop-blur-xl transition-colors duration-200 group-hover:border-border/90 group-hover:bg-background/65">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                          {item.code}/36
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
                ))}
              </div>
            </section>
          )}

          {/* PART 2: VIDEO SECTION (Long-Form & Short-Form Subsections) */}
          {(activeTab === "all" || activeTab === "video") && (
            <section id="video-section" className="scroll-mt-24 space-y-16">
              <div className="flex flex-col justify-between gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    02. Native Motion Showcase
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Video <span className="text-muted-foreground/75">Productions.</span>
                  </h2>
                </div>
                <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                  Streamed directly with a clean, native player interface—free of external
                  clutter—and full-screen viewing tailored to both desktop and phone screens.
                </p>
              </div>

              {/* Subsection 2A: Long-Form Videos (4 Videos) */}
              <div className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-display text-2xl font-bold tracking-tight">
                      Long-Form <span className="text-muted-foreground/75">Videos</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      4 Widescreen Productions (16:9) · Native Playback & Cinema Full-Screen
                    </p>
                  </div>
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

              {/* Subsection 2B: Short-Form Videos (4 Videos) */}
              <div className="space-y-6 border-t border-border/60 pt-12">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-display text-2xl font-bold tracking-tight">
                      Short-Form <span className="text-muted-foreground/75">Videos</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      4 Vertical Reels & Shorts (9:16) · Tailored for Phone Full-Screen Viewing
                    </p>
                  </div>
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
                  Concept {selectedDesign.code} of 36 · {selectedDesign.clientCategory}
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

      {/* In-Website Full-Screen Video Player (Tailored to Phone 9:16 or Cinema 16:9) */}
      {fullscreenVideo && (
        <div
          ref={fullscreenContainerRef}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/95 p-0 backdrop-blur-2xl sm:p-4"
          onClick={closeVideoFullscreen}
        >
          {/* Top Floating Glass Control Bar */}
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

          {/* Responsive Video Viewport — Full Phone Screen (9:16) for Shorts or 16:9 for Long-Form */}
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

            {/* Interactive Tap Layer to Play/Pause Natively Without YouTube UI */}
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
