import { ArrowUpRight, Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { EVENT_CONFIG } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

interface WorkshopRegistrationProps {
  onOpenRegister: () => void;
}

export function WorkshopRegistration({ onOpenRegister }: WorkshopRegistrationProps) {
  const details = [
    { icon: Calendar, label: "Event Date", value: EVENT_CONFIG.eventDateLabel },
    { icon: MapPin, label: "Event Venue", value: EVENT_CONFIG.eventVenueLabel },
    { icon: Ticket, label: "Participation Fee", value: EVENT_CONFIG.registrationFeeLabel },
    { icon: Clock, label: "Registration Deadline", value: EVENT_CONFIG.registrationDeadlineLabel },
  ];

  return (
    <section
      id="register"
      className="relative scroll-mt-20 overflow-hidden border-b border-white/10 bg-[#0B0F0D]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D978]/12 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="rounded-2xl border border-[#00D978]/30 bg-[#050505]/90 p-6 sm:p-10 lg:p-14">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                  <span className="h-1.5 w-1.5 bg-[#00D978]" />
                  <span>STUDENT ADMISSIONS &amp; REGISTRATION</span>
                </div>
                <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold leading-[1.08] tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                  BE READY FOR THE AI-POWERED FUTURE.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
                  Reserve your interest for {EVENT_CONFIG.eventName} — {EVENT_CONFIG.edition},
                  organized by {EVENT_CONFIG.organizer} with Main Sponsor {EVENT_CONFIG.mainSponsor}
                  . Official registration opens when venue and date details are confirmed.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-[#00D978] px-7 text-xs font-extrabold uppercase tracking-[0.16em] text-[#050505] transition-all duration-200 hover:bg-[#00D978]/90 hover:shadow-[0_0_32px_rgba(0,217,120,0.4)]"
                  >
                    REGISTER NOW
                    <ArrowUpRight className="h-4 w-4" />
                  </button>

                  <a
                    href={`mailto:${EVENT_CONFIG.officialEmail}?subject=AI%20FOR%20STUDENTS%20Workshop%202027%20Inquiry`}
                    className="inline-flex h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-white/15 bg-[#0B0F0D] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#00D978]/50 hover:text-[#00D978]"
                  >
                    CONTACT ORGANIZER
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-5">
                {details.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-lg border border-white/10 bg-[#0B0F0D] p-4"
                    >
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#00D978]">
                        <Icon className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
