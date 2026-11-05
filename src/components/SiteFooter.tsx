import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Mail } from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="relative z-10 w-full border-t border-border bg-background pb-24 pt-16 text-foreground md:py-20">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col justify-between gap-12 md:flex-row md:items-start">
          {/* Left Column: Brand, Tagline, Socials, Divider, Copyright */}
          <div className="w-full max-w-xl">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/"
                className="inline-block font-display text-2xl font-bold tracking-tighter text-foreground"
              >
                SS.
              </Link>
              <PWAInstallButton variant="header" />
            </div>

            <p className="mt-4 max-w-sm text-[11px] font-medium uppercase leading-[1.85] tracking-[0.08em] text-foreground/80">
              BUILDING DIGITAL EXPERIENCES AT THE INTERSECTION OF DESIGN, ENGINEERING, AND
              ARTIFICIAL INTELLIGENCE.
            </p>

            {/* Social & Contact Icons */}
            <div className="mt-7 flex items-center gap-6 text-foreground/75">
              {/* GitHub */}
              <a
                href="https://www.youtube.com/@sakibulislamrc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub / YouTube"
                className="transition-colors hover:text-foreground"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.instagram.com/sakibulislamrc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn / Instagram"
                className="transition-colors hover:text-foreground"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              {/* Twitter */}
              <a
                href="https://www.instagram.com/sakibulislamrc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="transition-colors hover:text-foreground"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/sabbirwithai7"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="transition-colors hover:text-foreground"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:sakibulislam.rc@gmail.com"
                aria-label="Email Sakibul Islam"
                className="transition-colors hover:text-foreground"
              >
                <Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </a>
            </div>

            {/* Subtle horizontal rule matching the reference image */}
            <div className="mt-8 h-px w-full bg-border" />

            {/* Copyright Line */}
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/85">
              © 2026 SAKIBUL ISLAM / ALL RIGHTS RESERVED
            </p>
          </div>

          {/* Right Column: Newsletter */}
          <div className="w-full md:w-[380px]">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/75">
              NEWSLETTER
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex h-14 w-full items-center rounded-2xl border border-border bg-muted/40 pl-4 pr-2 transition-colors focus-within:border-foreground/40 focus-within:bg-background"
            >
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={subscribed ? "SUBSCRIBED — THANK YOU!" : "ENTER YOUR EMAIL"}
                aria-label="Enter your email for newsletter"
                className="h-full flex-1 bg-transparent px-3 text-xs font-medium uppercase tracking-[0.12em] text-foreground placeholder:text-foreground/65 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                {subscribed ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
