import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  Loader2,
  Lock,
  LogIn,
  Maximize2,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  UserCheck,
  WifiOff,
  X,
} from "lucide-react";

import { BOOKS_CATALOG, BOOK_PAYMENT_CHANNELS, type BookItem } from "../../data/books-data";
import {
  auth,
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
import { BookLookInsideSection } from "./BookLookInsideSection";
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

  // Order form state (Google Account connected + bKash/Nagad/Rocket/Bank Account)
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<BillingMethod>("bKash");
  const [paymentReference, setPaymentReference] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);
  const [copiedChannelKey, setCopiedChannelKey] = useState<string | null>(null);

  const isAdmin = isPrimaryAdminUser(user);

  const paidBooks = useMemo(() => BOOKS_CATALOG.filter((b) => b.accessType === "paid"), []);
  const freeCount = useMemo(() => BOOKS_CATALOG.filter((b) => b.accessType === "free").length, []);
  const paidCount = paidBooks.length;

  const visibleBooks = useMemo(() => {
    if (filterTab === "free") return BOOKS_CATALOG.filter((b) => b.accessType === "free");
    if (filterTab === "paid") return BOOKS_CATALOG.filter((b) => b.accessType === "paid");
    return BOOKS_CATALOG;
  }, [filterTab]);

  const activeChannel =
    BOOK_PAYMENT_CHANNELS.find((c) => c.method === paymentMethod) ?? BOOK_PAYMENT_CHANNELS[0];

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
      const validChannel = BOOK_PAYMENT_CHANNELS.some((c) => c.method === existing.paymentMethod);
      setPaymentMethod(validChannel ? existing.paymentMethod : "bKash");
      setPaymentReference(existing.paymentStatus === "Rejected" ? "" : existing.paymentReference);
    } else {
      setBuyerName(user?.displayName || "");
      setPaymentMethod("bKash");
      setPaymentReference("");
    }
  }

  async function handleGoogleSignIn() {
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
        "পেইড বই অর্ডার করার জন্য প্রথমে আপনার ভেরিফায়েড Google অ্যাকাউন্ট দিয়ে সাইন-ইন করুন।",
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
          "আপনার অর্ডার ও Transaction ID সফলভাবে জমা হয়েছে (Pending Verification)। অ্যাডমিন TrxID মিলিয়ে অ্যাপ্রুভ করলেই আপনার গুগল একাউন্টে সম্পূর্ণ বইটি আনলক হয়ে যাবে।",
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

  async function handleCopyChannelValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedChannelKey(key);
      window.setTimeout(() => setCopiedChannelKey(null), 2000);
    } catch {
      // Ignore clipboard failure
    }
  }

  const orderExistingRecord = orderBook ? purchasesByBookId[orderBook.id] : undefined;
  const orderIsVerified = orderBook ? hasFullAccessForBook(orderBook) : false;
  const orderIsPending =
    Boolean(orderBook && !orderIsVerified) &&
    orderExistingRecord?.paymentStatus === "Pending Verification";
  const orderIsRejected =
    Boolean(orderBook && !orderIsVerified) && orderExistingRecord?.paymentStatus === "Rejected";

  const ownedPaidCount = paidBooks.filter((b) => hasFullAccessForBook(b)).length;
  const pendingPaidCount = paidBooks.filter(
    (b) =>
      !hasFullAccessForBook(b) && purchasesByBookId[b.id]?.paymentStatus === "Pending Verification",
  ).length;

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
              ভেতর থেকেই পড়ুন। পেইড বই কেনার আগে{" "}
              <strong className="font-semibold text-neutral-900 dark:text-foreground">
                “একটু পড়ে দেখুন”
              </strong>{" "}
              অংশে ফ্রি স্যাম্পল পড়ে Google অ্যাকাউন্ট দিয়ে বিকাশ, নগদ, রকেট বা ব্যাংক একাউন্টে
              অর্ডার করতে পারবেন।
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

        {/* Google Account Connected Status Bar */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-neutral-200/90 bg-white/90 px-4 py-3.5 shadow-xs dark:border-border dark:bg-card/80 sm:flex-row sm:items-center sm:justify-between">
          {user ? (
            <>
              <div className="flex min-w-0 items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Account"}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 shrink-0 rounded-full border border-neutral-200 object-cover dark:border-border"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                    <UserCheck className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 font-['Hind_Siliguri']">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-neutral-950 dark:text-foreground">
                      {user.displayName || "Google Account Connected"}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Google Connected
                    </span>
                  </div>
                  <p className="truncate text-xs text-neutral-500 dark:text-muted-foreground">
                    {user.email} • আনলকড পেইড বই: {ownedPaidCount}টি
                    {pendingPaidCount > 0 ? ` • ভেরিফিকেশন পেন্ডিং: ${pendingPaidCount}টি` : ""}
                  </p>
                </div>
              </div>
              <Link
                to="/account"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-border dark:bg-secondary/50 dark:text-foreground"
              >
                <span>My Purchases</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 font-['Hind_Siliguri']">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-950 dark:text-foreground">
                    পেইড বই কেনার জন্য আপনার Google অ্যাকাউন্ট কানেক্ট করুন
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-muted-foreground">
                    Sign in with Google করলে আপনার সব কেনা বই অ্যাকাউন্টে আজীবন সেভ ও সিঙ্ক থাকবে।
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={signingIn}
                onClick={handleGoogleSignIn}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-950"
              >
                {signingIn ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogIn className="h-3.5 w-3.5" />
                )}
                <span>{signingIn ? "Signing in..." : "Sign in with Google"}</span>
              </button>
            </>
          )}
        </div>

        {/* Filter Controls & Security Info Row */}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              bKash • Nagad • Rocket • Bank A/C
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

                {/* Rokomari / Wafilife-Style "একটু পড়ে দেখুন" Floating Cover Tag for Paid Books */}
                {book.accessType === "paid" && !isUnlocked && book.previewStreamUrl && (
                  <div className="pointer-events-none absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-neutral-950/75 px-3 py-1.5 font-['Hind_Siliguri'] text-[11px] font-bold text-amber-300 shadow-lg backdrop-blur-md">
                      <BookOpen className="h-3.5 w-3.5" />
                      একটু পড়ে দেখুন
                    </span>
                  </div>
                )}

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
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="font-['Hind_Siliguri'] leading-relaxed">
                      <strong>Pending Verification</strong> ({purchase?.paymentMethod} • TrxID:{" "}
                      <span className="font-mono">{purchase?.paymentReference}</span>) — অ্যাডমিন
                      যাচাই করে অ্যাপ্রুভ করলেই বইটি আনলক হবে।
                    </span>
                  </div>
                )}
                {isRejected && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="font-['Hind_Siliguri'] leading-relaxed">
                      TrxID ভেরিফাই হয়নি — সঠিক TrxID দিয়ে আবার সাবমিট করুন।
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

                  {/* Primary 2-Button Grid: READ / ORDER + OFFLINE / একটু পড়ে দেখুন */}
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
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-300 transition-colors hover:bg-neutral-800"
                      >
                        <span>PENDING</span>
                        <Clock className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openOrderModal(book)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                      >
                        <span>{isRejected ? "RE-ORDER" : "ORDER"}</span>
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    )}

                    {/* Offline Vault Save (if unlocked) OR "একটু পড়ে দেখুন" (if paid & locked) */}
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
                        className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border border-amber-300/90 bg-amber-50/80 px-3 font-['Hind_Siliguri'] text-xs font-bold text-amber-900 shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition-colors hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/25"
                      >
                        <BookOpen className="h-4 w-4 shrink-0" />
                        <span>একটু পড়ে দেখুন</span>
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

      {/* Rokomari / Wafilife-Style "একটু পড়ে দেখুন" (Look Inside) Sample Pages Section for Paid Books */}
      <BookLookInsideSection
        paidBooks={paidBooks}
        isBookUnlocked={hasFullAccessForBook}
        getBookStatus={(b) => purchasesByBookId[b.id]?.paymentStatus ?? null}
        onOpenPdfPreview={(b) => openFullscreenReader(b, true)}
        onOpenFullReader={(b) => openFullscreenReader(b, false)}
        onOrderBook={(b) => openOrderModal(b)}
      />

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

                {/* Table of Contents inside Details Modal */}
                <div className="mt-5">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-muted-foreground">
                    সূচিপত্র • Table of Contents
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-neutral-800 dark:text-foreground">
                    {detailsBook.tableOfContents.map((ch, idx) => (
                      <li key={ch} className="flex items-start justify-between gap-2">
                        <span className="flex items-start gap-2">
                          <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{ch}</span>
                        </span>
                        {detailsBook.accessType === "paid" &&
                          !hasFullAccessForBook(detailsBook) &&
                          (idx === 0 ? (
                            <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                              SAMPLE
                            </span>
                          ) : (
                            <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                          ))}
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
                          className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 font-['Hind_Siliguri'] text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>একটু পড়ে দেখুন</span>
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

      {/* Paid Book Checkout Modal (Google Connected + bKash / Nagad / Rocket / Bank Account) */}
      {orderBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setOrderBook(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-neutral-200 bg-white p-6 shadow-2xl dark:border-border dark:bg-card sm:p-7"
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
              PAID EBOOK CHECKOUT • GOOGLE ACCOUNT CONNECTED
            </p>
            <h3 className="mt-1.5 font-['Hind_Siliguri'] text-2xl font-bold text-neutral-950 dark:text-foreground">
              {orderBook.title}
            </h3>
            <p className="mt-1 font-['Hind_Siliguri'] text-sm text-neutral-600 dark:text-muted-foreground">
              মূল্য:{" "}
              <strong className="font-['Outfit'] text-base font-bold text-neutral-950 dark:text-foreground">
                ৳{orderBook.priceBdt}
              </strong>{" "}
              (এককালীন পেমেন্ট • অ্যাডমিন ভেরিফিকেশনের পর লাইফটাইম এক্সেস)
            </p>

            {/* 3-Step Purchase & Verification Progress Stepper */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-3 font-['Hind_Siliguri'] text-[11px] dark:border-border dark:bg-secondary/25">
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                    user
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
                  }`}
                >
                  {user ? "✓" : "1"}
                </span>
                <span className="font-semibold text-neutral-800 dark:text-foreground">
                  Google লগইন
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                    orderIsPending || orderIsVerified
                      ? "bg-emerald-600 text-white"
                      : user
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
                        : "bg-neutral-200 text-neutral-500 dark:bg-secondary"
                  }`}
                >
                  {orderIsPending || orderIsVerified ? "✓" : "2"}
                </span>
                <span className="font-semibold text-neutral-800 dark:text-foreground">
                  TrxID সাবমিট
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                    orderIsVerified
                      ? "bg-emerald-600 text-white"
                      : orderIsPending
                        ? "bg-amber-500 text-white"
                        : "bg-neutral-200 text-neutral-500 dark:bg-secondary"
                  }`}
                >
                  {orderIsVerified ? "✓" : "3"}
                </span>
                <span className="font-semibold text-neutral-800 dark:text-foreground">
                  অ্যাডমিন আনলক
                </span>
              </div>
            </div>

            {!user ? (
              <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-6 text-center dark:border-border dark:bg-secondary/20">
                <ShieldCheck className="mx-auto h-9 w-9 text-neutral-900 dark:text-foreground" />
                <h4 className="mt-2.5 font-['Hind_Siliguri'] text-lg font-bold text-neutral-950 dark:text-foreground">
                  প্রথমে Sign in with Google করুন
                </h4>
                <p className="mt-1 font-['Hind_Siliguri'] text-xs leading-relaxed text-neutral-600 dark:text-muted-foreground">
                  বই কেনার অর্ডারটি আপনার Google অ্যাকাউন্টের সাথে সরাসরি যুক্ত হবে। অ্যাডমিন
                  পেমেন্ট ভেরিফাই করলেই এই অ্যাকাউন্ট থেকে যেকোনো ডিভাইসে বইটি পড়তে পারবেন।
                </p>
                {orderError && (
                  <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-['Hind_Siliguri'] text-xs font-medium text-rose-700">
                    {orderError}
                  </p>
                )}
                <button
                  type="button"
                  disabled={signingIn}
                  onClick={handleGoogleSignIn}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-950"
                >
                  {signingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  <span>{signingIn ? "Signing in with Google..." : "Continue with Google"}</span>
                </button>
              </div>
            ) : orderIsVerified ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600 dark:text-emerald-400" />
                <h4 className="mt-2 font-['Hind_Siliguri'] text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  বইটি আপনার অ্যাকাউন্টে আনলক আছে!
                </h4>
                <p className="mt-1 font-['Hind_Siliguri'] text-xs text-emerald-800/90 dark:text-emerald-300/90">
                  আপনার পেমেন্ট ভেরিফাইড ({user.email})। এখনই ফুল-স্ক্রিন রিডারে সম্পূর্ণ বইটি পড়ুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const target = orderBook;
                    setOrderBook(null);
                    openFullscreenReader(target, false);
                  }}
                  className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-950 px-6 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-neutral-950"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span>Read Full Book Now</span>
                </button>
              </div>
            ) : orderIsPending ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/85 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 font-['Hind_Siliguri']">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-300">
                      STATUS: PENDING VERIFICATION
                    </p>
                    <h4 className="mt-0.5 text-base font-bold text-neutral-950 dark:text-foreground">
                      আপনার পেমেন্ট ভেরিফিকেশনের জন্য পেন্ডিং আছে
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-700 dark:text-muted-foreground">
                      অ্যাডমিন আপনার প্রদত্ত Transaction ID যাচাই করে অ্যাপ্রুভ করে দিলেই আপনার
                      অ্যাকাউন্টে ({user.email}) সম্পূর্ণ বইটি আনলক হয়ে যাবে।
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl border border-amber-200/80 bg-white/80 p-3 text-xs dark:border-amber-500/20 dark:bg-card/80">
                  <div>
                    <span className="text-neutral-500">Payment Method</span>
                    <p className="font-mono font-bold text-neutral-900 dark:text-foreground">
                      {orderExistingRecord?.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Submitted TrxID</span>
                    <p className="font-mono font-bold text-neutral-900 dark:text-foreground">
                      {orderExistingRecord?.paymentReference}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Connected Account</span>
                    <p className="truncate font-mono text-[11px] font-semibold text-neutral-800 dark:text-foreground">
                      {orderExistingRecord?.buyerEmail}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Order Date</span>
                    <p className="font-mono font-semibold text-neutral-800 dark:text-foreground">
                      {orderExistingRecord?.purchaseDate}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <Link
                    to="/account"
                    onClick={() => setOrderBook(null)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-neutral-950 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white dark:bg-white dark:text-neutral-950"
                  >
                    <span>Track in Account</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {orderBook.previewStreamUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = orderBook;
                        setOrderBook(null);
                        openFullscreenReader(target, true);
                      }}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 font-['Hind_Siliguri'] text-xs font-semibold text-neutral-900 dark:border-border dark:bg-card dark:text-foreground"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>অপেক্ষার মাঝে স্যাম্পল পড়ুন</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Connected Google Account Mini Pill */}
                <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-2 dark:border-emerald-500/25 dark:bg-emerald-500/10">
                  <div className="flex min-w-0 items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate font-mono text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
                      Connected: {user.email}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] uppercase text-emerald-700 dark:text-emerald-300">
                    Google Verified
                  </span>
                </div>

                {orderIsRejected && orderExistingRecord?.adminNote && (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 font-['Hind_Siliguri'] text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                    <strong>পূর্বের অর্ডার রিজেক্ট হয়েছে:</strong> {orderExistingRecord.adminNote} —
                    সঠিক TrxID দিয়ে নিচে আবার সাবমিট করুন।
                  </div>
                )}

                {/* 4-Channel Bangladesh Payment Selector (bKash / Nagad / Rocket / Bank Account) */}
                <div className="mt-5">
                  <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Select Payment Channel (বিকাশ / নগদ / রকেট / ব্যাংক একাউন্ট)
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {BOOK_PAYMENT_CHANNELS.map((ch) => {
                      const active = paymentMethod === ch.method;
                      return (
                        <button
                          key={ch.method}
                          type="button"
                          onClick={() => setPaymentMethod(ch.method)}
                          className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2.5 py-2.5 text-center transition-all ${
                            active
                              ? "border-neutral-950 bg-neutral-950 text-white shadow-sm dark:border-white dark:bg-white dark:text-neutral-950"
                              : "border-neutral-200 bg-neutral-50/70 text-neutral-700 hover:border-neutral-400 hover:bg-white dark:border-border dark:bg-secondary/30 dark:text-foreground"
                          }`}
                        >
                          {ch.method === "Dutch-Bangla Bank" ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            <Smartphone className="h-4 w-4" />
                          )}
                          <span className="font-['Hind_Siliguri'] text-xs font-bold">
                            {ch.shortLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Channel Account Number & Instructions */}
                  <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-border dark:bg-secondary/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold ${activeChannel.accentClass}`}
                        >
                          {activeChannel.accountType}
                        </span>
                        <p className="mt-2 font-mono text-base font-bold tabular-nums text-neutral-950 dark:text-foreground">
                          {activeChannel.accountNumber}
                        </p>
                        <p className="mt-0.5 font-['Hind_Siliguri'] text-[11px] text-neutral-600 dark:text-muted-foreground">
                          Account Holder: <strong>{activeChannel.accountHolder}</strong>
                        </p>
                        {activeChannel.bankDetails && (
                          <p className="mt-1 font-['Hind_Siliguri'] text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                            {activeChannel.bankDetails}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyChannelValue(activeChannel.method, activeChannel.copyValue)
                        }
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 dark:border-border dark:bg-card dark:text-foreground"
                      >
                        {copiedChannelKey === activeChannel.method ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span>{copiedChannelKey === activeChannel.method ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="mt-2.5 border-t border-neutral-200/80 pt-2.5 font-['Hind_Siliguri'] text-xs leading-relaxed text-neutral-600 dark:border-border/60 dark:text-muted-foreground">
                      {activeChannel.instructionBn}
                    </p>
                  </div>
                </div>

                {/* Payment Verification Submission Form */}
                <form onSubmit={handleOrderSubmit} className="mt-4 space-y-3.5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    <div>
                      <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                        {paymentMethod === "Dutch-Bangla Bank"
                          ? "Mobile / WhatsApp"
                          : "Sender Mobile / WhatsApp"}
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
                      {activeChannel.referenceLabelBn}
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder={activeChannel.referencePlaceholder}
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
                    {submittingOrder ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                    <span>
                      {submittingOrder
                        ? "Submitting for Verification..."
                        : `Submit ${activeChannel.shortLabel} Payment — ৳${orderBook.priceBdt}`}
                    </span>
                  </button>
                </form>
              </>
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
