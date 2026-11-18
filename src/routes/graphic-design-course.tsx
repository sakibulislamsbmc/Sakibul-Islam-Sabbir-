import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";
import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { GraphicDesignCoursePageContent } from "@/components/courses/GraphicDesignCoursePageContent";

export const Route = createFileRoute("/graphic-design-course")({
  head: () => ({
    meta: [
      {
        title: "Advanced Graphic Design with AI Tools Live Course — Sakibul Islam Sabbir",
      },
      {
        name: "description",
        content:
          "Level up your creativity. Master modern design with 20+ practical classes covering Adobe Photoshop, Illustrator, Midjourney, Adobe Firefly, Freelancing & Motion Graphics.",
      },
      {
        property: "og:title",
        content: "Advanced Graphic Design with AI Tools Live Course",
      },
      {
        property: "og:description",
        content:
          "Official Live Course Masterclass by Sakibul Islam Sabbir. Enroll with Google account verification.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GraphicDesignCoursePage,
});

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Me", href: "/about-me" },
  { label: "Thankful", href: "/thankful" },
  { label: "Contact", href: "/contact" },
];

const PROFILE_THUMB =
  "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png";

function GraphicDesignCoursePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Ambient architectural background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[560px] w-[560px] rounded-full bg-foreground/[0.04] blur-3xl" />
        <div className="absolute right-1/5 top-1/3 h-[500px] w-[500px] rounded-full bg-foreground/[0.03] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
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
              to="/projects"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground shadow-sm transition-all duration-200 hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Projects
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

        <MobileHeaderMenu open={open} activePath="/projects" onClose={() => setOpen(false)} />
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-24 sm:px-6 md:pt-28 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/projects"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background/80 px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Projects
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/courses"
              className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border border-border bg-background/80 px-4 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              কুরআন কোর্স দেখুন
            </Link>
            <Link
              to="/account"
              className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border border-border bg-background/80 px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              My Purchases &amp; Account
            </Link>
          </div>
        </div>

        <GraphicDesignCoursePageContent />
      </main>

      <MobileBottomNav activePath="/projects" />
    </div>
  );
}
