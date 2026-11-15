import { ExternalLink, UserCheck } from "lucide-react";
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
                Learn from the Experts
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA]">
              Speaker slots shown below demonstrate the official roster layout. Confirmed educators
              and practitioners will be published ahead of {EVENT_CONFIG.edition}.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SPEAKER_SLOTS.map((speaker, idx) => (
              <article
                key={speaker.id}
                className="group overflow-hidden rounded-xl border border-white/10 bg-[#0B0F0D] transition-all duration-300 hover:-translate-y-1 hover:border-[#00D978]/50"
              >
                {/* Grayscale-to-Emerald Editorial Portrait Placeholder */}
                <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-b border-white/10 bg-[#050505]">
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

                  <div className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA]">
                    SPEAKER 0{idx + 1}
                  </div>
                  <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#00D978]">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>{speaker.status}</span>
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
                      SESSION FOCUS
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/90">
                      {speaker.topicFocus}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-[#A1A1AA]">
                    <span>Profile Link Placeholder</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#00D978]/80" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
