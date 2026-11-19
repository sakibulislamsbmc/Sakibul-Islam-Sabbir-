import { useState } from "react";
import { Check, Copy, Link2, Share2, X } from "lucide-react";

import type { BookItem } from "../../data/books-data";

interface BookShareModalProps {
  book: BookItem | null;
  onClose: () => void;
}

export function BookShareModal({ book, onClose }: BookShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!book) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/books?book=${encodeURIComponent(book.slug)}`;
  const shareText = `${book.title} — লেখক: ${book.authorBn}। পূর্বমূল্য ৳${book.regularPriceBdt ?? 80} কেটে এখন সম্পূর্ণ ফ্রি পড়ুন ওয়েবসাইটেই:`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedFull = encodeURIComponent(`${shareText} ${shareUrl}`);

  const socialChannels = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      bg: "bg-[#1877F2] text-white hover:bg-[#166fe5]",
      short: "FB",
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedFull}`,
      bg: "bg-[#25D366] text-neutral-950 hover:bg-[#20bd5a]",
      short: "WA",
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      bg: "bg-[#229ED9] text-white hover:bg-[#1d8ec4]",
      short: "TG",
    },
    {
      name: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      bg: "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950",
      short: "X",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: "bg-[#0A66C2] text-white hover:bg-[#0958a8]",
      short: "IN",
    },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard fallback ignored if restricted
    }
  }

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: book.title,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled native share sheet
      }
    }
  }

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Share book on social media"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[28px] border border-neutral-200 bg-white p-6 shadow-2xl dark:border-border dark:bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-border dark:text-muted-foreground dark:hover:bg-secondary"
          aria-label="Close share dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
            <Share2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              SHARE BOOK
            </p>
            <h3 className="font-['Hind_Siliguri'] text-lg font-bold text-neutral-950 dark:text-foreground">
              সোশ্যাল মিডিয়াতে শেয়ার করুন
            </h3>
          </div>
        </div>

        <p className="mt-3 font-['Hind_Siliguri'] text-xs leading-relaxed text-neutral-600 dark:text-muted-foreground">
          লিংকটি শেয়ার করলে সবাই সরাসরি আমাদের ওয়েবসাইটের সুরক্ষিত রিডারে এসে{" "}
          <strong className="text-neutral-900 dark:text-foreground">{book.title}</strong> বইটি
          ফ্রিতে পড়তে পারবেন।
        </p>

        {/* Social Media Channels Grid */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {socialChannels.map((ch) => (
            <a
              key={ch.name}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition-colors ${ch.bg}`}
            >
              <span className="font-mono text-[10px] font-bold opacity-85">{ch.short}</span>
              <span>{ch.name}</span>
            </a>
          ))}

          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 dark:border-border dark:bg-secondary dark:text-foreground"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>More Apps</span>
            </button>
          )}
        </div>

        {/* Copy Direct Website Link */}
        <div className="mt-5">
          <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Official Website Book Link
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1.5 dark:border-border dark:bg-secondary/40">
            <div className="flex min-w-0 flex-1 items-center gap-2 pl-2">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <span className="truncate font-mono text-xs text-neutral-700 dark:text-muted-foreground">
                {shareUrl}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-neutral-950 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
