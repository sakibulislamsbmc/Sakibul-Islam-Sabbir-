import { Compass, Target } from "lucide-react";
import { WORKSHOP_ASSETS } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

export function WorkshopOverview() {
  return (
    <section id="about" className="scroll-mt-20 border-b border-white/10 bg-[#0B0F0D]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Copy Column */}
            <div className="lg:col-span-6">
              <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                <span className="h-1.5 w-1.5 bg-[#00D978]" />
                <span>002 — EVENT OVERVIEW</span>
              </div>

              <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold leading-tight tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                Why Should Students Learn Generative AI?
              </h2>

              <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
                <p>
                  Artificial Intelligence is rapidly transforming education, creativity,
                  communication, technology, and future career paths.
                </p>
                <p>
                  <strong className="font-semibold text-white">
                    AI FOR STUDENTS — Workshop 2027
                  </strong>{" "}
                  is designed to introduce students to Generative AI in a clear, practical, and
                  inspiring way. Instead of treating AI as something intimidating or technical, this
                  workshop helps students understand how modern AI works and how it can be used
                  responsibly to boost learning, productivity, and creativity.
                </p>
              </div>

              {/* Mission & Vision Cards */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-[#050505] p-5">
                  <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00D978]">
                    <Target className="h-4 w-4" />
                    <span>OUR MISSION</span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#A1A1AA]">
                    Empower students with practical AI literacy and responsible usage skills.
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-[#050505] p-5">
                  <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00D978]">
                    <Compass className="h-4 w-4" />
                    <span>OUR VISION</span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#A1A1AA]">
                    Prepare confident, ethical, future-ready learners for the AI era.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#050505] p-3">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
                  <img
                    src={WORKSHOP_ASSETS.overviewScene}
                    alt="University students collaborating with laptops during a Generative AI workshop"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03] motion-reduce:transform-none"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D978]">
                        HANDS-ON STUDENT ENVIRONMENT
                      </p>
                      <p className="mt-1 font-['Manrope',sans-serif] text-base font-bold text-white sm:text-lg">
                        Clear concepts. Practical prompts. Ethical foundations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
