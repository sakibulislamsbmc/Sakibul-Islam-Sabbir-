import { BookOpen, Compass, Cpu, Layers, ShieldCheck, Sparkles, Terminal, Zap } from "lucide-react";
import { LEARNING_MODULES, type LearningModuleItem } from "@/data/workshop-data";
import { Reveal } from "./Reveal";

function ModuleIcon({ name }: { name: LearningModuleItem["iconName"] }) {
  const cls = "h-5 w-5 text-[#00D978]";
  switch (name) {
    case "cpu":
      return <Cpu className={cls} />;
    case "layers":
      return <Layers className={cls} />;
    case "terminal":
      return <Terminal className={cls} />;
    case "book":
      return <BookOpen className={cls} />;
    case "sparkles":
      return <Sparkles className={cls} />;
    case "zap":
      return <Zap className={cls} />;
    case "compass":
      return <Compass className={cls} />;
    case "shield":
      return <ShieldCheck className={cls} />;
  }
}

export function WorkshopModules() {
  return (
    <section id="modules" className="scroll-mt-20 border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl border-x border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-[#00D978]">
                <span className="h-1.5 w-1.5 bg-[#00D978]" />
                <span>003 — WHAT YOU&apos;LL LEARN</span>
              </div>
              <h2 className="font-['Manrope',sans-serif] text-3xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                Explore the World of Generative AI
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA]">
              Eight practical learning modules built specifically to bridge curiosity, academic
              productivity, creativity, and ethical judgment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEARNING_MODULES.map((mod) => (
              <article
                key={mod.number}
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#0B0F0D] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00D978]/50 hover:bg-[#0B0F0D]/90"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#050505] transition-colors group-hover:border-[#00D978]/40">
                      <ModuleIcon name={mod.iconName} />
                    </div>
                    <span className="font-mono text-xs font-semibold tracking-widest text-[#A1A1AA] group-hover:text-[#00D978]">
                      {mod.number}
                    </span>
                  </div>

                  <h3 className="mt-5 font-['Manrope',sans-serif] text-lg font-bold leading-snug text-white">
                    {mod.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#A1A1AA] sm:text-sm">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-6 h-[1px] w-full bg-white/10 transition-colors duration-300 group-hover:bg-[#00D978]/50" />
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
