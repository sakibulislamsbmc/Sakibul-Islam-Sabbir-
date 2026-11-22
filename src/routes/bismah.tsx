import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { BismahAudioPlayerApp } from "@/components/bismah/BismahAudioPlayerApp";
import { MobileBottomNav } from "@/components/MobileNavigation";

export const Route = createFileRoute("/bismah")({
  head: () => ({
    meta: [
      { title: "Bismah — Audio Book & Offline Player | Sakibul Islam Sabbir" },
      {
        name: "description",
        content:
          "Bismah Audio Book player inside Sakibul Islam Sabbir's Education platform. Paste YouTube video or playlist links, download tracks for offline listening, customize themes, and control speed (0.75x-2.0x), loop mode, and sleep timer with no sign-in required.",
      },
      { property: "og:title", content: "Bismah — Audio Book & Offline Player" },
      {
        property: "og:description",
        content:
          "Clean, minimalist YouTube video & playlist audio book player with offline downloads, theme customizer, playback speed (0.75x-2.0x), loop mode, and sleep timer.",
      },
    ],
  }),
  component: BismahStandalonePage,
});

function BismahStandalonePage() {
  return (
    <div className="min-h-screen bg-background pb-24 pt-6 text-foreground">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Link
              to="/education"
              search={{ section: "bismah" }}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Education</span>
            </Link>
            <Link
              to="/education"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>All Sections</span>
            </Link>
          </div>

          <p className="font-mono text-xs text-muted-foreground">
            Education · 04. Bismah Audio Book
          </p>
        </div>

        <BismahAudioPlayerApp fullHeight />
      </div>

      <MobileBottomNav activePath="/education" />
    </div>
  );
}
