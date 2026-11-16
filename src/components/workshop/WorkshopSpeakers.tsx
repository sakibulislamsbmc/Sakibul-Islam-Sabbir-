import { ArrowUpRight, Mail, Mic, UserCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { EVENT_CONFIG, SPEAKER_SLOTS } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

export function WorkshopSpeakers() {
  return (
    <section id="speakers" className="scroll-mt-20 border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                <span className="h-1.5 w-1.5 bg-[#00D978]" />
                <span>005 — SPEAKERS &amp; MENTORS</span>
              </div>
              <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                Main Speaker &amp; Upcoming Guest Speakers
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA]">
              Led by Main Speaker Sakibul Islam Sabbir alongside upcoming guest speakers for{" "}
              {EVENT_CONFIG.eventDateLabel}.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SPEAKER_SLOTS.map((speaker, idx) => (
              <article
                key={speaker.id}
                className={`group overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                  speaker.isConfirmed
                    ? "border-[#00D978]/45 bg-[#0B0F0D] shadow-[0_0_32px_rgba(0,217,120,0.08)]"
                    : "border-dashed border-white/15 bg-[#0B0F0D]/80 hover:border-[#00D978]/40"
                }`}
              >
                {/* Portrait Frame */}
                <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-b border-white/10 bg-[#050505]">
                  {speaker.image ? (
                    <>
                      <img
                        src={speaker.image}
                        alt={`${speaker.name} — ${speaker.designation}`}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/30 opacity-85" />
                    </>
                  ) : (
                    <>
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-40"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 50% 35%, rgba(0,217,120,0.35), transparent 65%)",
                        }}
                      />
                      <svg
                        viewBox="0 0 160 160"
                        className="h-32 w-32 text-white/25 transition-colors duration-300 group-hover:text-[#00D978]/70"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="80" cy="54" r="24" stroke="currentColor" strokeWidth="2.5" />
                        <path
                          d="M32 134C32 107.49 53.49 86 80 86C106.51 86 128 107.49 128 134"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </>
                  )}

                  <div className="absolute left-3 top-3 rounded bg-[#050505]/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA] backdrop-blur-sm">
                    SPEAKER 0{idx + 1}
                  </div>
                  <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded bg-[#050505]/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#00D978] backdrop-blur-sm">
                    {speaker.isConfirmed ? (
                      <UserCheck className="h-3.5 w-3.5" />
                    ) : (
                      <Mic className="h-3.5 w-3.5" />
                    )}
                    <span>{speaker.roleBadge}</span>
                  </div>
                </div>

                {/* Speaker Metadata */}
                <div className="p-6">
                  <h3 className="font-['Manrope',sans-serif] text-xl font-bold text-white">
                    {speaker.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-[#00D978]">{speaker.designation}</p>
                  <p className="mt-0.5 text-xs text-[#A1A1AA]">{speaker.organization}</p>

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#A1A1AA]">
                      {speaker.isConfirmed ? "SESSION FOCUS" : "UPCOMING ANNOUNCEMENT"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/90">
                      {speaker.topicFocus}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5 text-xs">
                    {speaker.isConfirmed ? (
                      <a
                        href={EVENT_CONFIG.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-[#00D978] hover:underline"
                      >
                        <span>Attend Main Session</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <a
                        href={`mailto:${EVENT_CONFIG.officialEmail}?subject=Guest%20Speaker%20Registration%20-%20AI%20FOR%20STUDENTS%202027`}
                        className="inline-flex items-center gap-1.5 font-semibold text-[#00D978] hover:underline"
                      >
                        <span>Apply as Guest Speaker</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Open Call Notice for Guest Speakers & Sponsors */}
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-[#00D978]/30 bg-[#0B0F0D] p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00D978]">
                OPEN CALL · GUEST SPEAKERS &amp; SPONSORS
              </p>
              <p className="mt-1 text-sm text-[#A1A1AA]">
                Other guest speakers and sponsors are upcoming.{" "}
                <strong className="font-semibold text-white">
                  Registrations are currently being taken for guest speakers
                </strong>{" "}
                and{" "}
                <strong className="font-semibold text-white">
                  sponsors are currently being taken
                </strong>{" "}
                for Workshop 2027.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <a
                href={`mailto:${EVENT_CONFIG.officialEmail}?subject=Guest%20Speaker%20Registration%20-%20AI%20FOR%20STUDENTS%202027`}
                className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-[#00D978] px-4 text-xs font-extrabold uppercase tracking-wider text-[#050505] transition-colors hover:bg-[#00D978]/90"
              >
                <Mail className="h-3.5 w-3.5" />
                Register as Guest Speaker
              </a>
              <Link
                to="/contact"
                className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-white/15 bg-[#050505] px-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-[#00D978]/50 hover:text-[#00D978]"
              >
                Contact Organizer
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
