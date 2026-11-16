import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { EVENT_CONFIG, GUEST_SLOTS } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

export function WorkshopGuests() {
  return (
    <section className="border-b border-white/10 bg-[#0B0F0D]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                <span className="h-1.5 w-1.5 bg-[#00D978]" />
                <span>006 — UPCOMING SPONSORS &amp; GUEST SPEAKERS</span>
              </div>
              <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                Upcoming Guests &amp; Sponsors
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA]">
              Alongside {EVENT_CONFIG.organizer} and Main Sponsor {EVENT_CONFIG.mainSponsor},
              additional sponsors and guest speakers are upcoming and open for onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {GUEST_SLOTS.map((guest, index) => (
              <article
                key={guest.id}
                className="flex flex-col justify-between rounded-xl border border-dashed border-white/15 bg-[#050505] p-6 transition-colors duration-200 hover:border-[#00D978]/45"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00D978]">
                      {guest.role}
                    </span>
                    <Sparkles className="h-4 w-4 text-[#00D978]/70" />
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0B0F0D] font-mono text-sm font-bold text-[#A1A1AA]">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="font-['Manrope',sans-serif] text-lg font-bold text-white">
                        {guest.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                        {guest.affiliation}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-6 border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#00D978]">
                  UPCOMING · APPLICATIONS OPEN
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#050505] px-5 py-4 text-xs text-[#A1A1AA]">
            <p>
              <strong className="font-semibold text-white">Sponsors are being taken</strong> and{" "}
              <strong className="font-semibold text-white">
                registrations are being taken for guest speakers
              </strong>{" "}
              ahead of the 9 December live session.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${EVENT_CONFIG.officialEmail}?subject=Sponsor%20%2F%20Guest%20Speaker%20Inquiry%20-%20Workshop%202027`}
                className="inline-flex items-center gap-1 font-semibold text-[#00D978] hover:underline"
              >
                Submit Inquiry
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <Link to="/contact" className="font-semibold text-white hover:text-[#00D978]">
                Contact Page →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
