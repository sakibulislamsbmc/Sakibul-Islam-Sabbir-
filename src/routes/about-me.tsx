import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Award,
  Briefcase,
  Compass,
  Download,
  ExternalLink,
  Globe,
  GraduationCap,
  MapPin,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";

export const Route = createFileRoute("/about-me")({
  head: () => ({
    meta: [
      { title: "About Me — Sakibul Islam Sabbir" },
      {
        name: "description",
        content:
          "Creative Designer & Digital Media Professional combining graphic design, video editing, Meta marketing, web development, and operational leadership.",
      },
      { property: "og:title", content: "About Me — Sakibul Islam Sabbir" },
      {
        property: "og:description",
        content:
          "Academic qualifications, core skills, employment history, and professional certifications of Sakibul Islam Sabbir.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutMePage,
});

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Me", href: "/about-me" },
  { label: "Thankful", href: "/thankful" },
  { label: "Contact", href: "/contact" },
];

const PORTRAIT_IMAGES = [
  "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png",
  "https://www.image2url.com/r2/default/images/1793830267590-654c4729-bbde-4ca9-8721-fef466601fa0.png",
  "https://www.image2url.com/r2/default/images/1793830305704-e179d36b-b9ab-42bd-abcd-003dda243066.png",
  "https://www.image2url.com/r2/default/images/1793830412305-08adbd21-af0b-48e9-a6ea-195463fd1fad.png",
] as const;

const CV_PDF_URL = "/assets/aistudio/Sakibul_Islam_Sabbir_CV_36b8d13c.pdf";

const SERVICES = [
  {
    code: "01",
    title: "Creative & Brand Design",
    summary:
      "Distinctive brand identities, marketing graphics, social media creatives, and visual layouts crafted with the Adobe Creative Suite.",
  },
  {
    code: "02",
    title: "Video Editing & Storytelling",
    summary:
      "High-retention promotional reels, short-form vertical edits, long-form post-production, and multimedia brand storytelling.",
  },
  {
    code: "03",
    title: "Meta Marketing & Web Solutions",
    summary:
      "High-converting Facebook & Instagram ad campaigns, audience growth strategies, and modern, responsive website development.",
  },
  {
    code: "04",
    title: "Operations & Administration",
    summary:
      "Structured institutional administration, branch operations leadership, client relations, and streamlined business workflows.",
  },
];

const ACADEMIC_QUALIFICATIONS = [
  {
    code: "01",
    degree: "Bachelor of Social Science (BSS)",
    institution: "Rajshahi College",
    detail:
      "Undergraduate studies in Social Science building strong analytical, communication, and leadership foundations.",
  },
  {
    code: "02",
    degree: "Higher Secondary Certificate (HSC)",
    institution: "Taherpur Degree College",
    detail:
      "Higher secondary academic qualification with active involvement in creative and organizational initiatives.",
  },
  {
    code: "03",
    degree: "Secondary School Certificate (SSC)",
    institution: "Ujalkhalshi High School",
    detail: "Foundational secondary education completed with distinction and dedication.",
  },
];

const CORE_SKILLS = [
  {
    code: "01",
    domain: "Creative & Visual Design",
    competencies: [
      "Graphic Design",
      "Brand Identity",
      "Visual Layout",
      "Social Media Creatives",
      "Adobe Creative Suite",
    ],
  },
  {
    code: "02",
    domain: "Video & Digital Media",
    competencies: [
      "Video Editing",
      "Promotional Reels",
      "Post-Production",
      "Multimedia Storytelling",
    ],
  },
  {
    code: "03",
    domain: "Digital Marketing & Web",
    competencies: [
      "Meta Marketing (Facebook & Instagram Campaigns)",
      "Audience Engagement",
      "Web Development",
    ],
  },
  {
    code: "04",
    domain: "Management & Operations",
    competencies: [
      "Administrative Management",
      "Agent Banking Branch Operations",
      "Small Business Management",
      "Sales & Client Relations",
    ],
  },
];

const EMPLOYMENT_HISTORY = [
  {
    period: "Jun 2026 – Sep 2026",
    position: "Administrative Manager",
    organization: "Future Ummah International School",
    responsibilities:
      "Coordinated daily institutional administration, staff scheduling, and operational workflows.",
  },
  {
    period: "Jan 2026 – Jul 2026",
    position: "Social Media Executive",
    organization: "Ilm Ul Quran USA",
    responsibilities:
      "Managed social media channels, digital outreach, content scheduling, and audience engagement campaigns.",
  },
  {
    period: "May 2025 – Oct 2025",
    position: "Agent Branch Manager",
    organization: "Dutch Bangla Bank PLC",
    responsibilities:
      "Oversaw agent banking branch operations, customer service delivery, and daily financial administration.",
  },
  {
    period: "Jan 2025 – Sep 2025",
    position: "Graphic Designer",
    organization: "Max IT Solution",
    responsibilities:
      "Designed marketing graphics, digital assets, and promotional visuals for diverse client projects.",
  },
  {
    period: "Nov 2024 – Feb 2025",
    position: "Sales Representative",
    organization: "Barnoi Lifestyle",
    responsibilities:
      "Handled customer inquiries, product presentation, and retail sales outreach.",
  },
  {
    period: "Jan 2024 – Jun 2024",
    position: "Video Editor",
    organization: "Nutrify Mart",
    responsibilities:
      "Edited promotional product videos and social media video content to support brand marketing.",
  },
];

const CERTIFICATIONS = [
  {
    issuer: "Adobe",
    area: "Creative & Digital Design Certification",
  },
  {
    issuer: "As Sunnah Skill Development Institute",
    area: "Small Business Management Course (2025)",
  },
  {
    issuer: "Procoder BD",
    area: "Web Development & Technical Skills Certification",
  },
  {
    issuer: "10 Minute School",
    area: "Professional & Digital Skills Certification",
  },
  {
    issuer: "Bongo Academy",
    area: "Digital Media & Creative Skills Certification",
  },
  {
    issuer: "HP LIFE",
    area: "Business & Entrepreneurship Training Certification",
  },
  {
    issuer: "Ononno",
    area: "Professional Skill Development Certification",
  },
  {
    issuer: "Rajshahi City Corporation",
    area: "Institutional Skill & Training Certification",
  },
];

const LANGUAGES = [
  {
    language: "Bangla",
    level: "Native / Full Professional Proficiency",
    skills: "Reading · Writing · Speaking",
  },
  {
    language: "English",
    level: "Professional Working Proficiency",
    skills: "Reading · Writing · Speaking",
  },
  {
    language: "Hindi",
    level: "Working Proficiency",
    skills: "Reading · Writing · Speaking",
  },
];

function AboutMePage() {
  const [open, setOpen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("all");

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Ambient architectural background glow to accentuate transparent glass containers */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[560px] w-[560px] rounded-full bg-foreground/[0.045] blur-3xl" />
        <div className="absolute right-1/5 top-1/3 h-[500px] w-[500px] rounded-full bg-foreground/[0.035] blur-3xl" />
        <div className="absolute bottom-1/4 left-1/5 h-[460px] w-[460px] rounded-full bg-foreground/[0.04] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 z-[60] flex h-16 w-full items-center border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex w-full items-center justify-between gap-8 px-4 lg:px-8">
          <Link
            to="/"
            className="group flex shrink-0 items-center whitespace-nowrap font-display text-xl font-bold tracking-tighter"
          >
            SS<span className="transition-transform duration-300 group-hover:scale-125">.</span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
            {NAV.map((item) => {
              const isActive = item.label === "About Me";
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`relative shrink-0 whitespace-nowrap text-xs uppercase tracking-wider transition-all duration-200 hover:text-foreground ${
                    isActive
                      ? "font-bold text-foreground"
                      : "font-semibold text-muted-foreground/80"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <PWAInstallButton variant="header" />
            <a
              href={CV_PDF_URL}
              download="Sakibul_Islam_Sabbir_CV.pdf"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 justify-center whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" />
              Download CV
            </a>
            <Link
              to="/account"
              aria-label="Account"
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border shadow-sm transition-transform duration-200 hover:scale-105"
            >
              <img
                src={PORTRAIT_IMAGES[0]}
                alt="Sakibul Islam Sabbir"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-top"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <PWAInstallButton variant="header" />
            <button className="p-2" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <MobileHeaderMenu open={open} activePath="/about-me" onClose={() => setOpen(false)} />
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-28 sm:px-6 md:pt-36 lg:px-8">
        {/* HERO INTRODUCTION: Portrait Container + Bio, Future Plans, Services & CV Download */}
        <section className="mb-16 md:mb-24">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/45 p-6 shadow-2xl shadow-black/[0.04] ring-1 ring-inset ring-foreground/[0.05] backdrop-blur-2xl sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Left / Top on Mobile: Homepage-Style Glassmorphic Portrait Container */}
              <div className="flex flex-col justify-between lg:col-span-5">
                <div className="relative mx-auto w-full max-w-[400px] lg:max-w-none">
                  {/* Glassmorphic Portrait Frame */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border/80 bg-background/35 p-3 shadow-2xl ring-1 ring-inset ring-foreground/[0.05] backdrop-blur-2xl">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-muted/40">
                      <img
                        src={PORTRAIT_IMAGES[activePhotoIdx]}
                        alt="Sakibul Islam Sabbir"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-top transition-all duration-300"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-white">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-white/80">
                            Sakibul Islam Sabbir
                          </p>
                          <p className="font-display text-sm font-bold">
                            Creative Designer & Digital Media Specialist
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Portrait Switcher (4 Uploaded Photos) */}
                  <div className="mt-4 grid grid-cols-4 gap-2.5">
                    {PORTRAIT_IMAGES.map((src, idx) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setActivePhotoIdx(idx)}
                        aria-label={`View portrait ${idx + 1}`}
                        className={`relative aspect-square overflow-hidden rounded-2xl border p-1 transition-all duration-150 ${
                          activePhotoIdx === idx
                            ? "border-primary bg-background/80 shadow-md ring-2 ring-primary/20"
                            : "border-border/60 bg-background/30 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={src}
                          alt={`Sakibul Islam portrait ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="h-full w-full rounded-xl object-cover object-top"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location & Address Metadata Card */}
                <div className="mt-6 rounded-2xl border border-border/70 bg-background/50 p-4 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        <strong className="font-semibold text-foreground">Present Address:</strong>{" "}
                        Badda, Dhaka, Bangladesh
                      </p>
                      <p>
                        <strong className="font-semibold text-foreground">
                          Permanent Address:
                        </strong>{" "}
                        Durgapur, Rajshahi, Bangladesh
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Who I Am, What I Do, Future Plans, Services & CV Download */}
              <div className="flex flex-col justify-between lg:col-span-7">
                <div>
                  <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    About Me · Profile & Vision
                  </p>
                  <h1 className="mb-3 font-display text-4xl font-bold leading-[1.08] tracking-tight [text-wrap:balance] sm:text-5xl lg:text-6xl">
                    Sakibul Islam <span className="text-muted-foreground/80">Sabbir.</span>
                  </h1>
                  <p className="mb-6 font-display text-lg font-medium text-foreground/85 sm:text-xl">
                    Creative Designer & Digital Media Professional
                  </p>

                  {/* Who I Am & What I Do */}
                  <div className="space-y-4 text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                    <p>
                      I am a versatile{" "}
                      <strong className="font-medium text-foreground">
                        Creative Designer and Digital Media Specialist
                      </strong>{" "}
                      combining hands-on experience in graphic design, video editing, Meta
                      marketing, and web development with proven leadership in branch operations and
                      school administration. I am committed to delivering visually compelling brand
                      communication, high-converting social media campaigns, and well-organized
                      operational workflows.
                    </p>
                  </div>

                  {/* Future Plans */}
                  <div className="mt-6 rounded-2xl border border-border/70 bg-background/50 p-5 backdrop-blur-xl">
                    <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground">
                      <Compass className="h-4 w-4" />
                      <span>Future Plans & Vision</span>
                    </div>
                    <p className="text-xs font-light leading-relaxed text-muted-foreground sm:text-sm">
                      My goal is to build a multidisciplinary creative and technology practice that
                      empowers businesses globally through cohesive brand systems, high-retention
                      video storytelling, data-driven Meta marketing, and scalable web
                      automation—while continuing to mentor emerging digital creators.
                    </p>
                  </div>

                  {/* Services I Provide */}
                  <div className="mt-6">
                    <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      Services I Provide
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {SERVICES.map((srv) => (
                        <div
                          key={srv.code}
                          className="rounded-2xl border border-border/70 bg-background/45 p-4 backdrop-blur-xl transition-colors hover:border-foreground/25 hover:bg-background/65"
                        >
                          <p className="font-mono text-[10px] text-muted-foreground">{srv.code}</p>
                          <h2 className="mt-0.5 font-display text-sm font-bold text-foreground">
                            {srv.title}
                          </h2>
                          <p className="mt-1 text-xs font-light leading-relaxed text-muted-foreground">
                            {srv.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Download CV in PDF Format CTA Strip */}
                <div className="mt-8 flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={CV_PDF_URL}
                      download="Sakibul_Islam_Sabbir_CV.pdf"
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-primary px-7 text-xs font-semibold text-primary-foreground shadow-lg shadow-black/10 transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-95 sm:text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Download CV (PDF)
                    </a>

                    <a
                      href={CV_PDF_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-background/80 px-6 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:bg-muted active:scale-95 sm:text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View PDF
                    </a>
                  </div>

                  <Link
                    to="/contact"
                    className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-border/80 bg-muted/50 px-5 text-xs font-semibold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    Hire / Collaborate
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile-Friendly Quick Section Filter Bar */}
        <div className="mb-10 flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: "all", label: "All Credentials" },
            { id: "academic", label: "01. Academic Qualifications" },
            { id: "skills", label: "02. Core Skills" },
            { id: "experience", label: "03. Work Experience" },
            { id: "certifications", label: "04. Certifications & Languages" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
                activeSection === tab.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border/80 bg-background/45 text-muted-foreground backdrop-blur-md hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEQUENTIAL CREDENTIALS CONTAINER */}
        <div className="space-y-16 rounded-3xl border border-border/80 bg-background/30 p-4 shadow-2xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl sm:p-8 lg:p-10">
          {/* SECTION 01: ACADEMIC QUALIFICATIONS */}
          {(activeSection === "all" || activeSection === "academic") && (
            <section id="academic-qualifications" className="scroll-mt-24">
              <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1.5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    01. Educational Background
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Academic <span className="text-muted-foreground/75">Qualifications.</span>
                  </h2>
                </div>
                <p className="max-w-md text-sm font-light text-muted-foreground">
                  Formal academic degrees and foundational institutions.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {ACADEMIC_QUALIFICATIONS.map((edu) => (
                  <article
                    key={edu.code}
                    className="flex flex-col justify-between rounded-3xl border border-border/80 bg-background/45 p-6 shadow-lg shadow-black/[0.02] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-background/65"
                  >
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {edu.code} · Degree / Certificate
                      </span>
                      <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">
                        {edu.degree}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-foreground/80">
                        {edu.institution}
                      </p>
                    </div>
                    <p className="mt-4 border-t border-border/50 pt-3.5 text-xs font-light leading-relaxed text-muted-foreground">
                      {edu.detail}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 02: CORE SKILLS & SPECIAL QUALIFICATIONS */}
          {(activeSection === "all" || activeSection === "skills") && (
            <section id="core-skills" className="scroll-mt-24">
              <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1.5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    02. Technical & Creative Arsenal
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Core Skills & <span className="text-muted-foreground/75">Competencies.</span>
                  </h2>
                </div>
                <p className="max-w-md text-sm font-light text-muted-foreground">
                  Specialized domains spanning design, post-production, digital growth, and
                  operations.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {CORE_SKILLS.map((skillGroup) => (
                  <article
                    key={skillGroup.code}
                    className="flex flex-col justify-between rounded-3xl border border-border/80 bg-background/45 p-6 shadow-lg shadow-black/[0.02] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-background/65"
                  >
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {skillGroup.code} · Domain
                      </span>
                      <h3 className="mt-2 font-display text-lg font-bold tracking-tight text-foreground">
                        {skillGroup.domain}
                      </h3>

                      <ul className="mt-4 space-y-2 border-t border-border/50 pt-4">
                        {skillGroup.competencies.map((item) => (
                          <li
                            key={item}
                            className="text-xs font-light leading-relaxed text-muted-foreground"
                          >
                            <span className="font-medium text-foreground">·</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 03: PREVIOUS WORK EXPERIENCE (EMPLOYMENT HISTORY) */}
          {(activeSection === "all" || activeSection === "experience") && (
            <section id="work-experience" className="scroll-mt-24">
              <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1.5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    03. Career Timeline
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Previous Work <span className="text-muted-foreground/75">Experience.</span>
                  </h2>
                </div>
                <p className="max-w-md text-sm font-light text-muted-foreground">
                  Proven track record across creative agencies, banking operations, and
                  international educational institutions.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {EMPLOYMENT_HISTORY.map((job, idx) => (
                  <article
                    key={`${job.organization}-${job.position}`}
                    className="flex flex-col justify-between rounded-3xl border border-border/80 bg-background/45 p-6 shadow-lg shadow-black/[0.02] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-background/65"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          {job.period}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground/70">
                          0{idx + 1}
                        </span>
                      </div>

                      <h3 className="mt-2.5 font-display text-lg font-bold tracking-tight text-foreground">
                        {job.position}
                      </h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                        {job.organization}
                      </p>
                    </div>

                    <p className="mt-4 border-t border-border/50 pt-3.5 text-xs font-light leading-relaxed text-muted-foreground">
                      {job.responsibilities}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 04: TRAINING, PROFESSIONAL CERTIFICATIONS & LANGUAGES */}
          {(activeSection === "all" || activeSection === "certifications") && (
            <section id="certifications-competencies" className="scroll-mt-24 space-y-12">
              <div>
                <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
                  <div>
                    <p className="mb-1.5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      <Award className="h-4 w-4" />
                      04. Credentials & Other Competencies
                    </p>
                    <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                      Training & <span className="text-muted-foreground/75">Certifications.</span>
                    </h2>
                  </div>
                  <p className="max-w-md text-sm font-light text-muted-foreground">
                    Professional training courses, industry certifications, and multilingual
                    communication.
                  </p>
                </div>

                {/* Highlighted Training Banner */}
                <div className="mb-6 rounded-2xl border border-border/80 bg-background/55 p-5 backdrop-blur-xl">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Featured Professional Training Course (2025)
                  </p>
                  <p className="mt-1 font-display text-base font-bold text-foreground sm:text-lg">
                    Small Business Management Course —{" "}
                    <span className="font-normal text-muted-foreground">
                      As Sunnah Skill Development Institute
                    </span>
                  </p>
                </div>

                {/* 4-Per-Row Certifications Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {CERTIFICATIONS.map((cert, idx) => (
                    <article
                      key={cert.issuer}
                      className="flex flex-col justify-between rounded-2xl border border-border/75 bg-background/45 p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-background/65"
                    >
                      <div>
                        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                          CERT 0{idx + 1}
                        </span>
                        <h3 className="mt-1.5 font-display text-base font-bold tracking-tight text-foreground">
                          {cert.issuer}
                        </h3>
                      </div>
                      <p className="mt-3 border-t border-border/50 pt-2.5 text-xs font-light leading-relaxed text-muted-foreground">
                        {cert.area}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              {/* Language Proficiency Subsection */}
              <div className="border-t border-border/60 pt-10">
                <div className="mb-6 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    Language <span className="text-muted-foreground/75">Proficiency</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {LANGUAGES.map((lang) => (
                    <div
                      key={lang.language}
                      className="rounded-2xl border border-border/75 bg-background/45 p-5 backdrop-blur-xl"
                    >
                      <h4 className="font-display text-lg font-bold text-foreground">
                        {lang.language}
                      </h4>
                      <p className="mt-1 text-xs font-medium text-foreground/80">{lang.level}</p>
                      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                        {lang.skills}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activePath="/about-me" />
    </div>
  );
}
