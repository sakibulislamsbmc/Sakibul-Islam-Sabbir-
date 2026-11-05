import { useState } from "react";
import { Check, Download, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function PWAInstallButton({
  variant = "header",
  className = "",
}: {
  variant?: "header" | "hero" | "mobile-menu";
  className?: string;
}) {
  const { isInstalled, justInstalled, isIOS, installApp } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (isInstalled && !justInstalled) {
    return null;
  }

  const handleOneClickInstall = async () => {
    if (installing) return;
    setInstalling(true);
    const result = await installApp();
    setInstalling(false);

    if (result === "fallback") {
      setShowModal(true);
    }
  };

  const buttonStyles =
    variant === "hero"
      ? "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground active:scale-95 md:h-12 md:px-7 md:text-sm"
      : variant === "mobile-menu"
        ? "flex w-full items-center justify-between rounded-2xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md transition-all hover:opacity-95 active:scale-[0.99]"
        : "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-muted/80 px-3.5 text-xs font-semibold text-foreground shadow-sm transition-all duration-200 hover:bg-primary hover:text-primary-foreground active:scale-95";

  return (
    <>
      <button
        type="button"
        onClick={handleOneClickInstall}
        aria-label="Install Android App"
        className={`${buttonStyles} ${className}`}
      >
        {variant === "mobile-menu" ? (
          <>
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
                {justInstalled ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <Smartphone className="h-4 w-4 shrink-0" />
                )}
              </span>
              <span>{justInstalled ? "Android App Installed" : "Install Android App"}</span>
            </span>
            <Download className="h-4 w-4 shrink-0 opacity-80" />
          </>
        ) : (
          <>
            {justInstalled ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Smartphone className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{justInstalled ? "App Installed" : "Install Android App"}</span>
          </>
        )}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 text-foreground shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              aria-label="Close install dialog"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <img
                src="/pwa-192x192.png"
                alt="SS. App Icon"
                className="h-14 w-14 shrink-0 rounded-2xl border border-border object-cover shadow-md"
              />
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Android &amp; Mobile Web App
                </span>
                <h3 className="font-display text-xl font-bold tracking-tight">
                  SS. — Sakibul Islam Sabbir
                </h3>
              </div>
            </div>

            <p className="mt-4 text-xs font-light leading-relaxed text-muted-foreground sm:text-sm">
              Install our lightweight mobile app directly onto your Android home screen for instant,
              full-screen access and offline support.
            </p>

            <div className="mt-4 space-y-2.5 rounded-2xl border border-border/80 bg-muted/40 p-4 text-xs text-foreground">
              {isIOS ? (
                <>
                  <p className="font-semibold">Quick Install on iPhone / iPad:</p>
                  <p className="text-muted-foreground">
                    1. Tap the <strong className="text-foreground">Share</strong> icon in your
                    browser bar.
                  </p>
                  <p className="text-muted-foreground">
                    2. Select <strong className="text-foreground">Add to Home Screen</strong> and
                    tap <strong className="text-foreground">Add</strong>.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold">One-Tap Android Installation:</p>
                  <p className="text-muted-foreground">
                    1. If viewing inside an embedded preview, tap{" "}
                    <strong className="text-foreground">Open Direct App Link</strong> below, or open
                    your browser menu (<strong className="text-foreground">⋮</strong>).
                  </p>
                  <p className="text-muted-foreground">
                    2. Tap <strong className="text-foreground">Install app</strong> or{" "}
                    <strong className="text-foreground">Add to Home screen</strong> to launch it
                    like a native Android app.
                  </p>
                </>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowModal(false)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" />
                Open Direct App Link
              </a>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
