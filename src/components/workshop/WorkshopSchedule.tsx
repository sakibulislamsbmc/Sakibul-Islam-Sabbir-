import { useState } from "react";
import { Calendar, ChevronDown, Clock, Info, Mic } from "lucide-react";
import { LIVE_NIGHT_SESSIONS, ONE_NIGHT_SCHEDULE_META } from "@/data/workshop-data";
import { GoogleMeetFingertip } from "./GoogleMeetFingertip";
import { Reveal } from "./Reveal";

export function WorkshopSchedule() {
  const [expandedSessionId, setExpandedSessionId] = useState<string>(
    LIVE_NIGHT_SESSIONS[0]?.id ?? "",
  );

  return (
    <section id="schedule" className="scroll-mt-20 border-b border-white/10 bg-[#0B0F0D]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="mb-8 flex flex-col justify-between gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                <span className="h-1.5 w-1.5 bg-[#00D978]" />
                <span>008 — ONE-NIGHT LIVE SCHEDULE</span>
              </div>
              <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                9 December · 9:30 PM Night.
              </h2>
              <p className="mt-2 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[#00D978]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{ONE_NIGHT_SCHEDULE_META.dateLabel}</span>
              </p>
            </div>

            <GoogleMeetFingertip compact />
          </div>

          {/* Format Clarification Card explaining One-Night Online Live Meeting */}
          <div className="mb-8 flex flex-col gap-3 rounded-xl border border-[#00D978]/30 bg-[#050505] p-5 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#00D978]/30 bg-[#00D978]/10 text-[#00D978]">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00D978]">
                {ONE_NIGHT_SCHEDULE_META.platform}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#A1A1AA]">
                {ONE_NIGHT_SCHEDULE_META.clarificationNote}
              </p>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#A1A1AA]">
            <span className="font-mono text-[#00D978]">
              ONE-NIGHT LIVE MEETING AGENDA · GOOGLE MEET
            </span>
            <span className="font-mono text-[11px]">
              {LIVE_NIGHT_SESSIONS.length} SEGMENTS · CLICK ANY ROW FOR DETAILS
            </span>
          </div>

          <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-[#050505]">
            {LIVE_NIGHT_SESSIONS.map((session, idx) => {
              const isOpen = expandedSessionId === session.id;
              return (
                <div key={session.id} className="transition-colors hover:bg-[#0B0F0D]/70">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setExpandedSessionId((prev) => (prev === session.id ? "" : session.id))
                    }
                    className="flex w-full cursor-pointer flex-col gap-3 p-5 text-left sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                      <div className="flex items-center gap-2 font-mono text-xs text-[#00D978] tabular-nums sm:w-36 sm:shrink-0">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{session.time}</span>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1AA]">
                          0{idx + 1} · {session.category}
                        </p>
                        <h3 className="mt-1 font-['Manrope',sans-serif] text-base font-bold text-white sm:text-lg">
                          {session.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="font-mono text-[11px] text-[#A1A1AA]">
                        {isOpen ? "Hide details" : "Session details"}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#00D978] transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/10 bg-[#0B0F0D]/80 px-5 py-4 sm:px-6 sm:pl-[192px]">
                      <p className="text-sm leading-relaxed text-[#A1A1AA]">
                        {session.description}
                      </p>
                      <p className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-white/90">
                        <Mic className="h-3.5 w-3.5 text-[#00D978]" />
                        <span>Facilitator: {session.speaker}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
