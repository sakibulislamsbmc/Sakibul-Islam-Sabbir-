import { WORKSHOP_STATS } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

export function WorkshopStats() {
  return (
    <section className="border-b border-white/10 bg-[#0B0F0D]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                <span className="h-1.5 w-1.5 bg-[#00D978]" />
                <span>004 — WORKSHOP HIGHLIGHTS</span>
              </div>
              <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                The Workshop at a Glance
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA]">
              Official quantitative capacity and curriculum metrics will replace bracketed
              placeholders once venue capacity is finalized.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WORKSHOP_STATS.map((stat, idx) => (
              <div
                key={stat.label}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#050505] p-6 transition-colors duration-200 hover:border-[#00D978]/40"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#A1A1AA]">
                    METRIC 0{idx + 1}
                  </p>
                  <p className="mt-4 font-['Manrope',sans-serif] text-4xl font-extrabold tracking-tight text-[#00D978] tabular-nums sm:text-5xl">
                    {stat.value}
                  </p>
                  <h3 className="mt-3 font-['Manrope',sans-serif] text-lg font-bold text-white">
                    {stat.label}
                  </h3>
                </div>
                <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-[#A1A1AA]">
                  {stat.note}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
