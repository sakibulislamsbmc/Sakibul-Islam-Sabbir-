import { Award, PlusCircle } from "lucide-react";
import { EVENT_CONFIG, WORKSHOP_ASSETS } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

export function WorkshopSponsors() {
  return (
    <section id="sponsors" className="scroll-mt-20 border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                <span className="h-1.5 w-1.5 bg-[#00D978]" />
                <span>001 — OUR SPONSORS</span>
              </div>
              <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                Proud Sponsors
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA]">
              Backing student-first Generative AI education and practical skill development across
              Workshop 2027.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Main Sponsor Feature Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#00D978]/35 bg-gradient-to-br from-[#0B0F0D] via-[#050505] to-[#009B58]/10 p-6 sm:p-8 lg:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00D978]">
                    <Award className="h-4 w-4" />
                    MAIN SPONSOR
                  </span>
                  <h3 className="mt-3 font-['Manrope',sans-serif] text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {EVENT_CONFIG.mainSponsor}
                  </h3>
                </div>

                <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-white/10 bg-[#050505] p-2">
                  <img
                    src={WORKSHOP_ASSETS.logo}
                    alt="AI FOR STUDENTS and Neer Fashion official lockup"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
                As the Main Sponsor of {EVENT_CONFIG.eventName} — {EVENT_CONFIG.edition}, Neer
                Fashion helps bring hands-on AI education, structured learning tracks, and verified
                student guidance together under one roof.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-[#A1A1AA]">
                <span>Event Category: {EVENT_CONFIG.category}</span>
                <span className="font-mono text-[#00D978]">OFFICIAL TITLE SUPPORT</span>
              </div>
            </div>

            {/* Expandable Sponsor Tier Structure */}
            <div className="flex flex-col justify-between gap-4 lg:col-span-5">
              <div className="rounded-xl border border-white/10 bg-[#0B0F0D] p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00D978]">
                  ORGANIZING BRAND
                </p>
                <h3 className="mt-2 font-['Manrope',sans-serif] text-2xl font-bold text-white">
                  {EVENT_CONFIG.organizer}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
                  &ldquo;{EVENT_CONFIG.tagline}&rdquo;
                </p>
              </div>

              <div className="flex flex-1 flex-col justify-between rounded-xl border border-dashed border-white/15 bg-[#0B0F0D]/60 p-6">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#A1A1AA]">
                    <PlusCircle className="h-4 w-4 text-[#00D978]" />
                    <span>SPONSORSHIP TIERS OPEN</span>
                  </div>
                  <h4 className="mt-2 font-['Manrope',sans-serif] text-lg font-bold text-white">
                    Additional Sponsors — Workshop 2027
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                    Gold, Silver, and Community Sponsor slots are structured for upcoming partner
                    announcements with {EVENT_CONFIG.organizer}.
                  </p>
                </div>

                <a
                  href={`mailto:${EVENT_CONFIG.officialEmail}?subject=Workshop%202027%20Sponsorship%20Inquiry`}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#00D978] hover:underline"
                >
                  Connect for Sponsorship Opportunities →
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
