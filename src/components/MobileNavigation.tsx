import { Link } from "@tanstack/react-router";
import { Award, BookOpen, Heart, House, Layers, Mail, User, type LucideIcon } from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";

type MobileNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: "Home", href: "/", icon: House },
  { label: "Projects", href: "/projects", icon: Layers },
  { label: "Portfolio", href: "/portfolio", icon: BookOpen },
  { label: "About Me", href: "/about-me", icon: Award },
  { label: "Thankful", href: "/thankful", icon: Heart },
  { label: "Contact", href: "/contact", icon: Mail },
  { label: "Profile", href: "/account", icon: User },
];

export function MobileHeaderMenu({
  open,
  activePath,
  onClose,
}: {
  open: boolean;
  activePath: string;
  onClose?: () => void;
}) {
  if (!open) return null;

  return (
    <nav
      aria-label="Mobile menu"
      className="absolute inset-x-0 top-16 z-[60] border-b border-border bg-background/95 p-4 shadow-2xl backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex max-w-md flex-col gap-1.5">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              onClick={onClose}
              className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-primary font-bold text-primary-foreground shadow-sm"
                  : "font-semibold text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    isActive
                      ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
                      : "border-border/80 bg-muted/50 text-foreground/80"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </span>
                <span>{item.label}</span>
              </span>
              {isActive && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground" />
              )}
            </Link>
          );
        })}
        <div className="mt-1 border-t border-border/70 pt-2.5">
          <PWAInstallButton variant="mobile-menu" />
        </div>
      </div>
    </nav>
  );
}

export function MobileBottomNav({ activePath }: { activePath: string }) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-3 left-1/2 z-[60] w-[calc(100%-1rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-border/90 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl md:hidden"
    >
      <div className="grid grid-cols-7 items-center gap-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-center transition-all duration-200 sm:flex-row sm:gap-1.5 sm:px-2 sm:py-2 ${
                isActive
                  ? "bg-primary font-bold text-primary-foreground shadow-md"
                  : "font-medium text-foreground/75 hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="max-w-full truncate text-[9px] leading-none tracking-tight sm:text-[10px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
