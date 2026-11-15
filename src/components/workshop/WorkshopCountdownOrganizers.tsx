import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { EVENT_CONFIG, WORKSHOP_ASSETS } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

interface TimeParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

function calculateTimeParts(targetIso: string | null): TimeParts {
  if (!targetIso) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00" };
  }
  const diff = new Date(targetIso).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00" };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function WorkshopCountdownOrganizers() {
  const [time, setTime] = useState<TimeParts>(() => calculateTimeParts(EVENT_CONFIG.eventDateIso));

  useEffect(() => {
    if (!EVENT_CONFIG.eventDateIso) return;
    setTime(calculateTimeParts(EVENT_CONFIG.eventDateIso));
    const timer = window.setInterval(() => {
      setTime(calculateTimeParts(EVENT_CONFIG.eventDateIso));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    { label: "DAYS", value: time.days },
    { label: "HOURS", value: time.hours },
    { label: "MINUTES", value: time.minutes },
    { label: "SECONDS", value: time.seconds },
  ];

  return (
    <section className="border-b border-white/10 bg-[#0B0F0D]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Countdown Display */}
            <div className="lg:col-span-6">
              <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#A1A1AA]">
                <Clock className="h-3.5 w-3.5 text-[#00D978]" />
                <span>
                  {EVENT_CONFIG.eventDateIso
                    ? "Countdown to Workshop 2027"
                    : "Official Countdown · Date To Be Announced"}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
                {units.map((unit) => (
                  <div
                    key={unit.label}
                    className="rounded-lg border border-white/10 bg-[#050505] p-3 text-center sm:p-4"
                  >
                    <p className="font-['Manrope',sans-serif] text-2xl font-extrabold tracking-tight text-white tabular-nums sm:text-3xl lg:text-4xl">
                      {unit.value}
                    </p>
                    <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-[#00D978]">
                      {unit.label}
                    </p>
                  </div>
                ))}
              </div>

              {!EVENT_CONFIG.eventDateIso && (
                <p className="mt-3 text-xs text-[#A1A1AA]">
                  Countdown activates automatically once the official 2027 workshop date is locked.
                </p>
              )}
            </div>

            {/* Organizing Brand & Main Sponsor Lockup */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-[#050505] p-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D978]">
                      ORGANIZED BY
                    </p>
                    <h2 className="mt-2 font-['Manrope',sans-serif] text-2xl font-extrabold tracking-tight text-white">
                      {EVENT_CONFIG.organizer}
                    </h2>
                  </div>
                  <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-[#A1A1AA]">
                    {EVENT_CONFIG.tagline}
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-[#050505] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D978]">
                        SPONSORED BY
                      </p>
                      <h2 className="mt-2 font-['Manrope',sans-serif] text-2xl font-extrabold tracking-tight text-white">
                        {EVENT_CONFIG.mainSponsor}
                      </h2>
                    </div>
                    <img
                      src={WORKSHOP_ASSETS.logo}
                      alt="Workshop Official Crest"
                      className="h-12 w-12 shrink-0 object-contain"
                    />
                  </div>
                  <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-[#A1A1AA]">
                    Main Sponsor empowering accessible Generative AI literacy for students.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
