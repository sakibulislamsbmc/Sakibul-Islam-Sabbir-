import { ArrowDownRight, ArrowUpRight, Calendar, MapPin, ShieldCheck } from "lucide-react";
import { EVENT_CONFIG, WORKSHOP_ASSETS } from "@/data/workshop-data";

interface WorkshopHeroProps {
  onOpenRegister: () => void;
}

export function WorkshopHero({ onOpenRegister }: WorkshopHeroProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="home" className="relative overflow-hidden border-b border-white/10 bg-[#050505]">
      {/* Subtle Architectural Grid + Emerald Radial Glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute -left-24 top-12 h-[420px] w-[420px] rounded-full bg-[#00D978]/12 blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-[440px] w-[440px] rounded-full bg-[#009B58]/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl border-x border-white/10 px-4 py-14 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Event Typography & Primary Actions */}
          <div className="lg:col-span-7">
            <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium tracking-[0.18em] text-[#A1A1AA] uppercase">
              <span className="h-1.5 w-1.5 bg-[#00D978]" />
              <span className="text-[#00D978]">{EVENT_CONFIG.edition}</span>
              <span className="text-white/25">/</span>
              <span>{EVENT_CONFIG.category}</span>
            </div>

            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#00D978]">
              {EVENT_CONFIG.eventName} · {EVENT_CONFIG.targetAudience}
            </p>

            <h1 className="font-['Manrope',sans-serif] text-4xl font-extrabold leading-[1.03] tracking-tight text-white [text-wrap:balance] sm:text-5xl lg:text-6xl">
              THE FUTURE BELONGS TO{" "}
              <span className="bg-gradient-to-r from-[#00D978] via-[#4FF4AC] to-[#009B58] bg-clip-text text-transparent">
                AI-READY STUDENTS.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#A1A1AA] sm:text-lg">
              {EVENT_CONFIG.theme} Join a hands-on student-focused Generative AI workshop designed
              to help learners understand modern AI tools, master smart prompting, study more
              effectively, create smarter workflows, and build essential future skills responsibly.
            </p>

            {/* Event Metadata Strip (Zero-Pill Inline Layout) */}
            <div className="mt-8 grid grid-cols-1 gap-3 border-y border-white/10 py-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#00D978]" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1AA]">
                    Workshop Date
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {EVENT_CONFIG.eventDateLabel}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00D978]" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1AA]">
                    Location & Venue
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {EVENT_CONFIG.eventVenueLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Dual CTA Controls */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onOpenRegister}
                className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-[#00D978] px-6 text-xs font-extrabold uppercase tracking-[0.16em] text-[#050505] transition-all duration-200 hover:bg-[#00D978]/90 hover:shadow-[0_0_32px_rgba(0,217,120,0.4)]"
              >
                REGISTER NOW
                <ArrowUpRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("about")}
                className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-white/15 bg-[#0B0F0D] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:border-[#00D978]/60 hover:text-[#00D978]"
              >
                EXPLORE WORKSHOP
                <ArrowDownRight className="h-4 w-4" />
              </button>
            </div>

            {/* Organizer & Sponsor Inline Attribution */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#A1A1AA]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00D978]" />
                Organized by{" "}
                <strong className="font-semibold text-white">{EVENT_CONFIG.organizer}</strong>
              </span>
              <span className="text-white/20">·</span>
              <span>
                Main Sponsor{" "}
                <strong className="font-semibold text-white">{EVENT_CONFIG.mainSponsor}</strong>
              </span>
            </div>
          </div>

          {/* Right Column: Official Logo Frame + 3D Neural Visual */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0B0F0D] p-4 sm:p-5">
              {/* Top Architectural Frame Header */}
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1AA]">
                <span>AI FOR STUDENTS · 2027</span>
                <span className="text-[#00D978]">GENERATIVE AI</span>
              </div>

              {/* Neural Visual Canvas */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10 bg-[#050505]">
                <img
                  src={WORKSHOP_ASSETS.heroVisual}
                  alt="Futuristic emerald optical neural network prism visualization"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03] motion-reduce:transform-none"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />

                {/* Floating Official Logo Lockup inside Dark Frame */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3.5 rounded-lg border border-white/10 bg-[#050505]/90 p-3 backdrop-blur-md">
                  <img
                    src={WORKSHOP_ASSETS.logo}
                    alt="Official AI FOR STUDENTS Workshop 2027 logo"
                    className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-['Manrope',sans-serif] text-xs font-extrabold uppercase tracking-wider text-white">
                      {EVENT_CONFIG.organizer} × {EVENT_CONFIG.mainSponsor}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#A1A1AA]">
                      {EVENT_CONFIG.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
