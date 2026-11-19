import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  Loader2,
  Lock,
  Maximize2,
  Share2,
  ShieldCheck,
  ShoppingCart,
  WifiOff,
  X,
} from "lucide-react";

import { BOOKS_CATALOG, BOOK_PAYMENT_ACCOUNT, type BookItem } from "../../data/books-data";
import {
  auth,
  BILLING_METHODS,
  db,
  isPrimaryAdminUser,
  signInWithGoogle,
  type BillingMethod,
  type BookPurchaseRecord,
} from "../../lib/firebase";
import { submitPaidBookOrder } from "../../lib/book-purchases";
import {
  fetchSecureBookBytes,
  formatBytesMb,
  listOfflineBooksMeta,
  removeOfflineBook,
  saveBookOffline,
  type OfflineBookMeta,
} from "../../lib/offline-book-storage";
import { BookCoverArt } from "./BookCoverArt";
import { BookShareModal } from "./BookShareModal";
import { InSitePdfReaderModal } from "./InSitePdfReaderModal";

interface BooksShowcaseSectionProps {
  showStandaloneLink?: boolean;
  compactTop?: boolean;
  highlightedBookSlug?: string;
}

type BookFilterTab = "all" | "free" | "paid";

export function BooksShowcaseSection({
  showStandaloneLink = false,
  compactTop = false,
  highlightedBookSlug,
}: BooksShowcaseSectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [purchasesByBookId, setPurchasesByBookId] = useState<Record<string, BookPurchaseRecord>>(
    {},
  );
  const [filterTab, setFilterTab] = useState<BookFilterTab>("all");

  // Offline saved books metadata from IndexedDB Vault
  const [offlineMap, setOfflineMap] = useState<Record<string, OfflineBookMeta>>({});
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  // Modals
  const [detailsBook, setDetailsBook] = useState<BookItem | null>(null);
  const [activeReaderState, setActiveReaderState] = useState<{
    book: BookItem;
    preview: boolean;
  } | null>(null);
  const [shareBook, setShareBook] = useState<BookItem | null>(null);
  const [orderBook, setOrderBook] = useState<BookItem | null>(null);

  // Order form state
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<BillingMethod>("bKash");
  const [paymentReference, setPaymentReference] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const isAdmin = isPrimaryAdminUser(user);

  const freeCount = useMemo(() => BOOKS_CATALOG.filter((b) => b.accessType === "free").length, []);
  const paidCount = useMemo(() => BOOKS_CATALOG.filter((b) => b.accessType === "paid").length, []);

  const visibleBooks = useMemo(() => {
    if (filterTab === "free") return BOOKS_CATALOG.filter((b) => b.accessType === "free");
    if (filterTab === "paid") return BOOKS_CATALOG.filter((b) => b.accessType === "paid");
    return BOOKS_CATALOG;
  }, [filterTab]);

  // Load saved offline books index on mount
  useEffect(() => {
    void listOfflineBooksMeta().then(setOfflineMap);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (nextUser?.displayName) {
        setBuyerName((prev) => prev || nextUser.displayName || "");
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !user.emailVerified) {
      setPurchasesByBookId({});
      return;
    }

    const q = query(collection(db, "bookPurchases"), where("uid", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const nextMap: Record<string, BookPurchaseRecord> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<BookPurchaseRecord, "id">;
          nextMap[data.bookId] = { id: docSnap.id, ...data };
        });
        setPurchasesByBookId(nextMap);
      },
      (err) => {
        console.error("Failed to listen to book purchases:", err);
      },
    );
    return () => unsub();
  }, [user]);

  function hasFullAccessForBook(book: BookItem): boolean {
    if (book.accessType === "free") return true;
    if (isAdmin) return true;
    const purchase = purchasesByBookId[book.id];
    return purchase?.paymentStatus === "Verified";
  }

  function openFullscreenReader(book: BookItem, preview = false) {
    // Request browser Fullscreen inside user click gesture so browsers grant fullscreen smoothly
    if (
      typeof document !== "undefined" &&
      !document.fullscreenElement &&
      typeof document.documentElement.requestFullscreen === "function"
    ) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fallback to full-viewport overlay on browsers without Fullscreen API (e.g. iOS Safari)
      });
    }
    setActiveReaderState({ book, preview });
  }

  async function handleOfflineToggle(book: BookItem) {
    if (downloadingBookId) return;
    setOfflineNotice(null);

    if (offlineMap[book.id]) {
      try {
        await removeOfflineBook(book.id);
        setOfflineMap((prev) => {
          const next = { ...prev };
          delete next[book.id];
          return next;
        });
        setOfflineNotice("অফলাইন কপি মুছে ফেলা হয়েছে।");
      } catch {
        setOfflineNotice("অফলাইন কপি মুছতে সমস্যা হয়েছে।");
      }
      window.setTimeout(() => setOfflineNotice(null), 3500);
      return;
    }

    setDownloadingBookId(book.id);
    setDownloadProgress(8);
    try {
      const bytes = await fetchSecureBookBytes(book.secureStreamUrl, (pct) => {
        setDownloadProgress(pct);
      });
      const meta = await saveBookOffline(book.id, book.title, bytes);
      setOfflineMap((prev) => ({ ...prev, [book.id]: meta }));
      setOfflineNotice(
        `"${book.title}" অফলাইনে সেভ হয়েছে (${formatBytesMb(meta.sizeBytes)})! এখন ইন্টারনেট ছাড়াই যেকোনো সময় ওয়েবসাইটে পড়তে পারবেন।`,
      );
    } catch (err) {
      setOfflineNotice(
        err instanceof Error
          ? err.message
          : "অফলাইনে ডাউনলোড করা যায়নি। ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।",
      );
    } finally {
      setDownloadingBookId(null);
      setDownloadProgress(0);
      window.setTimeout(() => setOfflineNotice(null), 5000);
    }
  }

  function openOrderModal(book: BookItem) {
    setOrderBook(book);
    setOrderError(null);
    setOrderSuccessMessage(null);
    const existing = purchasesByBookId[book.id];
    if (existing) {
      setBuyerName(existing.buyerName || user?.displayName || "");
      setBuyerPhone(existing.buyerPhone || "");
      setPaymentMethod(existing.paymentMethod || "bKash");
      setPaymentReference(existing.paymentStatus === "Rejected" ? "" : existing.paymentReference);
    } else {
      setBuyerName(user?.displayName || "");
      setPaymentReference("");
    }
  }

  async function handleGoogleLoginForOrder() {
    setSigningIn(true);
    setOrderError(null);
    try {
      const cred = await signInWithGoogle();
      if (cred.user.displayName) {
        setBuyerName((prev) => prev || cred.user.displayName || "");
      }
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : "Google Sign-In সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।",
      );
    } finally {
      setSigningIn(false);
    }
  }

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderBook) return;
    if (!user || !user.emailVerified) {
      setOrderError(
        "বই অর্ডার করার জন্য প্রথমে আপনার ভেরিফায়েড Google অ্যাকাউন্ট দিয়ে সাইন-ইন করুন।",
      );
      return;
    }

    setSubmittingOrder(true);
    setOrderError(null);
    setOrderSuccessMessage(null);
    try {
      const result = await submitPaidBookOrder(user, orderBook, {
        buyerName,
        buyerPhone,
        paymentMethod,
        paymentReference,
      });

      if (result.status === "Verified") {
        setOrderSuccessMessage(
          "আপনার এই বইটি ইতিমধ্যেই ভেরিফায়েড আছে! এখনই সম্পূর্ণ বইটি পড়তে পারবেন।",
        );
      } else {
        setOrderSuccessMessage(
          "আপনার অর্ডার ও Transaction ID সফলভাবে জমা হয়েছে (Pending Verification)। অ্যাডমিন ভেরিফিকেশনের পরপরই সম্পূর্ণ বইটি এখানে আনলক হয়ে যাবে।",
        );
      }
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : "অর্ডার জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      );
    } finally {
      setSubmittingOrder(false);
    }
  }

  async function handleCopyPaymentNumber() {
    try {
      await navigator.clipboard.writeText(BOOK_PAYMENT_ACCOUNT.bkashNumber);
      setCopiedNumber(true);
      window.setTimeout(() => setCopiedNumber(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  }

  return (
    <div className={compactTop ? "pt-2" : ""}>
      {/* Editorial Header */}
      <div className="border-b border-neutral-200/80 pb-8 dark:border-border/70">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-muted-foreground">
              / INDEX / BOOKS
            </p>
            <h2 className="mt-3 text-4xl leading-[1.08] tracking-tight text-neutral-950 dark:text-foreground sm:text-5xl">
              <span className="font-['Outfit'] font-bold">Published</span>{" "}
              <span className="font-['Playfair_Display'] font-medium italic text-neutral-700 dark:text-neutral-300">
                Works
              </span>
            </h2>
            <p className="mt-4 font-['Hind_Siliguri'] text-base leading-relaxed text-neutral-600 dark:text-muted-foreground sm:text-[17px]">
              আমার লেখা ফ্রি ও প্রিমিয়াম ই-বুকগুলো সুরক্ষিত ফুল-স্ক্রিন রিডারে সরাসরি ওয়েবসাইটের
              ভেতর থেকেই পড়ুন — জুম ইন/আউট, ডানে-বামে ও উপরে-নিচে স্ক্রল এবং অফলাইন রিডিং সুবিধাসহ।
            </p>
          </div>

          {showStandaloneLink && (
            <Link
              to="/books"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-900 shadow-xs transition-colors hover:bg-neutral-50 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-secondary/60"
            >
              <span>Full Library</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* Filter Controls & Security Info Row */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {BOOKS_CATALOG.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`inline-flex h-9 items-center rounded-xl border px-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  filterTab === "all"
                    ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                    : "border-neutral-200 bg-white text-neutral-600 hover:text-neutral-950 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:text-foreground"
                }`}
              >
                All Books ({BOOKS_CATALOG.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("free")}
                className={`inline-flex h-9 items-center rounded-xl border px-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  filterTab === "free"
                    ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                    : "border-neutral-200 bg-white text-neutral-600 hover:text-neutral-950 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:text-foreground"
                }`}
              >
                Free ({freeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("paid")}
                className={`inline-flex h-9 items-center rounded-xl border px-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  filterTab === "paid"
                    ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                    : "border-neutral-200 bg-white text-neutral-600 hover:text-neutral-950 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:text-foreground"
                }`}
              >
                Paid ({paidCount})
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-neutral-500 dark:text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              PROTECTED IN-SITE FULLSCREEN READER
            </span>
            <span className="inline-flex items-center gap-1.5">
              <WifiOff className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
              OFFLINE READING VAULT
            </span>
          </div>
        </div>
      </div>

      {/* Offline Action Toast Feedback */}
      {offlineNotice && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-['Hind_Siliguri'] text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {offlineNotice}
        </div>
      )}

      {/* Book Cards Grid */}
      <div
        className={`mt-10 grid gap-7 ${
          visibleBooks.length === 1
            ? "grid-cols-1 sm:max-w-[420px]"
            : "grid-cols-1 md:grid-cols-2 lg:max-w-[880px]"
        }`}
      >
        {visibleBooks.map((book) => {
          const purchase = purchasesByBookId[book.id];
          const isUnlocked = hasFullAccessForBook(book);
          const isPending =
            book.accessType === "paid" &&
            !isUnlocked &&
            purchase?.paymentStatus === "Pending Verification";
          const isRejected =
            book.accessType === "paid" && !isUnlocked && purchase?.paymentStatus === "Rejected";
          const savedOffline = offlineMap[book.id] ?? null;
          const isDownloadingThis = downloadingBookId === book.id;
          const isHighlighted =
            highlightedBookSlug === book.slug || highlightedBookSlug === book.id;

          return (
            <article
              key={book.id}
              id={`book-${book.slug}`}
              className={`group flex flex-col overflow-hidden rounded-[28px] border bg-white shadow-[0_6px_28px_-14px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_38px_-14px_rgba(15,23,42,0.18)] dark:bg-card ${
                isHighlighted
                  ? "border-neutral-900 ring-2 ring-neutral-900/15 dark:border-white dark:ring-white/20"
                  : "border-neutral-200/90 dark:border-border"
              }`}
            >
              {/* Top Full-Bleed Portrait Book Cover */}
              <div
                onClick={() =>
                  isUnlocked
                    ? openFullscreenReader(book, false)
                    : book.previewStreamUrl
                      ? openFullscreenReader(book, true)
                      : setDetailsBook(book)
                }
                className="relative cursor-pointer overflow-hidden"
              >
                <BookCoverArt book={book} unlockedBadge={isUnlocked} />
                {savedOffline && (
                  <div className="pointer-events-none absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600/95 px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-white shadow-sm">
                      <WifiOff className="h-3 w-3" />
                      OFFLINE
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-['Hind_Siliguri'] text-[22px] leading-snug font-bold tracking-tight text-neutral-950 dark:text-foreground">
                  {book.title}
                </h3>
                <p className="mt-2 line-clamp-2 font-['Hind_Siliguri'] text-[14.5px] leading-relaxed text-neutral-600 dark:text-muted-foreground">
                  {book.shortDescription}
                </p>

                {isPending && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-['Hind_Siliguri']">
                      অর্ডার পেন্ডিং ভেরিফিকেশন — অ্যাডমিন অ্যাপ্রুভ করলেই বইটি আনলক হবে
                    </span>
                  </div>
                )}
                {isRejected && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-['Hind_Siliguri']">
                      TrxID ভেরিফাই হয়নি — সঠিক TrxID দিয়ে আবার সাবমিট করুন
                    </span>
                  </div>
                )}

                <div className="mt-auto">
                  {/* Hairline Divider */}
                  <div className="my-5 border-t border-neutral-200/80 dark:border-border/70" />

                  {/* Price & DETAILS Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-muted-foreground">
                        {book.accessType === "free"
                          ? "OPEN ACCESS"
                          : isUnlocked
                            ? "OWNED • UNLOCKED"
                            : "STARTING FROM"}
                      </p>
                      <div className="mt-0.5 flex items-baseline gap-2">
                        {book.accessType === "free" ? (
                          <>
                            {book.regularPriceBdt ? (
                              <span className="font-['Outfit'] text-lg font-semibold tabular-nums text-neutral-400 line-through decoration-rose-500/85 decoration-2">
                                ৳{book.regularPriceBdt}
                              </span>
                            ) : null}
                            <span className="font-['Outfit'] text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                              FREE
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-['Outfit'] text-2xl font-bold tracking-tight tabular-nums text-neutral-950 dark:text-foreground">
                              ৳{book.priceBdt}
                            </span>
                            {book.regularPriceBdt && !isUnlocked && (
                              <span className="font-mono text-xs tabular-nums text-neutral-400 line-through">
                                ৳{book.regularPriceBdt}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetailsBook(book)}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-800 shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition-colors hover:bg-neutral-50 dark:border-border dark:bg-secondary/40 dark:text-foreground dark:hover:bg-secondary/70"
                    >
                      <span>DETAILS</span>
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Primary 2-Button Grid: READ / ORDER + OFFLINE / PREVIEW */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => openFullscreenReader(book, false)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                      >
                        <span>{book.accessType === "free" ? "READ FREE" : "READ BOOK"}</span>
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    ) : isPending ? (
                      <button
                        type="button"
                        onClick={() => openOrderModal(book)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300 transition-colors hover:bg-neutral-800"
                      >
                        <span>PENDING</span>
                        <Clock className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openOrderModal(book)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                      >
                        <span>{isRejected ? "RE-ORDER" : "ORDER"}</span>
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    )}

                    {/* Offline Vault Save (if unlocked) OR Free Preview (if paid & locked) */}
                    {isUnlocked ? (
                      <button
                        type="button"
                        disabled={isDownloadingThis}
                        onClick={() => handleOfflineToggle(book)}
                        className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition-colors disabled:opacity-65 ${
                          savedOffline
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "border-neutral-200/90 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-border dark:bg-secondary/40 dark:text-foreground dark:hover:bg-secondary/70"
                        }`}
                      >
                        {isDownloadingThis ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>{downloadProgress}%</span>
                          </>
                        ) : savedOffline ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>OFFLINE ✓</span>
                          </>
                        ) : (
                          <>
                            <span>OFFLINE</span>
                            <Download className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    ) : book.previewStreamUrl ? (
                      <button
                        type="button"
                        onClick={() => openFullscreenReader(book, true)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-900 shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition-colors hover:bg-neutral-50 dark:border-border dark:bg-secondary/40 dark:text-foreground dark:hover:bg-secondary/70"
                      >
                        <span>PREVIEW</span>
                        <BookOpen className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDetailsBook(book)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-900 shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition-colors hover:bg-neutral-50 dark:border-border dark:bg-secondary/40 dark:text-foreground"
                      >
                        <span>INFO</span>
                        <BookOpen className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Social Media Share Button */}
                  <button
                    type="button"
                    onClick={() => setShareBook(book)}
                    className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-border/80 dark:bg-secondary/30 dark:text-muted-foreground dark:hover:text-foreground"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share on Social Media</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Book Details Modal */}
      {detailsBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setDetailsBook(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-neutral-200 bg-white p-6 shadow-2xl dark:border-border dark:bg-card sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDetailsBook(null)}
              className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-border dark:text-muted-foreground dark:hover:bg-secondary"
              aria-label="Close details"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[235px_1fr]">
              <div className="overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-border">
                <BookCoverArt
                  book={detailsBook}
                  unlockedBadge={hasFullAccessForBook(detailsBook)}
                />
              </div>

              <div className="min-w-0 font-['Hind_Siliguri']">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-muted-foreground">
                  {detailsBook.category}
                </p>
                <h3 className="mt-1.5 text-2xl font-bold text-neutral-950 dark:text-foreground sm:text-3xl">
                  {detailsBook.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-muted-foreground">
                  লেখক: {detailsBook.authorBn} • {detailsBook.englishTitle}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  {detailsBook.accessType === "free" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {detailsBook.regularPriceBdt ? (
                        <span className="text-neutral-400 line-through decoration-rose-500/80 decoration-2">
                          ৳{detailsBook.regularPriceBdt}
                        </span>
                      ) : null}
                      <span>FREE</span>
                    </span>
                  ) : (
                    <span className="rounded-lg bg-neutral-900 px-2.5 py-1 font-semibold text-white dark:bg-white dark:text-neutral-950">
                      ৳{detailsBook.priceBdt} BDT
                    </span>
                  )}
                  <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-neutral-700 dark:bg-secondary dark:text-foreground">
                    {detailsBook.language}
                  </span>
                  <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-neutral-700 dark:bg-secondary dark:text-foreground">
                    {detailsBook.edition}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-muted-foreground">
                  {detailsBook.fullSynopsis}
                </p>

                <div className="mt-5">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-muted-foreground">
                    Highlights
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-neutral-800 dark:text-foreground">
                    {detailsBook.highlights.map((hl) => (
                      <li key={hl} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-5 dark:border-border">
                  {hasFullAccessForBook(detailsBook) ? (
                    <button
                      type="button"
                      onClick={() => {
                        const target = detailsBook;
                        setDetailsBook(null);
                        openFullscreenReader(target, false);
                      }}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-950 px-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                    >
                      <Maximize2 className="h-4 w-4" />
                      <span>
                        {detailsBook.accessType === "free"
                          ? "READ FULLSCREEN FREE"
                          : "READ FULL BOOK"}
                      </span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const target = detailsBook;
                          setDetailsBook(null);
                          openOrderModal(target);
                        }}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-950 px-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>ORDER — ৳{detailsBook.priceBdt}</span>
                      </button>
                      {detailsBook.previewStreamUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const target = detailsBook;
                            setDetailsBook(null);
                            openFullscreenReader(target, true);
                          }}
                          className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:bg-neutral-50 dark:border-border dark:bg-secondary/40 dark:text-foreground"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>FREE PREVIEW</span>
                        </button>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const target = detailsBook;
                      setDetailsBook(null);
                      setShareBook(target);
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:bg-neutral-50 dark:border-border dark:bg-secondary/40 dark:text-foreground"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>SHARE</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paid Book Order Modal */}
      {orderBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setOrderBook(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-neutral-200 bg-white p-6 shadow-2xl dark:border-border dark:bg-card sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOrderBook(null)}
              className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-border dark:text-muted-foreground dark:hover:bg-secondary"
              aria-label="Close order dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              PAID EBOOK ORDER • BDT
            </p>
            <h3 className="mt-1.5 font-['Hind_Siliguri'] text-2xl font-bold text-neutral-950 dark:text-foreground">
              {orderBook.title}
            </h3>
            <p className="mt-1 font-['Hind_Siliguri'] text-sm text-neutral-600 dark:text-muted-foreground">
              মূল্য:{" "}
              <strong className="font-['Outfit'] text-base font-bold text-neutral-950 dark:text-foreground">
                ৳{orderBook.priceBdt}
              </strong>{" "}
              (এককালীন পেমেন্ট • লাইফটাইম ইন-সাইট এক্সেস)
            </p>

            <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-border dark:bg-secondary/30">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    bKash / Nagad Personal (Send Money)
                  </p>
                  <p className="mt-1 font-mono text-base font-bold tabular-nums text-neutral-950 dark:text-foreground">
                    {BOOK_PAYMENT_ACCOUNT.bkashNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPaymentNumber}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 dark:border-border dark:bg-card dark:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedNumber ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {!user ? (
              <div className="mt-6 rounded-2xl border border-neutral-200 p-5 text-center dark:border-border">
                <ShieldCheck className="mx-auto h-8 w-8 text-neutral-800 dark:text-foreground" />
                <h4 className="mt-2 font-['Hind_Siliguri'] text-base font-bold">
                  Google অ্যাকাউন্ট দিয়ে সাইন-ইন করুন
                </h4>
                <button
                  type="button"
                  disabled={signingIn}
                  onClick={handleGoogleLoginForOrder}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-950"
                >
                  <span>{signingIn ? "Signing in..." : "Continue with Google"}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="আপনার পূর্ণ নাম"
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-950 outline-none focus:border-neutral-900 dark:border-border dark:bg-background dark:text-foreground"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as BillingMethod)}
                      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none focus:border-neutral-900 dark:border-border dark:bg-background dark:text-foreground"
                    >
                      {BILLING_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Mobile / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-950 outline-none focus:border-neutral-900 dark:border-border dark:bg-background dark:text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="যেমন: BK9X4T2M81"
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 font-mono text-sm text-neutral-950 outline-none focus:border-neutral-900 dark:border-border dark:bg-background dark:text-foreground"
                  />
                </div>
                {orderError && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 font-['Hind_Siliguri'] text-xs font-medium text-rose-700">
                    {orderError}
                  </p>
                )}
                {orderSuccessMessage && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 font-['Hind_Siliguri'] text-xs font-medium text-emerald-800">
                    {orderSuccessMessage}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-950"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>
                    {submittingOrder
                      ? "Submitting Order..."
                      : `Submit Order — ৳${orderBook.priceBdt}`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Protected Full-Screen Canvas PDF Reader Modal */}
      <InSitePdfReaderModal
        book={activeReaderState?.book ?? null}
        hasFullAccess={activeReaderState ? hasFullAccessForBook(activeReaderState.book) : false}
        isPreviewMode={activeReaderState?.preview ?? false}
        offlineMeta={activeReaderState ? (offlineMap[activeReaderState.book.id] ?? null) : null}
        onOfflineStatusChange={(bookId, meta) => {
          setOfflineMap((prev) => {
            const next = { ...prev };
            if (meta) {
              next[bookId] = meta;
            } else {
              delete next[bookId];
            }
            return next;
          });
        }}
        onRequestShare={(book) => setShareBook(book)}
        onRequestOrder={(book) => openOrderModal(book)}
        onClose={() => setActiveReaderState(null)}
      />

      {/* Social Media Share Modal */}
      <BookShareModal book={shareBook} onClose={() => setShareBook(null)} />
    </div>
  );
}
