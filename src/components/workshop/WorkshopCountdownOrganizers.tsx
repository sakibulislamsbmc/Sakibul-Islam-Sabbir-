import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { EVENT_CONFIG, WORKSHOP_ASSETS } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

interface TimeParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isLive: boolean;
}

function calculateTimeParts(targetIso: string | null): TimeParts {
  if (!targetIso) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00", isLive: false };
  }
  const diff = new Date(targetIso).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00", isLive: true };
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
    isLive: false,
  };
}

const INITIAL_TIME_PARTS: TimeParts = {
  days: "--",
  hours: "--",
  minutes: "--",
  seconds: "--",
  isLive: false,
};

export function WorkshopCountdownOrganizers() {
  const [time, setTime] = useState<TimeParts>(INITIAL_TIME_PARTS);

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
            {/* Official Live Countdown */}
            <div className="lg:col-span-6">
              <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#00D978]">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {time.isLive
                    ? "Live Session Started · 9 December 9:30 PM"
                    : "Official Countdown Live · 9 December, 9:30 PM Night"}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
                {units.map((unit) => (
                  <div
                    key={unit.label}
                    className="rounded-lg border border-[#00D978]/25 bg-[#050505] p-3 text-center sm:p-4"
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

              <p className="mt-3 text-xs text-[#A1A1AA]">
                One-Night Online Live Meeting via Google Meet · Bangladesh Time (UTC+6)
              </p>
            </div>

            {/* Organizing Brand & Main Sponsor Lockup with Official Logos */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-[#050505] p-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D978]">
                      ORGANIZED BY
                    </p>
                    <div className="mt-3 flex h-16 items-center justify-center rounded-md bg-white px-3 py-1.5">
                      <img
                        src={WORKSHOP_ASSETS.bismahsoftLogo}
                        alt="Bismahsoft Ltd Official Logo"
                        className="h-full w-auto max-w-full object-contain"
                      />
                    </div>
                  </div>
                  <p className="mt-3 border-t border-white/10 pt-3 text-xs font-semibold text-white">
                    {EVENT_CONFIG.organizer}
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-[#050505] p-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D978]">
                      MAIN SPONSOR
                    </p>
                    <div className="mt-3 flex h-16 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-[#083A18]">
                      <img
                        src={WORKSHOP_ASSETS.neerFashionLogo}
                        alt="Neer Fashion Official Logo"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                  <p className="mt-3 border-t border-white/10 pt-3 text-xs font-semibold text-white">
                    {EVENT_CONFIG.mainSponsor}
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
