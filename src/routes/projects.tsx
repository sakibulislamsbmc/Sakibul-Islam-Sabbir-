import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  ExternalLink,
  Globe,
  Layout,
  Menu,
  Smartphone,
  X,
} from "lucide-react";
import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Sakibul Islam" },
      {
        name: "description",
        content:
          "Client website development and Android application engineering showcase by Sakibul Islam.",
      },
      { property: "og:title", content: "Projects — Sakibul Islam" },
      {
        property: "og:description",
        content:
          "Explore custom web platforms and native Android applications built for clients worldwide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
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

export type ProjectShowcaseItem = {
  id: string;
  code: string;
  name: string;
  clientType: string;
  category: "website" | "android";
  stackSummary: string;
  summary: string;
  highlights: string[];
  image: string;
  previewDomainOrPackage: string;
  year: string;
};

const WEBSITE_PROJECTS: ProjectShowcaseItem[] = [
  {
    id: "web-1",
    code: "01",
    name: "Project Name 01 — E-Commerce & Brand Storefront",
    clientType: "Retail & D2C Client",
    category: "website",
    stackSummary: "Next.js · TypeScript · Tailwind CSS · Stripe & SSLCommerz",
    summary:
      "Full-stack custom e-commerce platform with high-speed product filtering, instant cart checkout, automated order invoicing, and real-time inventory management.",
    highlights: [
      "Sub-second page transitions with SSR & edge caching",
      "Automated PDF invoice generation & order tracking dashboard",
      "Responsive glassmorphic product showcase optimized for mobile conversions",
    ],
    image: PLACEHOLDER_IMAGES[0],
    previewDomainOrPackage: "client-storefront.web.app",
    year: "2026",
  },
  {
    id: "web-2",
    code: "02",
    name: "Project Name 02 — EdTech Learning & Batch Portal",
    clientType: "Educational Institute",
    category: "website",
    stackSummary: "React · Node.js · PostgreSQL · Automated Ticket & Email Engine",
    summary:
      "Scalable student enrollment and course management portal supporting concurrent batch registrations, automated PDF admit cards, and student progress tracking.",
    highlights: [
      "Concurrent batch registration system with instant email delivery",
      "Role-based instructor and student resource dashboards",
      "Interactive curriculum modules and certificate verification",
    ],
    image: PLACEHOLDER_IMAGES[1],
    previewDomainOrPackage: "edtech-portal.web.app",
    year: "2026",
  },
  {
    id: "web-3",
    code: "03",
    name: "Project Name 03 — SaaS Workflow & AI Automation Hub",
    clientType: "Technology Startup",
    category: "website",
    stackSummary: "Next.js · Python API · REST Webhooks · Cloud Architecture",
    summary:
      "Enterprise web application automating client onboarding, document processing, and multi-channel notifications with clean analytics reporting.",
    highlights: [
      "End-to-end automated workflow pipelines reducing manual tasks by 70%",
      "Secure API gateway with role-based access control",
      "Real-time activity logs and exportable client reports",
    ],
    image: PLACEHOLDER_IMAGES[2],
    previewDomainOrPackage: "automation-hub.web.app",
    year: "2025",
  },
  {
    id: "web-4",
    code: "04",
    name: "Project Name 04 — Creative Studio & Media Agency",
    clientType: "Digital Production Agency",
    category: "website",
    stackSummary: "React · TanStack Start · Tailwind CSS · Custom Media Player",
    summary:
      "High-retention portfolio and client booking platform built for a creative production studio with native showreel playback and instant brief submission.",
    highlights: [
      "Custom native-style video showcase with zero third-party UI clutter",
      "Direct WhatsApp & email project brief generator",
      "Editorial typography and smooth compositor-driven transitions",
    ],
    image: PLACEHOLDER_IMAGES[3],
    previewDomainOrPackage: "creative-agency.web.app",
    year: "2025",
  },
  {
    id: "web-5",
    code: "05",
    name: "Project Name 05 — Corporate FinTech & Advisory",
    clientType: "Financial Consultancy",
    category: "website",
    stackSummary: "TypeScript · Laravel · MySQL · Security-Hardened Architecture",
    summary:
      "Security-first corporate web portal featuring encrypted client document exchange, appointment scheduling, and interactive financial calculators.",
    highlights: [
      "Hardened authentication and encrypted document vault",
      "Interactive ROI and project budget estimation tools",
      "WCAG AA accessible typography and multi-device responsiveness",
    ],
    image: PLACEHOLDER_IMAGES[0],
    previewDomainOrPackage: "advisory-portal.web.app",
    year: "2025",
  },
  {
    id: "web-6",
    code: "06",
    name: "Project Name 06 — Healthcare & Clinic Booking System",
    clientType: "Medical & Diagnostic Center",
    category: "website",
    stackSummary: "Next.js · Prisma · Tailwind CSS · SMS & WhatsApp Alerts",
    summary:
      "Patient-friendly appointment scheduling and digital prescription portal allowing patients to book consultations and download lab reports securely.",
    highlights: [
      "One-minute doctor slot booking with automated WhatsApp reminders",
      "Digital prescription & diagnostic PDF report portal",
      "Clean, high-contrast interface designed for all age groups",
    ],
    image: PLACEHOLDER_IMAGES[1],
    previewDomainOrPackage: "clinic-booking.web.app",
    year: "2025",
  },
];

const ANDROID_PROJECTS: ProjectShowcaseItem[] = [
  {
    id: "android-1",
    code: "01",
    name: "Project Name 01 — Smart Task & Habit Companion",
    clientType: "Productivity Android App",
    category: "android",
    stackSummary: "Android · Kotlin · Jetpack Compose · Room Offline DB",
    summary:
      "Native Android application designed for distraction-free daily planning, offline-first task tracking, and customizable routine reminders.",
    highlights: [
      "100% offline-capable local database with instant cloud sync",
      "Material You dynamic theming & smooth 120Hz animations",
      "Home-screen interactive widgets and smart notification channels",
    ],
    image: PLACEHOLDER_IMAGES[2],
    previewDomainOrPackage: "com.sakibulislam.taskcompanion",
    year: "2026",
  },
  {
    id: "android-2",
    code: "02",
    name: "Project Name 02 — Client Order & Delivery Tracker",
    clientType: "Logistics & Commerce App",
    category: "android",
    stackSummary: "Android · Flutter · Firebase Realtime · Push Notifications",
    summary:
      "Dedicated Android application for merchants and customers to track live order statuses, manage dispatches, and receive instant push alerts.",
    highlights: [
      "Real-time delivery milestone updates & QR code parcel scanning",
      "Lightweight APK optimized for low-bandwidth mobile networks",
      "Integrated one-tap customer support via WhatsApp & call",
    ],
    image: PLACEHOLDER_IMAGES[3],
    previewDomainOrPackage: "com.sakibulislam.deliverytracker",
    year: "2026",
  },
  {
    id: "android-3",
    code: "03",
    name: "Project Name 03 — Student Learning & Quiz App",
    clientType: "EdTech Mobile Platform",
    category: "android",
    stackSummary: "Android · Kotlin · Retrofit · ExoPlayer Native Video",
    summary:
      "Mobile learning companion app enabling students to stream course lessons, practice interactive timed quizzes, and download study notes offline.",
    highlights: [
      "Custom native video player with offline lesson caching",
      "Timed MCQ practice engine with instant explanation breakdowns",
      "Detailed performance analytics and batch leaderboard",
    ],
    image: PLACEHOLDER_IMAGES[0],
    previewDomainOrPackage: "com.sakibulislam.edtechmobile",
    year: "2025",
  },
  {
    id: "android-4",
    code: "04",
    name: "Project Name 04 — Personal Finance & Expense Ledger",
    clientType: "FinTech Utility App",
    category: "android",
    stackSummary: "Android · Jetpack Compose · Biometric Auth · CSV/PDF Export",
    summary:
      "Secure Android expense manager with fingerprint lock, category-wise budget alerts, and one-tap monthly PDF statement exports.",
    highlights: [
      "Biometric fingerprint authentication keeping financial data private",
      "Visual monthly cash-flow breakdowns and instant search",
      "One-click PDF & CSV ledger export for accounting",
    ],
    image: PLACEHOLDER_IMAGES[1],
    previewDomainOrPackage: "com.sakibulislam.expenseledger",
    year: "2025",
  },
];

function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "website" | "android">("all");
  const [selectedProject, setSelectedProject] = useState<ProjectShowcaseItem | null>(null);

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Ambient architectural background glow to accentuate transparent glass containers */}
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
              const isActive = item.label === "Projects";
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
              Build With Us
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

        <MobileHeaderMenu open={open} activePath="/projects" onClose={() => setOpen(false)} />
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-28 sm:px-6 md:pt-36 lg:px-8">
        {/* Glassmorphic Projects Hero Header */}
        <section className="mb-12 md:mb-16">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/45 p-6 shadow-xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl sm:p-10 lg:p-12">
            <div className="max-w-3xl">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Projects · Web & Mobile Engineering
              </p>
              <h1 className="mb-5 font-display text-4xl font-bold leading-[1.08] tracking-tight [text-wrap:balance] sm:text-5xl lg:text-6xl">
                Websites & Android apps{" "}
                <span className="text-muted-foreground/80">built to scale.</span>
              </h1>
              <p className="max-w-2xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
                A dedicated showcase of custom full-stack websites and native Android applications
                engineered for clients—combining fast performance, resilient architecture, and
                intuitive interfaces.
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
                  All Projects (10)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("website")}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeTab === "website"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  01. Website Development (6)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("android")}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                    activeTab === "android"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/40 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  02. Android App Development (4)
                </button>
              </div>

              <span className="text-xs text-muted-foreground">
                Click any project card to view full technical breakdown
              </span>
            </div>
          </div>
        </section>

        {/* Master Glassmorphic Showcase Container */}
        <div className="space-y-20 rounded-3xl border border-border/80 bg-background/30 p-4 shadow-2xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl sm:p-8 lg:p-10">
          {/* PART 1: WEBSITE DEVELOPMENT SHOWCASE */}
          {(activeTab === "all" || activeTab === "website") && (
            <section id="website-development" className="scroll-mt-24">
              <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end md:mb-10">
                <div>
                  <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    01. Web Engineering Showcase
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Website <span className="text-muted-foreground/75">Development.</span>
                  </h2>
                </div>
                <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                  Custom client websites, SaaS platforms, and e-commerce storefronts engineered for
                  speed, security, and conversion.
                </p>
              </div>

              {/* 3-Per-Row Desktop Grid for Client Websites */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {WEBSITE_PROJECTS.map((project) => (
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
                      {/* Minimal Browser Top Bar */}
                      <div className="mb-1.5 flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3 py-1.5 text-[11px] text-muted-foreground">
                        <span className="truncate font-mono">{project.previewDomainOrPackage}</span>
                        <Layout className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      </div>

                      {/* Rounded-Rectangle Screenshot Preview */}
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

                    {/* Transparent Glass Details Container Below Image */}
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

          {/* PART 2: ANDROID APP DEVELOPMENT SHOWCASE */}
          {(activeTab === "all" || activeTab === "android") && (
            <section id="android-app-development" className="scroll-mt-24">
              <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end md:mb-10">
                <div>
                  <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    02. Mobile Engineering Showcase
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Android App <span className="text-muted-foreground/75">Development.</span>
                  </h2>
                </div>
                <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                  Native and cross-platform Android applications crafted with smooth 120Hz
                  responsiveness, offline reliability, and modern mobile UX.
                </p>
              </div>

              {/* 4-Per-Row Desktop Grid for Android Apps */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {ANDROID_PROJECTS.map((app) => (
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
                    {/* Transparent Glass Android Phone Frame Container */}
                    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/25 p-2 backdrop-blur-xl">
                      {/* Phone Top Speaker/Camera Notch Bar */}
                      <div className="mb-1.5 flex items-center justify-between px-2 text-[10px] font-mono text-muted-foreground">
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

                    {/* Transparent Glass Details Container Below App Preview */}
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

      {/* Case Study & Technical Breakdown Modal */}
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activePath="/projects" />
    </div>
  );
}
