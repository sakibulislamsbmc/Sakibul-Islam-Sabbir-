import { Handshake } from "lucide-react";
import { EVENT_CONFIG, PARTNER_CATEGORIES } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

export function WorkshopPartners() {
  return (
    <section className="border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                <span className="h-1.5 w-1.5 bg-[#00D978]" />
                <span>007 — SUPPORTING PARTNERS</span>
              </div>
              <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                Together, We Empower the Future.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA]">
              Structured partnership categories ready for campus clubs, educational institutions,
              and media allies joining {EVENT_CONFIG.eventName}.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PARTNER_CATEGORIES.map((item) => (
              <div
                key={item.category}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0B0F0D] p-5 transition-colors duration-200 hover:border-[#00D978]/45"
              >
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-[#050505]">
                    <Handshake className="h-4 w-4 text-[#00D978]" />
                  </div>
                  <h3 className="mt-4 font-['Manrope',sans-serif] text-base font-bold text-white">
                    {item.category}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">{item.description}</p>
                </div>

                <div className="mt-5 border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#00D978]">
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
