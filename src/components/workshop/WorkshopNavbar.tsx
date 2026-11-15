import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Menu, X } from "lucide-react";
import { EVENT_CONFIG, WORKSHOP_ASSETS, WORKSHOP_NAV_LINKS } from "@/data/workshop-data";

interface WorkshopNavbarProps {
  onOpenRegister: () => void;
}

export function WorkshopNavbar({ onOpenRegister }: WorkshopNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAnchorClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 border-x border-white/10 px-4 sm:px-6 lg:px-8">
        {/* Left: Back to Portfolio & Official Workshop Logo */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            to="/projects"
            title="Back to Projects"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-white/10 bg-[#0B0F0D] px-2.5 text-[11px] font-medium text-[#A1A1AA] transition-colors hover:border-[#00D978]/50 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#00D978]" />
            <span className="hidden sm:inline">Projects</span>
          </Link>

          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleAnchorClick("#home");
            }}
            className="flex shrink-0 items-center gap-2.5 whitespace-nowrap focus:outline-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-[#0B0F0D] p-1">
              <img
                src={WORKSHOP_ASSETS.logo}
                alt={`${EVENT_CONFIG.eventName} ${EVENT_CONFIG.edition} official logo`}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="hidden leading-none xl:block">
              <p className="font-['Manrope',sans-serif] text-xs font-extrabold tracking-wide text-white">
                {EVENT_CONFIG.eventName}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-[#00D978]">
                {EVENT_CONFIG.edition}
              </p>
            </div>
          </a>
        </div>

        {/* Center: Smooth Scroll Navigation */}
        <nav aria-label="Workshop sections" className="hidden items-center gap-5 lg:flex xl:gap-7">
          {WORKSHOP_NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleAnchorClick(item.href);
              }}
              className="shrink-0 whitespace-nowrap text-xs font-medium tracking-wide text-[#A1A1AA] transition-colors duration-150 hover:text-[#00D978]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: Primary Register CTA + Mobile Hamburger */}
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenRegister}
            className="hidden h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-[#00D978] px-4 text-xs font-bold tracking-wider text-[#050505] transition-all duration-200 hover:bg-[#00D978]/90 hover:shadow-[0_0_24px_rgba(0,217,120,0.35)] sm:inline-flex"
          >
            REGISTER NOW
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close workshop menu" : "Open workshop menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-[#0B0F0D] text-white transition-colors hover:border-[#00D978]/50 lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Hamburger Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#050505]/98 px-4 py-5 backdrop-blur-xl lg:hidden">
          <nav aria-label="Mobile workshop menu" className="mx-auto flex max-w-7xl flex-col gap-1">
            {WORKSHOP_NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleAnchorClick(item.href);
                }}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2.5 text-sm font-medium text-[#A1A1AA] transition-colors hover:border-white/10 hover:bg-[#0B0F0D] hover:text-[#00D978]"
              >
                <span>{item.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
              </a>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenRegister();
                }}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#00D978] px-4 text-xs font-bold tracking-wider text-[#050505]"
              >
                REGISTER NOW
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <Link
                to="/projects"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-[#0B0F0D] px-4 text-xs font-medium text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#00D978]" />
                Return to Projects Portfolio
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
