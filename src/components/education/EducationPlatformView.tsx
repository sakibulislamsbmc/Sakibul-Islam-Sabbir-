import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Cpu,
  ExternalLink,
  GraduationCap,
  Headphones,
  Maximize2,
  Menu,
  Minimize2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { BismahAudioPlayerApp } from "@/components/bismah/BismahAudioPlayerApp";
import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { BooksShowcaseSection } from "@/components/books/BooksShowcaseSection";
import { BOOKS_CATALOG } from "@/data/books-data";
import { QURAN_COURSE } from "@/data/courses-data";
import { GRAPHIC_DESIGN_COURSE } from "@/data/graphic-design-course-data";
import {
  EVENT_CONFIG,
  LEARNING_MODULES,
  WORKSHOP_ASSETS,
  WORKSHOP_STATS,
} from "@/data/workshop-data";

export type EducationSectionId = "courses" | "workshops" | "books" | "bismah";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Education", href: "/education" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Me", href: "/about-me" },
  { label: "Thankful", href: "/thankful" },
  { label: "Contact", href: "/contact" },
];

const PROFILE_THUMB =
  "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png";

const TOTAL_COURSES = 2;
const TOTAL_WORKSHOPS = 1;

export function EducationPlatformView({ initialSection }: { initialSection?: EducationSectionId }) {
  const [open, setOpen] = useState(false);
  const [fullscreenSection, setFullscreenSection] = useState<EducationSectionId | null>(
    initialSection ?? null,
  );
  const [courseFilter, setCourseFilter] = useState<"all" | "free" | "paid">("all");
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const fullscreenOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSection) {
      setFullscreenSection(initialSection);
    }
  }, [initialSection]);

  // Lock background scroll while full-screen section is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!fullscreenSection) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreenSection]);

  // Sync native browser fullscreen state
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFullscreenChange = () => {
      setIsBrowserFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const closeFullscreenSection = useCallback(() => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setFullscreenSection(null);
  }, []);

  // ESC closes full-screen section overlay
  useEffect(() => {
    if (!fullscreenSection) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeFullscreenSection();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreenSection, closeFullscreenSection]);

  const openFullscreenSection = (section: EducationSectionId) => {
    setFullscreenSection(section);
    if (fullscreenOverlayRef.current) {
      fullscreenOverlayRef.current.scrollTop = 0;
    }
  };

  const toggleBrowserFullscreen = () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      const target = fullscreenOverlayRef.current ?? document.documentElement;
      if (target.requestFullscreen) {
        target.requestFullscreen().catch(() => {});
      }
    }
  };

  const showFreeCourse = courseFilter === "all" || courseFilter === "free";
  const showPaidCourse = courseFilter === "all" || courseFilter === "paid";

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Subtle architectural grid background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-foreground/[0.04] blur-3xl" />
        <div className="absolute right-1/5 top-1/3 h-[460px] w-[460px] rounded-full bg-foreground/[0.03] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 z-[60] flex h-16 w-full items-center border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex w-full items-center justify-between gap-8 px-4 lg:px-8">
          <Link
            to="/"
            className="group flex shrink-0 items-center whitespace-nowrap font-display text-xl font-bold tracking-tighter"
          >
            SS<span className="transition-transform duration-300 group-hover:scale-125">.</span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
            {NAV.map((item) => {
              const isActive = item.label === "Education";
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
              to="/account"
              className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90"
            >
              Student Portal
            </Link>
            <Link
              to="/account"
              aria-label="Account"
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border shadow-sm transition-transform duration-200 hover:scale-105"
            >
              <img
                src={PROFILE_THUMB}
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

        <MobileHeaderMenu open={open} activePath="/education" onClose={() => setOpen(false)} />
      </header>

      {/* Main Educational Platform Hub */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-28 sm:px-6 md:pt-36 lg:px-8">
        {/* Platform Hero */}
        <section className="mb-12">
          <div className="rounded-3xl border border-border/80 bg-background/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p className="mb-3 font-mono text-xs tracking-wider text-muted-foreground">
                  Education · Bismahsoft Learning Platform
                </p>
                <h1 className="mb-4 font-display text-4xl font-bold leading-[1.08] tracking-tight [text-wrap:balance] sm:text-5xl lg:text-[3.35rem]">
                  Courses, workshops, books &amp;{" "}
                  <span className="text-muted-foreground/80">Bismah audio.</span>
                </h1>
                <p className="max-w-2xl font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif] text-base leading-relaxed text-muted-foreground sm:text-lg">
                  একটি সমন্বিত শিক্ষামূলক প্ল্যাটফর্ম—যেখানে ফ্রি ও পেইড লাইভ কোর্স, স্টুডেন্ট এআই
                  ওয়ার্কশপ, মৌলিক বাংলা ই-বুক এবং ‘Bismah’ স্ট্যান্ডঅ্যালোন অডিও পডকাস্ট প্লেয়ার
                  একসাথে সাজানো আছে। যেকোনো সেকশনে ক্লিক করলেই তা সম্পূর্ণ ফুল-স্ক্রিন লার্নিং মোডে
                  খুলবে।
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => openFullscreenSection("courses")}
                    className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:opacity-90"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Explore Courses
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    to="/account"
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    My Learning
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  Google Account Connected · Verified Access
                </p>
              </div>
            </div>

            {/* Full-Width Learning Metrics Row */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/70 pt-6 sm:grid-cols-4">
              <div>
                <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  0{TOTAL_COURSES}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Online Courses · Free &amp; Paid Live
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  0{TOTAL_WORKSHOPS}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Flagship Student AI Workshop</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  0{BOOKS_CATALOG.length}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Published Books · In-Site Reader
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold tabular-nums text-foreground">Bismah</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Audio Book · YouTube &amp; Offline Library
                </p>
              </div>
            </div>

            {/* Interactive Full-Screen Section Selector Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openFullscreenSection("courses")}
                  className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-all duration-150 hover:border-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  01. Courses ({TOTAL_COURSES})
                  <Maximize2 className="h-3 w-3 opacity-70" />
                </button>
                <button
                  type="button"
                  onClick={() => openFullscreenSection("workshops")}
                  className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-all duration-150 hover:border-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  02. Workshops ({TOTAL_WORKSHOPS})
                  <Maximize2 className="h-3 w-3 opacity-70" />
                </button>
                <button
                  type="button"
                  onClick={() => openFullscreenSection("books")}
                  className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-all duration-150 hover:border-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  03. Books ({BOOKS_CATALOG.length})
                  <Maximize2 className="h-3 w-3 opacity-70" />
                </button>
                <button
                  type="button"
                  onClick={() => openFullscreenSection("bismah")}
                  className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-all duration-150 hover:border-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <Headphones className="h-3.5 w-3.5" />
                  04. Bismah Audio Book
                  <Maximize2 className="h-3 w-3 opacity-70" />
                </button>
              </div>

              <span className="text-xs text-muted-foreground">
                Click any section above or below to launch Full-Screen Mode
              </span>
            </div>
          </div>
        </section>

        {/* Three Dedicated Learning Pillars Overview */}
        <div className="space-y-16">
          {/* PILLAR 01: COURSES */}
          <section
            id="education-courses"
            className="rounded-3xl border border-border/80 bg-background/60 p-6 shadow-sm backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="mb-1.5 font-mono text-xs text-muted-foreground">
                  01. Structured Learning Programs · {TOTAL_COURSES} Active Courses
                </p>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Courses <span className="text-muted-foreground/75">&amp; Masterclasses.</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => openFullscreenSection("courses")}
                className="inline-flex h-10 shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:self-auto"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Open Courses Full Screen
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Course Card 01: Free Quran Course */}
              <div className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-lg">
                <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
                  <img
                    src={QURAN_COURSE.thumbnail}
                    alt={QURAN_COURSE.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Free Course</span>
                      <span aria-hidden="true">·</span>
                      <span>{QURAN_COURSE.organization.name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {QURAN_COURSE.lessons.length}টি ক্লাস
                      </span>
                    </div>
                    <h3 className="mt-2 text-2xl font-bold leading-snug tracking-tight text-foreground">
                      {QURAN_COURSE.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {QURAN_COURSE.englishTitle}
                    </p>

                    <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
                      <img
                        src={QURAN_COURSE.instructor.avatar}
                        alt={QURAN_COURSE.instructor.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 shrink-0 rounded-full border border-border object-cover object-top"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {QURAN_COURSE.instructor.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          সাবেক শিক্ষক, মসজিদে নববী · মদীনা
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold tabular-nums text-foreground">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {QURAN_COURSE.rating}
                      </span>
                      <span aria-hidden="true" className="text-muted-foreground">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {QURAN_COURSE.enrolledCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openFullscreenSection("courses")}
                        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        Full Screen
                      </button>
                      <Link
                        to="/courses"
                        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        কোর্স খুলুন
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Card 02: Paid Graphic Design & AI Live Course */}
              <div className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-lg">
                <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
                  <img
                    src={GRAPHIC_DESIGN_COURSE.thumbnail}
                    alt={GRAPHIC_DESIGN_COURSE.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Paid Live Course</span>
                      <span aria-hidden="true">·</span>
                      <span>Bismahsoft Academy</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {GRAPHIC_DESIGN_COURSE.lessons.length}+ Classes
                      </span>
                    </div>
                    <h3 className="mt-2 text-2xl font-bold leading-snug tracking-tight text-foreground">
                      {GRAPHIC_DESIGN_COURSE.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {GRAPHIC_DESIGN_COURSE.tagline}
                    </p>

                    <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
                      <img
                        src={GRAPHIC_DESIGN_COURSE.mentor.avatar}
                        alt={GRAPHIC_DESIGN_COURSE.mentor.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 shrink-0 rounded-full border border-border object-cover object-top"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {GRAPHIC_DESIGN_COURSE.mentor.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {GRAPHIC_DESIGN_COURSE.mentor.roleTitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold tabular-nums text-foreground">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {GRAPHIC_DESIGN_COURSE.rating}
                      </span>
                      <span aria-hidden="true" className="text-muted-foreground">
                        ·
                      </span>
                      <span className="font-mono text-xs text-muted-foreground line-through tabular-nums">
                        ৳{GRAPHIC_DESIGN_COURSE.originalPriceBdt.toLocaleString("en-US")}
                      </span>
                      <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                        ৳{GRAPHIC_DESIGN_COURSE.priceBdt.toLocaleString("en-US")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openFullscreenSection("courses")}
                        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        Full Screen
                      </button>
                      <Link
                        to="/graphic-design-course"
                        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        এনরোল ও বিস্তারিত
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PILLAR 02: WORKSHOPS */}
          <section
            id="education-workshops"
            className="rounded-3xl border border-border/80 bg-background/60 p-6 shadow-sm backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="mb-1.5 font-mono text-xs text-muted-foreground">
                  02. Live Student AI Sessions · {TOTAL_WORKSHOPS} Flagship Program
                </p>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Workshops <span className="text-muted-foreground/75">&amp; Live Events.</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => openFullscreenSection("workshops")}
                className="inline-flex h-10 shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:self-auto"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Open Workshop Full Screen
              </button>
            </div>

            <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#050505] p-5 text-white shadow-xl sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-5">
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0F0D] p-2">
                    <img
                      src={WORKSHOP_ASSETS.eventBanner}
                      alt="AI FOR STUDENTS Workshop 2027 banner"
                      className="aspect-[3264/1446] w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#0B0F0D] p-4">
                    <img
                      src={WORKSHOP_ASSETS.logo}
                      alt="AI FOR STUDENTS Workshop 2027 logo"
                      className="h-14 w-14 shrink-0 object-contain"
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-[#00D978]">
                        {EVENT_CONFIG.organizer} × {EVENT_CONFIG.mainSponsor}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white">
                        Main Speaker: Sakibul Islam Sabbir
                      </p>
                      <p className="text-[11px] text-[#A1A1AA]">
                        Mentor - Generative AI · Designer &amp; Vibe Coder
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between lg:col-span-7">
                  <div>
                    <p className="font-mono text-xs text-[#00D978]">
                      {EVENT_CONFIG.edition} · {EVENT_CONFIG.eventFormatLabel}
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-white [text-wrap:balance] sm:text-4xl">
                      {EVENT_CONFIG.eventName} —{" "}
                      <span className="text-[#00D978]">Workshop 2027</span>
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
                      {EVENT_CONFIG.theme} Streamlined as a{" "}
                      <strong className="font-semibold text-white">
                        One-Night Online Live Meeting
                      </strong>{" "}
                      on Google Meet covering Generative AI fundamentals, smart prompting, creative
                      Vibe Coding workflows, and ethical AI literacy.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-[#0B0F0D] p-4">
                        <p className="flex items-center gap-2 font-mono text-[11px] text-[#00D978]">
                          <Cpu className="h-3.5 w-3.5" />
                          <span>Live Format &amp; Platform</span>
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-white">
                          {EVENT_CONFIG.eventVenueLabel} · 8 AI Modules
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#0B0F0D] p-4">
                        <p className="flex items-center gap-2 font-mono text-[11px] text-[#00D978]">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Schedule &amp; Night Time</span>
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-white">
                          {EVENT_CONFIG.eventDateLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                    <button
                      type="button"
                      onClick={() => openFullscreenSection("workshops")}
                      className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-4 text-xs font-semibold text-white transition-colors hover:border-[#00D978]/60 hover:bg-white/10"
                    >
                      <Maximize2 className="h-3.5 w-3.5 text-[#00D978]" />
                      Full-Screen Workshop Preview
                    </button>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <a
                        href={EVENT_CONFIG.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#00D978]/50 bg-[#0B0F0D] px-4 text-xs font-bold text-[#00D978] transition-colors hover:bg-[#00D978]/15"
                      >
                        Buy Ticket
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <Link
                        to="/workshop"
                        className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#00D978] px-5 text-xs font-bold text-[#050505] transition-colors hover:bg-[#00D978]/90"
                      >
                        Open Workshop Page
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </section>

          {/* PILLAR 03: BOOKS & DIGITAL LIBRARY */}
          <section
            id="education-books"
            className="rounded-3xl border border-border/80 bg-background/60 p-6 shadow-sm backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="mb-1.5 font-mono text-xs text-muted-foreground">
                  03. Authored E-Books &amp; Protected Reader · {BOOKS_CATALOG.length} Published
                  Works
                </p>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Books <span className="text-muted-foreground/75">&amp; Digital Library.</span>
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openFullscreenSection("books")}
                  className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Open Books Full Screen
                </button>
                <Link
                  to="/books"
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Standalone Page
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Clean Library Preview Cards in Overview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {BOOKS_CATALOG.map((book) => {
                const isFree = book.accessType === "free";
                return (
                  <article
                    key={book.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-lg sm:flex-row"
                  >
                    <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-muted/40 sm:w-44">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-5 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isFree ? "Free E-Book" : "Premium E-Book"} · {book.pagesCount} পৃষ্ঠা ·{" "}
                          {book.authorBn}
                        </p>
                        <h3 className="mt-1.5 text-xl font-bold leading-snug text-foreground">
                          {book.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                          {book.shortDescription}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                        <div className="flex items-baseline gap-2 font-mono tabular-nums">
                          {isFree ? (
                            <>
                              {book.regularPriceBdt ? (
                                <span className="text-xs text-muted-foreground line-through">
                                  ৳{book.regularPriceBdt}
                                </span>
                              ) : null}
                              <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                                ফ্রি পড়ুন
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-bold text-foreground">
                              ৳{book.priceBdt}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openFullscreenSection("books")}
                            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                            {isFree ? "পড়ুন (Full Screen)" : "একটু পড়ুন ও কিনুন"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* PILLAR 04: BISMAH STANDALONE AUDIO BOOK PLAYER */}
          <section
            id="education-bismah"
            className="rounded-3xl border border-border/80 bg-background/60 p-6 shadow-sm backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="mb-1.5 font-mono text-xs text-muted-foreground">
                  04. Personal YouTube &amp; Offline Audio Library · No Sign-In Required
                </p>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Bismah <span className="text-muted-foreground/75">Audio Book.</span>
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openFullscreenSection("bismah")}
                  className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Open Bismah Full Screen
                </button>
                <Link
                  to="/bismah"
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Standalone Page
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <BismahAudioPlayerApp showStandaloneLink />
          </section>
        </div>
      </main>

      {/* ================================================================= */}
      {/* FULL-SCREEN DEDICATED SECTION EXPERIENCE (Courses / Workshops / Books) */}
      {/* ================================================================= */}
      {fullscreenSection && (
        <div
          ref={fullscreenOverlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Full-screen ${fullscreenSection} section`}
          className={`fixed inset-0 z-[85] overflow-y-auto ${
            fullscreenSection === "workshops"
              ? "bg-[#050505] text-white"
              : "bg-background text-foreground"
          }`}
        >
          {/* Compact Single-Row Sticky Full-Screen Bar */}
          <div
            className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
              fullscreenSection === "workshops"
                ? "border-white/10 bg-[#050505]/92"
                : "border-border/80 bg-background/92"
            }`}
          >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              {/* Zone 1: Back to Education Hub */}
              <button
                type="button"
                onClick={closeFullscreenSection}
                className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                  fullscreenSection === "workshops"
                    ? "border-white/15 bg-white/5 text-white hover:bg-white/15"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Education</span>
              </button>

              {/* Zone 2: Seamless Full-Screen Section Switcher */}
              <div
                className={`flex items-center gap-1 rounded-full border p-1 ${
                  fullscreenSection === "workshops"
                    ? "border-white/15 bg-white/5"
                    : "border-border bg-muted/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => openFullscreenSection("courses")}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors ${
                    fullscreenSection === "courses"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : fullscreenSection === "workshops"
                        ? "text-white/75 hover:text-white"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Courses</span>
                </button>
                <button
                  type="button"
                  onClick={() => openFullscreenSection("workshops")}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors ${
                    fullscreenSection === "workshops"
                      ? "bg-[#00D978] text-[#050505] shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Workshops</span>
                </button>
                <button
                  type="button"
                  onClick={() => openFullscreenSection("books")}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors ${
                    fullscreenSection === "books"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : fullscreenSection === "workshops"
                        ? "text-white/75 hover:text-white"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Books</span>
                </button>
                <button
                  type="button"
                  onClick={() => openFullscreenSection("bismah")}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors ${
                    fullscreenSection === "bismah"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : fullscreenSection === "workshops"
                        ? "text-white/75 hover:text-white"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Headphones className="h-3.5 w-3.5" />
                  <span>Bismah</span>
                </button>
              </div>

              {/* Zone 3: Browser Fullscreen + Exit */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={toggleBrowserFullscreen}
                  title={
                    isBrowserFullscreen ? "Exit browser fullscreen" : "Expand browser fullscreen"
                  }
                  className={`hidden h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors sm:inline-flex ${
                    fullscreenSection === "workshops"
                      ? "border-white/15 bg-white/5 text-white hover:bg-white/15"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {isBrowserFullscreen ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5" />
                      <span>Window</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Full Display</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeFullscreenSection}
                  aria-label="Close full-screen section"
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                    fullscreenSection === "workshops"
                      ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* FULL-SCREEN VIEW 1: COURSES */}
          {fullscreenSection === "courses" && (
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
              <div className="flex flex-col justify-between gap-6 border-b border-border/80 pb-8 lg:flex-row lg:items-end">
                <div className="max-w-3xl">
                  <p className="font-mono text-xs text-muted-foreground">
                    Education · Full-Screen Courses Platform
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-bold tracking-tight [text-wrap:balance] sm:text-5xl">
                    Structured Online Courses.
                  </h2>
                  <p className="mt-3 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif] text-base leading-relaxed text-muted-foreground">
                    ফ্রি ও পেইড লাইভ কোর্সসমূহ — ধারাবাহিক ক্লাস, প্র্যাকটিস ফাইল, কুইজ এবং Google
                    অ্যাকাউন্ট ভেরিফায়েড লার্নিং এক্সেস।
                  </p>
                </div>

                {/* Course Filter Controls */}
                <div className="flex items-center gap-1 self-start rounded-full border border-border bg-muted/60 p-1 lg:self-auto">
                  {(
                    [
                      { id: "all", label: "All Courses (2)" },
                      { id: "free", label: "Free Course (1)" },
                      { id: "paid", label: "Paid Live (1)" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCourseFilter(tab.id)}
                      className={`h-8 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors ${
                        courseFilter === tab.id
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {showFreeCourse && (
                  <article className="flex flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
                    <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
                      <img
                        src={QURAN_COURSE.thumbnail}
                        alt={QURAN_COURSE.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif] sm:p-8">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Free Open Course
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{QURAN_COURSE.organization.name}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {QURAN_COURSE.lessons.length}টি ধারাবাহিক ক্লাস
                          </span>
                        </div>
                        <h3 className="mt-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                          {QURAN_COURSE.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {QURAN_COURSE.englishTitle}
                        </p>

                        <ul className="mt-5 space-y-2 border-t border-border/60 pt-5 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" />
                            <span>
                              {QURAN_COURSE.lessons.length}টি ধাপে ধাপে সাজানো ক্লাস ও নন-স্কিপ
                              ভিডিও প্লেয়ার
                            </span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" />
                            <span>কোর্স শেষে ২৫ নম্বরের টাইমড MCQ মূল্যায়ন কুইজ</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" />
                            <span>সম্পূর্ণ ফ্রি — Google অ্যাকাউন্টে প্রগ্রেস সেভ হবে</span>
                          </li>
                        </ul>

                        <div className="mt-6 flex items-center gap-3.5 border-t border-border/60 pt-5">
                          <img
                            src={QURAN_COURSE.instructor.avatar}
                            alt={QURAN_COURSE.instructor.name}
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 shrink-0 rounded-full border border-border object-cover object-top"
                          />
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {QURAN_COURSE.instructor.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              সাবেক শিক্ষক, মসজিদে নববী · মদীনা
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-5">
                        <div className="text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-foreground tabular-nums">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            {QURAN_COURSE.rating}
                          </span>
                          <span className="mx-2">·</span>
                          <span>{QURAN_COURSE.enrolledCount}</span>
                          <span className="mx-2">·</span>
                          <span>{QURAN_COURSE.completedCount}</span>
                        </div>

                        <Link
                          to="/courses"
                          onClick={closeFullscreenSection}
                          className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                        >
                          কোর্স ড্যাশবোর্ডে প্রবেশ করুন
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                )}

                {showPaidCourse && (
                  <article className="flex flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
                    <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
                      <img
                        src={GRAPHIC_DESIGN_COURSE.thumbnail}
                        alt={GRAPHIC_DESIGN_COURSE.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif] sm:p-8">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Paid Live Course</span>
                          <span aria-hidden="true">·</span>
                          <span>Bismahsoft Academy</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {GRAPHIC_DESIGN_COURSE.lessons.length}+ Practical Classes
                          </span>
                        </div>
                        <h3 className="mt-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                          {GRAPHIC_DESIGN_COURSE.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {GRAPHIC_DESIGN_COURSE.tagline}
                        </p>

                        <ul className="mt-5 space-y-2 border-t border-border/60 pt-5 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" />
                            <span>
                              Photoshop, Illustrator, Midjourney, Adobe Firefly &amp; Motion
                              Workflow
                            </span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" />
                            <span>
                              Practice Files, Presets, Freelancing Roadmap &amp; Client Briefs
                            </span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" />
                            <span>
                              Google অ্যাকাউন্ট ও bKash/Nagad/Rocket/Bank পেমেন্ট ভেরিফায়েড এক্সেস
                            </span>
                          </li>
                        </ul>

                        <div className="mt-6 flex items-center gap-3.5 border-t border-border/60 pt-5">
                          <img
                            src={GRAPHIC_DESIGN_COURSE.mentor.avatar}
                            alt={GRAPHIC_DESIGN_COURSE.mentor.name}
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 shrink-0 rounded-full border border-border object-cover object-top"
                          />
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {GRAPHIC_DESIGN_COURSE.mentor.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {GRAPHIC_DESIGN_COURSE.mentor.roleTitle}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-5">
                        <div className="flex items-baseline gap-2.5 font-mono tabular-nums">
                          <span className="text-xs text-muted-foreground line-through">
                            ৳{GRAPHIC_DESIGN_COURSE.originalPriceBdt.toLocaleString("en-US")}
                          </span>
                          <span className="text-2xl font-bold text-foreground">
                            ৳{GRAPHIC_DESIGN_COURSE.priceBdt.toLocaleString("en-US")}
                          </span>
                        </div>

                        <Link
                          to="/graphic-design-course"
                          onClick={closeFullscreenSection}
                          className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                        >
                          এনরোল ও কোর্স বিস্তারিত
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                )}
              </div>

              {/* Verification & Access Assurance Strip */}
              <div className="mt-10 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-muted/35 p-6 sm:grid-cols-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-foreground">
                    01. Google Account Sign-In
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Sign in once with your Google account so all course progress, quizzes, and
                    purchases stay synced permanently.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-xs font-semibold text-foreground">
                    02. Instant Free or Verified Paid Access
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Free courses unlock immediately; paid courses unlock after Admin TrxID
                    verification inside your Account dashboard.
                  </p>
                </div>
                <div className="flex flex-col justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      03. Student Portal
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Track all enrolled courses, payment status, and downloadable receipts.
                    </p>
                  </div>
                  <Link
                    to="/account"
                    onClick={closeFullscreenSection}
                    className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-foreground underline underline-offset-4"
                  >
                    Open Student Account
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* FULL-SCREEN VIEW 2: WORKSHOPS */}
          {fullscreenSection === "workshops" && (
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
              <div className="grid grid-cols-1 items-center gap-10 border-b border-white/10 pb-12 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <p className="font-mono text-xs tracking-wider text-[#00D978]">
                    {EVENT_CONFIG.organizer} × {EVENT_CONFIG.mainSponsor} · {EVENT_CONFIG.edition}
                  </p>
                  <h2 className="mt-3 font-display text-4xl font-bold leading-[1.06] tracking-tight text-white [text-wrap:balance] sm:text-5xl lg:text-6xl">
                    {EVENT_CONFIG.eventName} — <span className="text-[#00D978]">Workshop 2027</span>
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#A1A1AA]">
                    {EVENT_CONFIG.theme} Join a focused{" "}
                    <strong className="font-semibold text-white">
                      {EVENT_CONFIG.eventFormatLabel}
                    </strong>{" "}
                    on {EVENT_CONFIG.eventVenueLabel} — designed specifically for students to master
                    Generative AI, smart prompting, Vibe Coding, and ethical study workflows.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a
                      href={EVENT_CONFIG.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-[#00D978] px-6 text-xs font-bold text-[#050505] transition-opacity hover:opacity-90"
                    >
                      Register &amp; Buy Ticket
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <Link
                      to="/workshop"
                      onClick={closeFullscreenSection}
                      className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-6 text-xs font-semibold text-white transition-colors hover:border-[#00D978]/60 hover:bg-white/10"
                    >
                      Open Full Event Page
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-4 lg:col-span-5">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0D] p-2">
                    <img
                      src={WORKSHOP_ASSETS.eventBanner}
                      alt="AI FOR STUDENTS Workshop 2027 official banner"
                      className="aspect-[3264/1446] w-full rounded-xl object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0B0F0D] p-4">
                    <img
                      src={WORKSHOP_ASSETS.logo}
                      alt="AI FOR STUDENTS logo"
                      className="h-14 w-14 shrink-0 object-contain"
                    />
                    <div>
                      <p className="font-mono text-xs text-[#00D978]">
                        {EVENT_CONFIG.eventDateLabel}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Main Speaker: Sakibul Islam Sabbir
                      </p>
                      <p className="text-xs text-[#A1A1AA]">{EVENT_CONFIG.eventVenueLabel}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Key Workshop Facts */}
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {WORKSHOP_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-[#0B0F0D] p-5"
                  >
                    <p className="font-display text-2xl font-bold text-[#00D978]">{stat.value}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{stat.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#A1A1AA]">{stat.note}</p>
                  </div>
                ))}
              </div>

              {/* 8 Core Learning Modules Grid */}
              <div className="mt-12">
                <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <p className="font-mono text-xs text-[#00D978]">Curriculum Tracks</p>
                    <h3 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
                      8 Core AI Learning Modules
                    </h3>
                  </div>
                  <p className="text-xs text-[#A1A1AA]">
                    Live demonstration + Q&amp;A + practical student frameworks
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {LEARNING_MODULES.map((mod) => (
                    <div
                      key={mod.number}
                      className="rounded-2xl border border-white/10 bg-[#0B0F0D] p-5 transition-colors hover:border-[#00D978]/40"
                    >
                      <p className="font-mono text-xs tabular-nums text-[#00D978]">{mod.number}.</p>
                      <h4 className="mt-2 font-display text-base font-bold text-white">
                        {mod.title}
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                        {mod.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FULL-SCREEN VIEW 3: BOOKS & DIGITAL LIBRARY */}
          {fullscreenSection === "books" && (
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
              <BooksShowcaseSection showStandaloneLink compactTop />
            </div>
          )}

          {/* FULL-SCREEN VIEW 4: BISMAH STANDALONE AUDIO BOOK PLAYER */}
          {fullscreenSection === "bismah" && (
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <BismahAudioPlayerApp showStandaloneLink fullHeight />
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activePath="/education" />
    </div>
  );
}
