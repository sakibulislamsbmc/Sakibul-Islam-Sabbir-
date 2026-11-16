import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Mail, Ticket } from "lucide-react";
import { EVENT_CONFIG, WORKSHOP_ASSETS, WORKSHOP_NAV_LINKS } from "@/data/workshop-data";

export function WorkshopFooter() {
  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0B0F0D] p-1.5">
                <img
                  src={WORKSHOP_ASSETS.logo}
                  alt="AI FOR STUDENTS Workshop 2027 Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="font-['Manrope',sans-serif] text-lg font-extrabold tracking-tight text-white">
                  {EVENT_CONFIG.eventName}
                </p>
                <p className="font-mono text-xs tracking-[0.2em] text-[#00D978]">
                  {EVENT_CONFIG.edition}
                </p>
              </div>
            </div>

            {/* Organizer & Main Sponsor Logos */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex h-12 items-center justify-center rounded-md bg-white px-3 py-1.5">
                <img
                  src={WORKSHOP_ASSETS.bismahsoftLogo}
                  alt="Bismahsoft Ltd Logo"
                  className="h-full w-auto max-w-[140px] object-contain"
                />
              </div>
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-white/15 bg-[#083A18]">
                <img
                  src={WORKSHOP_ASSETS.neerFashionLogo}
                  alt="Neer Fashion Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="mt-5 space-y-1.5 text-xs leading-relaxed text-[#A1A1AA]">
              <p>
                <strong className="text-white">Organized by:</strong> {EVENT_CONFIG.organizer}
              </p>
              <p className="italic text-[#A1A1AA]">&ldquo;{EVENT_CONFIG.tagline}&rdquo;</p>
              <p>
                <strong className="text-white">Main Sponsor:</strong> {EVENT_CONFIG.mainSponsor}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00D978]">
              QUICK LINKS
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-[#A1A1AA]">
              {WORKSHOP_NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(item.href);
                    }}
                    className="transition-colors hover:text-[#00D978]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tickets, Contact & Return */}
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00D978]">
              TICKETS &amp; INQUIRIES
            </p>
            <div className="mt-4 space-y-3 text-sm text-[#A1A1AA]">
              <a
                href={EVENT_CONFIG.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00D978] px-4 text-xs font-extrabold uppercase tracking-wider text-[#050505] transition-colors hover:bg-[#00D978]/90"
              >
                <Ticket className="h-3.5 w-3.5" />
                <span>Buy Ticket on SupportKori</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>

              <a
                href={`mailto:${EVENT_CONFIG.officialEmail}`}
                className="flex items-center gap-2 text-white transition-colors hover:text-[#00D978]"
              >
                <Mail className="h-4 w-4 text-[#00D978]" />
                <span>{EVENT_CONFIG.officialEmail}</span>
              </a>

              <p className="text-xs leading-relaxed text-[#A1A1AA]">
                {EVENT_CONFIG.eventDateLabel} · {EVENT_CONFIG.eventVenueLabel}. Sponsors &amp; guest
                speaker registrations are currently open.
              </p>

              <div className="pt-1">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#0B0F0D] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:border-[#00D978]/50 hover:text-[#00D978]"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-[#00D978]" />
                  <span>Back to Projects Showcase</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs text-[#A1A1AA] sm:flex-row sm:items-center">
          <p>&copy; 2027 AI FOR STUDENTS Workshop · Organized by Bismahsoft Ltd.</p>
          <p className="font-mono text-[11px] text-[#A1A1AA]">
            Main Sponsor: {EVENT_CONFIG.mainSponsor} · Google Meet Live · 9 Dec 9:30 PM
          </p>
        </div>
      </div>
    </footer>
  );
}
