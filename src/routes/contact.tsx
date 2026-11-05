import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Globe,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Sakibulislam" },
      {
        name: "description",
        content:
          "Tell me what you're making. Reach out via Email or WhatsApp for project briefs, reels, and creative collaborations.",
      },
      { property: "og:title", content: "Contact — Sakibulislam" },
      {
        property: "og:description",
        content: "Based in Bangladesh — working with clients worldwide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Me", href: "/about-me" },
  { label: "Thankful", href: "/thankful" },
  { label: "Contact", href: "/contact" },
];

const PROJECT_TYPES = [
  "A Reel / Short",
  "YouTube Video / Long-Form",
  "Brand Commercial / Ad",
  "Motion Graphics & Edit",
  "Web / AI Automation",
  "Other Creative Project",
];

const SOCIAL_LINKS = [
  {
    platform: "YouTube",
    handle: "@sakibulislamrc",
    displayUrl: "youtube.com/@sakibulislamrc",
    href: "https://www.youtube.com/@sakibulislamrc",
  },
  {
    platform: "Instagram",
    handle: "@sakibulislamrc",
    displayUrl: "instagram.com/@sakibulislamrc",
    href: "https://www.instagram.com/sakibulislamrc",
  },
  {
    platform: "Facebook",
    handle: "sabbirwithai7",
    displayUrl: "facebook.com/sabbirwithai7",
    href: "https://facebook.com/sabbirwithai7",
  },
];

const EMAIL_ADDRESS = "sakibulislam.rc@gmail.com";
const WHATSAPP_DISPLAY = "+880 1410 957 506";
const WHATSAPP_NUMBER = "8801410957506";

function ContactPage() {
  const [open, setOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState("A Reel / Short");
  const [details, setDetails] = useState("");

  const copyEmailAddress = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_ADDRESS);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const composedMessage = [
    `Hi Sakibulislam,`,
    ``,
    `Name: ${name.trim() || "Not specified"}`,
    `What I'm making: ${projectType}`,
    ``,
    `Project Brief:`,
    details.trim() || "(Sharing details soon)",
  ].join("\n");

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(composedMessage)}`;
  const emailSubject = `Project Inquiry: ${projectType}${name.trim() ? ` — ${name.trim()}` : ""}`;
  const mailtoHref = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(composedMessage)}`;

  const copyBriefText = async () => {
    try {
      await navigator.clipboard.writeText(composedMessage);
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2500);
    } catch {
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2500);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Subtle architectural ambient backdrop to showcase glassmorphism */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-foreground/[0.04] blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[460px] w-[460px] rounded-full bg-foreground/[0.03] blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-[380px] w-[380px] rounded-full bg-foreground/[0.035] blur-3xl" />
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
              const isActive = item.label === "Contact";
              const isInternal = item.href.startsWith("/");
              return isInternal ? (
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
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="relative shrink-0 whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 transition-all duration-200 hover:text-foreground"
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <PWAInstallButton variant="header" />
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90"
            >
              Quick Chat
            </a>
            <Link
              to="/account"
              aria-label="Account"
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border shadow-sm transition-transform duration-200 hover:scale-105"
            >
              <img
                src="https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png"
                alt="Profile"
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
        <MobileHeaderMenu open={open} activePath="/contact" onClose={() => setOpen(false)} />
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-28 sm:px-6 md:pb-24 md:pt-36 lg:px-8">
        {/* Hero Header */}
        <section className="mb-14 md:mb-20">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Contact
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight [text-wrap:balance] sm:text-5xl lg:text-7xl">
            Tell me what <span className="text-muted-foreground/80">you're making.</span>
          </h1>
        </section>

        {/* Primary Split: Direct Channels + Glassmorphism Project Brief Form */}
        <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Direct Contact Cards (Email & WhatsApp) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* Email Glass Card */}
            <article className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-background/65 p-6 shadow-xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl transition-all duration-200 hover:border-foreground/20 sm:p-8">
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Email
                  </span>
                  <Mail className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>

                <a
                  href={`mailto:${EMAIL_ADDRESS}`}
                  className="mb-3 block break-all font-display text-xl font-bold tracking-tight text-foreground transition-colors hover:text-muted-foreground sm:text-2xl"
                >
                  {EMAIL_ADDRESS}
                </a>

                <p className="mb-6 text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                  Best for project briefs, budgets and anything with attachments.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
                <span className="text-xs text-muted-foreground">Replies within 24 hours</span>

                <button
                  type="button"
                  onClick={copyEmailAddress}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-muted/70 px-5 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:bg-primary hover:text-primary-foreground active:scale-95"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied address
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy address
                    </>
                  )}
                </button>
              </div>
            </article>

            {/* WhatsApp Glass Card */}
            <article className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-background/65 p-6 shadow-xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl transition-all duration-200 hover:border-foreground/20 sm:p-8">
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    WhatsApp
                  </span>
                  <MessageCircle className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 block font-display text-xl font-bold tabular-nums tracking-tight text-foreground transition-colors hover:text-muted-foreground sm:text-2xl"
                >
                  {WHATSAPP_DISPLAY}
                </a>

                <p className="mb-6 text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                  The quickest way to reach me — good for quick questions and ongoing projects.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
                <span className="text-xs text-muted-foreground">Usually online</span>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-md shadow-black/10 transition-all duration-200 hover:opacity-90 active:scale-95"
                >
                  Open chat
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          </div>

          {/* Right Column: Glassmorphism Project Brief Form */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-border/90 bg-background/60 p-6 shadow-2xl shadow-black/[0.05] ring-1 ring-inset ring-foreground/[0.05] backdrop-blur-2xl sm:p-8 lg:p-10">
              {/* Subtle top-right glass refraction highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-foreground/[0.04] blur-2xl"
              />

              <div className="relative z-10">
                <div className="mb-8 border-b border-border/70 pb-6">
                  <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Project Brief
                  </p>
                  <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    Or write it <span className="text-muted-foreground/80">here.</span>
                  </h2>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  {/* Your name */}
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold tracking-wide text-foreground"
                    >
                      Your name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="h-12 w-full rounded-2xl border border-border/90 bg-muted/40 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 backdrop-blur-md transition-colors focus:border-foreground focus:bg-background/80 focus:outline-none"
                    />
                  </div>

                  {/* What are you making? */}
                  <div className="space-y-2.5">
                    <label
                      htmlFor="project-type"
                      className="block text-xs font-semibold tracking-wide text-foreground"
                    >
                      What are you making?
                    </label>

                    {/* Quick interactive selector buttons + accessible select */}
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_TYPES.map((type) => {
                        const active = projectType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setProjectType(type)}
                            className={`h-9 shrink-0 whitespace-nowrap rounded-xl border px-3.5 text-xs font-medium transition-all duration-150 ${
                              active
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border/80 bg-muted/40 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>

                    <input
                      id="project-type"
                      type="text"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      placeholder="A Reel / Short"
                      className="h-11 w-full rounded-2xl border border-border/80 bg-muted/30 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 backdrop-blur-md transition-colors focus:border-foreground focus:bg-background/80 focus:outline-none"
                    />
                  </div>

                  {/* Tell me about the project */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="project-details"
                        className="block text-xs font-semibold tracking-wide text-foreground"
                      >
                        Tell me about the project
                      </label>
                      <button
                        type="button"
                        onClick={copyBriefText}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {copiedBrief ? (
                          <>
                            <Check className="h-3 w-3" />
                            Brief copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy brief
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      id="project-details"
                      rows={5}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Goal, deadline, footage, references…"
                      className="w-full resize-y rounded-2xl border border-border/90 bg-muted/40 p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 backdrop-blur-md transition-colors focus:border-foreground focus:bg-background/80 focus:outline-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-lg shadow-black/10 transition-all duration-200 hover:scale-[1.01] hover:opacity-95 active:scale-95 sm:text-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Send via WhatsApp
                    </a>

                    <a
                      href={mailtoHref}
                      className="inline-flex h-12 flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-background/80 px-6 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:scale-[1.01] hover:bg-muted active:scale-95 sm:text-sm"
                    >
                      <Send className="h-4 w-4" />
                      Send via Email
                    </a>
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    This opens WhatsApp or your mail app with the message pre-filled — nothing is
                    stored on this website.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Elsewhere Section */}
        <section className="mt-20 border-t border-border/80 pt-16 md:mt-28 md:pt-20">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Elsewhere
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Find me <span className="text-muted-foreground/80">online.</span>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Tutorials, behind-the-scenes edits & creative workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.platform}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-background/60 p-6 shadow-lg shadow-black/[0.02] ring-1 ring-inset ring-foreground/[0.03] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-muted/40"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-display text-lg font-bold tracking-tight text-foreground">
                    {item.platform}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-muted/60 text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground">{item.handle}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{item.displayUrl}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-foreground" />
              <span>Based in Bangladesh — working with clients worldwide.</span>
            </div>
            <div className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Sakibulislam</span>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activePath="/contact" />
    </div>
  );
}
