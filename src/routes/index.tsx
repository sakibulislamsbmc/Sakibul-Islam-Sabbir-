import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Code,
  GraduationCap,
  Lightbulb,
  Menu,
  Search,
  X,
} from "lucide-react";
import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sakibul Islam Sabbir — The Architect" },
      {
        name: "description",
        content:
          "Creative Designer, Video Editor, and Digital Media Professional crafting visual identities, high-retention video storytelling, and scalable digital operations.",
      },
      { property: "og:title", content: "Sakibul Islam Sabbir — The Architect" },
      {
        property: "og:description",
        content:
          "Creative Designer, Video Editor, and Digital Media Professional based in Rajshahi, Bangladesh.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = ["Home", "Projects", "Portfolio", "About Me", "Thankful", "Contact"];
const IMAGES = [
  [
    "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png",
    "Professional Portrait",
  ],
  [
    "https://www.image2url.com/r2/default/images/1793830267590-654c4729-bbde-4ca9-8721-fef466601fa0.png",
    "Teaching",
  ],
  [
    "https://www.image2url.com/r2/default/images/1793830305704-e179d36b-b9ab-42bd-abcd-003dda243066.png",
    "Thinking",
  ],
  [
    "https://www.image2url.com/r2/default/images/1793830412305-08adbd21-af0b-48e9-a6ea-195463fd1fad.png",
    "Development",
  ],
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function Pill({ icon: Icon, children }: { icon: typeof Code; children: React.ReactNode }) {
  return (
    <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground shadow-sm md:mb-6 md:text-xs">
      <Icon className="h-4 w-4" /> {children}
    </span>
  );
}

function Title({ a, b }: { a: string; b: string }) {
  return (
    <h2 className="mb-4 font-display text-4xl font-bold leading-[1.1] tracking-tight md:mb-8 md:text-5xl lg:text-7xl">
      {a} <span className="text-muted-foreground/80">{b}</span>
    </h2>
  );
}

const btnPrimary =
  "inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95 md:h-12 md:px-8 md:text-sm";
const btnOutline =
  "inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-6 text-xs font-semibold text-foreground transition-all hover:scale-105 hover:bg-muted active:scale-95 md:h-12 md:px-8 md:text-sm";

const SLIDES = [
  <>
    <Pill icon={Code}>Hello, I am Sabbir</Pill>
    <h1 className="mb-4 font-display text-4xl font-bold leading-[1.1] tracking-tight md:mb-8 md:text-5xl lg:text-7xl">
      The <span className="text-muted-foreground/80">Architect.</span>
    </h1>
    <p className="mb-6 max-w-lg text-base font-light leading-relaxed text-muted-foreground md:mb-8 md:text-lg lg:text-xl">
      I am Sakibul Islam Sabbir, a Creative Designer, Video Editor, and Digital Media Professional
      bridging visual storytelling with structured operations. From brand identity systems and
      high-retention video production to social media growth and web experiences, I craft purposeful
      digital work for global brands.
    </p>
    <div className="flex flex-wrap gap-3 md:gap-4">
      <a href="/contact" className={btnPrimary}>
        Let's Collaborate
      </a>
      <a href="/projects" className={btnOutline}>
        Explore Archive <ArrowRight className="ml-2 h-4 w-4" />
      </a>
      <PWAInstallButton variant="hero" />
    </div>
  </>,
  <>
    <Pill icon={GraduationCap}>Digital Literacy</Pill>
    <Title a="Empowering through" b="Education." />
    <p className="mb-4 max-w-lg text-base font-light leading-relaxed text-muted-foreground md:mb-6 md:text-lg">
      Continuous learning and institutional leadership shape every project I undertake. Alongside
      pursuing my Bachelor of Social Science (BSS) at Rajshahi College, I have completed specialized
      business management training at the As Sunnah Skill Development Institute and earned 8+
      certifications across design, web development, and digital media.
    </p>
    <ul className="grid grid-cols-2 gap-2 text-sm font-medium md:gap-4">
      {[
        "BSS at Rajshahi College",
        "As Sunnah Skill Institute",
        "8+ Global Certifications",
        "Adobe, Web & Media Mastery",
      ].map((t) => (
        <li key={t} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {t}
        </li>
      ))}
    </ul>
  </>,
  <>
    <Pill icon={Lightbulb}>Core Philosophy</Pill>
    <Title a="Building for the" b="Long Term." />
    <p className="mb-4 max-w-lg text-base font-light leading-relaxed text-muted-foreground md:mb-6 md:text-lg">
      Great software isn't just about writing code; it's about solving real human problems elegantly
      — and safely. Every system I design starts from the same three questions: will it scale, will
      it hold up under attack, and will it feel obvious to the person using it.
    </p>
    <blockquote className="mb-6 max-w-lg border-l-2 border-primary pl-4 italic text-foreground">
      "Technology should fade into the background, allowing human creativity and connection to take
      center stage."
    </blockquote>
    <a href="/about-me" className="inline-flex items-center text-sm font-semibold hover:underline">
      Read my latest thoughts <ArrowRight className="ml-2 h-4 w-4" />
    </a>
  </>,
  <>
    <Pill icon={Briefcase}>Career Journey</Pill>
    <Title a="Engineering" b="Excellence." />
    <div className="max-w-lg space-y-5 border-l border-border pl-5">
      <div>
        <h3 className="font-display text-lg font-bold">
          Administrative Manager & Social Media Executive
        </h3>
        <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
          Future Ummah Int. School & Ilm Ul Quran USA • 2026
        </p>
        <p className="text-sm font-light leading-relaxed text-muted-foreground">
          Directed institutional administration, staff coordination, and academic workflows at
          Future Ummah International School while leading international social media strategy, short
          video campaigns, and visual branding for Ilm Ul Quran USA.
        </p>
      </div>
      <div>
        <h3 className="font-display text-lg font-bold">Agent Branch Manager & Graphic Designer</h3>
        <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
          Dutch Bangla Bank PLC & Max IT Solution • 2024 – 2025
        </p>
        <p className="text-sm font-light leading-relaxed text-muted-foreground">
          Managed daily agent banking operations and customer service compliance at Dutch Bangla
          Bank PLC, alongside crafting brand identities, promotional graphics, and video edits for
          clients at Max IT Solution, Barnoi Lifestyle, and Nutrify Mart.
        </p>
      </div>
    </div>
  </>,
];

function Index() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      setP(clamp(-el.getBoundingClientRect().top / total) * (SLIDES.length - 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      <header className="fixed top-0 z-[60] flex h-16 w-full items-center border-b border-border bg-background">
        <div className="container mx-auto flex w-full items-center justify-between px-4 lg:px-8">
          <a
            href="/"
            className="group flex items-center font-display text-xl font-bold tracking-tighter"
          >
            SS<span className="transition-transform duration-300 group-hover:scale-125">.</span>
          </a>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
            {NAV.map((n, i) => (
              <a
                key={n}
                href={i === 0 ? "/" : `/${n.toLowerCase().replace(/\s+/g, "-")}`}
                className={`relative shrink-0 whitespace-nowrap text-xs uppercase tracking-wider transition-all duration-300 hover:text-foreground ${i === 0 ? "font-bold text-foreground" : "font-semibold text-muted-foreground/80"}`}
              >
                {n}
                {i === 0 && (
                  <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-primary" />
                )}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <PWAInstallButton variant="header" />
            <a
              href="/account"
              className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground"
            >
              <Search className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Account</span>
            </a>
            <a
              href="/account"
              aria-label="Notifications"
              className="rounded-full p-2 text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
            </a>
            <a
              href="/account"
              aria-label="Account"
              className="h-9 w-9 overflow-hidden rounded-full border border-border shadow-sm transition-transform hover:scale-105"
            >
              <img
                src="https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png"
                alt="Profile"
                className="h-full w-full object-cover object-top"
              />
            </a>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <PWAInstallButton variant="header" />
            <button className="p-2" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        <MobileHeaderMenu open={open} activePath="/" onClose={() => setOpen(false)} />
      </header>

      <main ref={ref} className="relative" style={{ height: `${SLIDES.length * 100}vh` }}>
        <section className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-center gap-4 px-4 py-8 pt-20 sm:px-6 md:flex-row md:gap-12 md:py-20 lg:gap-20 lg:px-8">
            <div className="relative z-40 order-first flex h-[45%] w-full items-center justify-center [perspective:1200px] md:order-last md:h-full md:w-1/2">
              {IMAGES.map(([src, alt], i) => {
                const d = p - i; // >0 means flipped away
                const out = clamp(d);
                const behind = clamp(-d, 0, 3);
                const style =
                  d >= 0
                    ? {
                        transform: `translateY(${-out * 120}%) rotateX(${out * 25}deg) scale(${1 - out * 0.1})`,
                        opacity: 1 - out,
                      }
                    : {
                        transform: `translateY(${behind * 4}%) scale(${1 - behind * 0.05})`,
                        opacity: 1 - behind * 0.15,
                      };
                return (
                  <div
                    key={src}
                    className="absolute aspect-[4/5] w-3/4 max-w-[280px] overflow-hidden rounded-2xl bg-muted shadow-2xl will-change-transform md:w-[90%] md:max-w-[420px] md:rounded-3xl"
                    style={{ ...style, zIndex: 40 - i * 10 }}
                  >
                    <img src={src} alt={alt} className="h-full w-full object-cover" />
                  </div>
                );
              })}
            </div>
            <div className="relative z-50 order-last flex h-[55%] w-full items-start md:order-first md:h-full md:w-1/2 md:items-center">
              {SLIDES.map((s, i) => {
                const d = p - i;
                const op = clamp(1 - Math.abs(d) * 1.4);
                return (
                  <div
                    key={i}
                    className="absolute inset-x-0 top-0 flex flex-col justify-start md:inset-0 md:justify-center"
                    style={{
                      opacity: op,
                      transform: `translateY(${-d * 60}px)`,
                      pointerEvents: op > 0.5 ? "auto" : "none",
                    }}
                  >
                    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm md:p-6">
                      {s}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <MobileBottomNav activePath="/" />
    </div>
  );
}
