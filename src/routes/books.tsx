import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";

import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { BooksShowcaseSection } from "@/components/books/BooksShowcaseSection";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "Published Works & Books — Sakibul Islam Sabbir" },
      {
        name: "description",
        content:
          "Read free ebooks directly inside the website or order paid PDF books by Sakibul Islam Sabbir on Generative AI, Creative Design, and Digital Literacy.",
      },
      { property: "og:title", content: "Published Works & Books — Sakibul Islam Sabbir" },
      {
        property: "og:description",
        content:
          "Explore published books and interactive in-site PDF editions by Sakibul Islam Sabbir.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: BooksPage,
});

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Me", href: "/about-me" },
  { label: "Thankful", href: "/thankful" },
  { label: "Contact", href: "/contact" },
];

const AVATAR_IMAGE =
  "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png";

function BooksPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#fafafa] font-sans text-foreground antialiased dark:bg-background">
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
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
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
                src={AVATAR_IMAGE}
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

      {/* Main Books Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-24 sm:px-6 md:pt-32 lg:px-8">
        <div className="mb-6">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 transition-colors hover:text-neutral-950 dark:text-muted-foreground dark:hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Projects</span>
          </Link>
        </div>

        <BooksShowcaseSection />
      </main>

      <MobileBottomNav activePath="/projects" />
    </div>
  );
}
