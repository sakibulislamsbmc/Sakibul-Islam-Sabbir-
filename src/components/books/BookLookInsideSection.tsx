import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Lock,
  Maximize2,
  ShoppingCart,
} from "lucide-react";

import type { BookItem } from "../../data/books-data";
import { BookCoverArt } from "./BookCoverArt";

interface BookLookInsideSectionProps {
  paidBooks: BookItem[];
  isBookUnlocked: (book: BookItem) => boolean;
  getBookStatus: (book: BookItem) => "Verified" | "Pending Verification" | "Rejected" | null;
  onOpenPdfPreview: (book: BookItem) => void;
  onOpenFullReader: (book: BookItem) => void;
  onOrderBook: (book: BookItem) => void;
}

export function BookLookInsideSection({
  paidBooks,
  isBookUnlocked,
  getBookStatus,
  onOpenPdfPreview,
  onOpenFullReader,
  onOrderBook,
}: BookLookInsideSectionProps) {
  const [selectedBookId, setSelectedBookId] = useState<string>(paidBooks[0]?.id ?? "");
  const [activeSampleIdx, setActiveSampleIdx] = useState(0);

  if (paidBooks.length === 0) return null;

  const book = paidBooks.find((b) => b.id === selectedBookId) ?? paidBooks[0];
  const samplePages = book.samplePages ?? [];
  const totalSampleViews = samplePages.length + 1; // +1 for the Rokomari-style locked teaser page
  const clampedIdx = Math.min(activeSampleIdx, Math.max(0, totalSampleViews - 1));
  const currentSample = clampedIdx < samplePages.length ? samplePages[clampedIdx] : null;

  const unlocked = isBookUnlocked(book);
  const status = getBookStatus(book);

  return (
    <section
      id="look-inside-preview"
      className="mt-14 overflow-hidden rounded-[32px] border border-neutral-200/90 bg-white shadow-[0_12px_40px_-18px_rgba(15,23,42,0.12)] dark:border-border dark:bg-card"
    >
      {/* Top Editorial Header (Rokomari / Wafilife Look Inside Inspiration) */}
      <div className="flex flex-col gap-4 border-b border-neutral-200/80 bg-neutral-50/75 px-6 py-6 dark:border-border/70 dark:bg-secondary/20 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
            <BookOpen className="h-3.5 w-3.5" />
            <span>LOOK INSIDE • একটু পড়ে দেখুন</span>
          </div>
          <h3 className="mt-2 font-['Hind_Siliguri'] text-2xl font-bold tracking-tight text-neutral-950 dark:text-foreground sm:text-3xl">
            প্রিমিয়াম বই — কেনার আগে কিছু পৃষ্ঠা পড়ে দেখুন
          </h3>
          <p className="mt-1.5 max-w-2xl font-['Hind_Siliguri'] text-sm leading-relaxed text-neutral-600 dark:text-muted-foreground">
            রকমারি ও ওয়াফিলাইফের মতো পেইড বই অর্ডার করার আগেই ভূমিকা, সূচিপত্র এবং প্রথম অধ্যায়ের
            নমুনা পৃষ্ঠাগুলো বিনামূল্যে পড়ে বইয়ের মান যাচাই করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {paidBooks.length > 1 &&
            paidBooks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedBookId(item.id);
                  setActiveSampleIdx(0);
                }}
                className={`inline-flex h-9 items-center rounded-xl border px-3.5 font-['Hind_Siliguri'] text-xs font-semibold transition-colors ${
                  item.id === book.id
                    ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-border dark:bg-card dark:text-muted-foreground"
                }`}
              >
                {item.title}
              </button>
            ))}

          <button
            type="button"
            onClick={() => (unlocked ? onOpenFullReader(book) : onOpenPdfPreview(book))}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-900 bg-neutral-950 px-4 font-['Hind_Siliguri'] text-xs font-semibold text-white transition-colors hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>
              {unlocked ? "ফুল-স্ক্রিন সম্পূর্ণ বই পড়ুন" : "ফুল-স্ক্রিন PDF প্রিভিউ খুলুন"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Split Preview Area: Book Info & TOC (Left) + Interactive Sample Page Sheet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Sidebar: Cover + Table of Contents (Sample vs Locked chapters) */}
        <div className="border-b border-neutral-200/80 p-6 dark:border-border/70 lg:col-span-4 lg:border-r lg:border-b-0 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="w-24 shrink-0 overflow-hidden rounded-xl border border-neutral-200 shadow-sm dark:border-border">
              <BookCoverArt book={book} showBadge={false} />
            </div>
            <div className="min-w-0 font-['Hind_Siliguri']">
              <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                PAID EBOOK
              </span>
              <h4 className="mt-1.5 text-lg font-bold leading-snug text-neutral-950 dark:text-foreground">
                {book.title}
              </h4>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-muted-foreground">
                {book.authorBn}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-['Outfit'] text-xl font-bold tabular-nums text-neutral-950 dark:text-foreground">
                  ৳{book.priceBdt}
                </span>
                {book.regularPriceBdt && (
                  <span className="font-mono text-xs tabular-nums text-neutral-400 line-through">
                    ৳{book.regularPriceBdt}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Table of Contents (সূচিপত্র) */}
          <div className="mt-6 border-t border-neutral-200/80 pt-5 dark:border-border/70">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-muted-foreground">
              সূচিপত্র • TABLE OF CONTENTS
            </p>
            <ul className="mt-3 space-y-2">
              {book.tableOfContents.map((chapter, idx) => {
                const isFreeChapter = idx === 0;
                const canReadChapter = unlocked || isFreeChapter;
                return (
                  <li
                    key={chapter}
                    onClick={() => {
                      if (isFreeChapter) {
                        setActiveSampleIdx(Math.min(1, samplePages.length - 1));
                      } else if (unlocked) {
                        onOpenFullReader(book);
                      } else {
                        setActiveSampleIdx(samplePages.length);
                      }
                    }}
                    className={`flex cursor-pointer items-start justify-between gap-2.5 rounded-xl border px-3 py-2.5 text-xs transition-colors ${
                      canReadChapter
                        ? "border-emerald-200/80 bg-emerald-50/50 text-neutral-800 hover:bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-foreground"
                        : "border-neutral-200/70 bg-neutral-50/70 text-neutral-500 hover:border-neutral-300 dark:border-border/70 dark:bg-secondary/20 dark:text-muted-foreground"
                    }`}
                  >
                    <span className="font-['Hind_Siliguri'] leading-snug">{chapter}</span>
                    {unlocked ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : isFreeChapter ? (
                      <span className="shrink-0 rounded-md bg-emerald-600 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-white">
                        FREE
                      </span>
                    ) : (
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right Interactive Sample Reader Desk (Warm Book Paper Sheet) */}
        <div className="flex flex-col justify-between bg-[#f4f1ea]/80 p-5 dark:bg-neutral-950/50 sm:p-8 lg:col-span-8">
          {/* Page Selector Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {samplePages.map((sp, idx) => (
                <button
                  key={sp.pageNumber}
                  type="button"
                  onClick={() => setActiveSampleIdx(idx)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 font-['Hind_Siliguri'] text-xs font-semibold transition-all ${
                    clampedIdx === idx
                      ? "border-neutral-950 bg-neutral-950 text-white shadow-xs dark:border-white dark:bg-white dark:text-neutral-950"
                      : "border-neutral-300/80 bg-white/90 text-neutral-700 hover:bg-white dark:border-border dark:bg-card dark:text-muted-foreground"
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  <span>{sp.labelBn}</span>
                </button>
              ))}
              {!unlocked && (
                <button
                  type="button"
                  onClick={() => setActiveSampleIdx(samplePages.length)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 font-['Hind_Siliguri'] text-xs font-semibold transition-all ${
                    clampedIdx === samplePages.length
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-amber-300/80 bg-amber-50/90 text-amber-800 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                  }`}
                >
                  <Lock className="h-3 w-3" />
                  <span>পৃষ্ঠা ০৩+ (লকড)</span>
                </button>
              )}
            </div>

            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-muted-foreground">
              SAMPLE {clampedIdx + 1} / {unlocked ? samplePages.length : totalSampleViews}
            </span>
          </div>

          {/* Book Sheet Paper Container */}
          <div className="relative min-h-[340px] flex-1 overflow-hidden rounded-2xl border border-neutral-200/90 bg-[#fffdf9] p-6 shadow-[0_14px_38px_-14px_rgba(15,23,42,0.16)] dark:border-border dark:bg-[#13151c] sm:p-8">
            {currentSample ? (
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3 dark:border-white/10">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">
                      {currentSample.chapterTag}
                    </span>
                    <span className="font-mono text-[10px] font-semibold tabular-nums text-neutral-400">
                      PAGE 0{currentSample.pageNumber}
                    </span>
                  </div>

                  <h4 className="mt-5 font-['Hind_Siliguri'] text-xl font-bold leading-snug text-neutral-950 dark:text-white sm:text-2xl">
                    {currentSample.headingBn}
                  </h4>
                  <p className="mt-1 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                    {currentSample.headingEn}
                  </p>

                  <p className="mt-4 font-['Hind_Siliguri'] text-[15px] leading-[1.85] text-neutral-700 dark:text-neutral-300">
                    {currentSample.excerptBn}
                  </p>

                  <div className="mt-5 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                      এই পৃষ্ঠার মূল শিক্ষণীয় বিষয়
                    </p>
                    <ul className="mt-2.5 space-y-2 font-['Hind_Siliguri'] text-sm text-neutral-800 dark:text-neutral-200">
                      {currentSample.keyPointsBn.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/80 pt-3 font-mono text-[10px] text-neutral-400 dark:border-white/10">
                  <span>{book.authorEn} • Bismahsoft Academy</span>
                  <span>FREE LOOK-INSIDE PREVIEW</span>
                </div>
              </div>
            ) : (
              /* Locked Page 3+ Unlock Gate (Rokomari / Wafilife style blurred teaser) */
              <div className="relative flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                {/* Blurred background text illusion */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 select-none space-y-4 overflow-hidden opacity-25 blur-[4px]"
                >
                  <div className="h-5 w-2/3 rounded bg-neutral-400" />
                  <div className="h-3 w-full rounded bg-neutral-300" />
                  <div className="h-3 w-11/12 rounded bg-neutral-300" />
                  <div className="h-3 w-4/5 rounded bg-neutral-300" />
                  <div className="h-24 w-full rounded-xl bg-neutral-200" />
                  <div className="h-3 w-10/12 rounded bg-neutral-300" />
                  <div className="h-3 w-3/4 rounded bg-neutral-300" />
                </div>

                <div className="relative z-10 max-w-md rounded-2xl border border-neutral-200/90 bg-white/95 p-6 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-neutral-900/90">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                    {status === "Pending Verification" ? (
                      <Clock className="h-5 w-5 text-amber-400 dark:text-amber-600" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>

                  <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                    {status === "Pending Verification"
                      ? "PENDING ADMIN VERIFICATION"
                      : "PREMIUM CHAPTERS LOCKED"}
                  </p>
                  <h4 className="mt-1.5 font-['Hind_Siliguri'] text-xl font-bold text-neutral-950 dark:text-white">
                    {status === "Pending Verification"
                      ? "আপনার অর্ডারটি ভেরিফিকেশনের অপেক্ষায় আছে"
                      : "বাকি অধ্যায়গুলো পড়তে সম্পূর্ণ বইটি কিনুন"}
                  </h4>
                  <p className="mt-2 font-['Hind_Siliguri'] text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {status === "Pending Verification"
                      ? "আপনার TrxID জমা হয়েছে। অ্যাডমিন পেমেন্ট যাচাই করে অ্যাপ্রুভ করলেই আপনার গুগল একাউন্টে সম্পূর্ণ বইটি স্বয়ংক্রিয়ভাবে আনলক হয়ে যাবে।"
                      : `গুগল একাউন্ট দিয়ে লগইন করে বিকাশ, নগদ, রকেট বা ব্যাংক একাউন্টের মাধ্যমে মাত্র ৳${book.priceBdt} টাকায় অর্ডার করুন। অ্যাডমিন TrxID যাচাই করে অ্যাপ্রুভ করলেই সব পৃষ্ঠা আনলক হয়ে যাবে।`}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onOrderBook(book)}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-950 px-5 font-['Hind_Siliguri'] text-xs font-bold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>
                        {status === "Pending Verification"
                          ? "অর্ডার স্ট্যাটাস দেখুন"
                          : `বইটি কিনুন — ৳${book.priceBdt}`}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenPdfPreview(book)}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 font-['Hind_Siliguri'] text-xs font-semibold text-neutral-900 hover:bg-neutral-50 dark:border-border dark:bg-secondary/40 dark:text-white"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>PDF প্রিভিউ পড়ুন</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Prev / Next Sample Page Navigation */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={clampedIdx <= 0}
              onClick={() => setActiveSampleIdx((i) => Math.max(0, i - 1))}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-neutral-300/80 bg-white/90 px-4 font-['Hind_Siliguri'] text-xs font-semibold text-neutral-900 shadow-xs backdrop-blur-md transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-border dark:bg-card dark:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>আগের নমুনা পাতা</span>
            </button>

            <button
              type="button"
              onClick={() => (unlocked ? onOpenFullReader(book) : onOrderBook(book))}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-4 font-['Hind_Siliguri'] text-xs font-bold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            >
              {unlocked ? (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>সম্পূর্ণ বই পড়ুন</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>অর্ডার করুন — ৳{book.priceBdt}</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={clampedIdx >= (unlocked ? samplePages.length - 1 : totalSampleViews - 1)}
              onClick={() =>
                setActiveSampleIdx((i) =>
                  Math.min(unlocked ? samplePages.length - 1 : totalSampleViews - 1, i + 1),
                )
              }
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-neutral-300/80 bg-white/90 px-4 font-['Hind_Siliguri'] text-xs font-semibold text-neutral-900 shadow-xs backdrop-blur-md transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-border dark:bg-card dark:text-foreground"
            >
              <span>পরের নমুনা পাতা</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
