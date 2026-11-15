import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { WORKSHOP_FAQS } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

export function WorkshopFAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="faq" className="scroll-mt-20 border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                <span className="h-1.5 w-1.5 bg-[#00D978]" />
                <span>COMMON QUESTIONS</span>
              </div>
              <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#A1A1AA]">
                Everything students, parents, and campus coordinators need to know before joining
                Workshop 2027.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-[#0B0F0D]">
                {WORKSHOP_FAQS.map((faq, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div key={faq.question}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenIndex((prev) => (prev === idx ? -1 : idx))}
                        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.02] sm:px-6"
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono text-xs text-[#00D978]">0{idx + 1}</span>
                          <span className="font-['Manrope',sans-serif] text-base font-bold text-white sm:text-lg">
                            {faq.question}
                          </span>
                        </div>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#050505] text-[#00D978]">
                          {isOpen ? (
                            <Minus className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-white/10 bg-[#050505]/70 px-5 py-4 pl-12 text-sm leading-relaxed text-[#A1A1AA] sm:px-6 sm:pl-14">
                          {faq.answer}
                        </div>
                      )}
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
