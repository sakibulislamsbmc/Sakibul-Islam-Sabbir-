import { CheckCircle2 } from "lucide-react";
import { WORKSHOP_BENEFITS } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

export function WorkshopBenefits() {
  return (
    <section className="border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                <span className="h-1.5 w-1.5 bg-[#00D978]" />
                <span>STUDENT VALUE &amp; OUTCOMES</span>
              </div>
              <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                Why Should You Join?
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA]">
              Six concrete advantages designed around what university and college learners actually
              need in 2027.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {WORKSHOP_BENEFITS.map((benefit) => (
              <article
                key={benefit.number}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0B0F0D] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00D978]/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#00D978]">
                      {benefit.number}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-[#00D978]" />
                  </div>
                  <h3 className="mt-4 font-['Manrope',sans-serif] text-xl font-bold text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#A1A1AA]">
                    {benefit.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
