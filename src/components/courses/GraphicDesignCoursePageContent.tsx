import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  FileCode2,
  Layers,
  Link2,
  Loader2,
  Lock,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Unlock,
  Users,
  X,
} from "lucide-react";
import { GRAPHIC_DESIGN_COURSE } from "@/data/graphic-design-course-data";
import {
  GD_QUIZ_DURATION_SECONDS,
  GRAPHIC_DESIGN_CLASS_QUIZZES,
} from "@/data/graphic-design-quizzes";
import {
  buildPurchaseDocId,
  submitPaidCourseEnrollment,
  syncVerifiedCourseProgress,
} from "@/lib/course-purchases";
import {
  auth,
  BILLING_METHODS,
  type BillingMethod,
  type CoursePurchaseRecord,
  db,
  handleFirestoreError,
  isCourseAdminEmail,
  OperationType,
  signInWithGoogle,
  VALIDATION_LIMITS,
} from "@/lib/firebase";
import { CourseQuizSection, type SavedQuizResult } from "./CourseQuizSection";

interface TimeParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const INITIAL_COUNTDOWN: TimeParts = {
  days: "--",
  hours: "--",
  minutes: "--",
  seconds: "--",
};

const TARGET_OFFSET_SECONDS = 3 * 86400 + 14 * 3600 + 26 * 60 + 58;

function formatRemaining(totalSec: number): TimeParts {
  const safe = Math.max(0, totalSec);
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

interface LocalGdProgress {
  watchedIds: string[];
  quizResults: Record<string, SavedQuizResult>;
}

const DEFAULT_GD_PROGRESS: LocalGdProgress = {
  watchedIds: [],
  quizResults: {},
};

export function GraphicDesignCoursePageContent() {
  const course = GRAPHIC_DESIGN_COURSE;

  // Countdown (SSR-safe)
  const [countdown, setCountdown] = useState<TimeParts>(INITIAL_COUNTDOWN);

  // Firebase Auth + Enrollment Record
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [purchase, setPurchase] = useState<CoursePurchaseRecord | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Classroom Progress State (persisted per user UID locally & synced to Firestore when verified)
  const [progress, setProgress] = useState<LocalGdProgress>(DEFAULT_GD_PROGRESS);
  const [expandedLessonId, setExpandedLessonId] = useState<string>("gd-class-01");
  const [copiedPresetId, setCopiedPresetId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Enroll / Payment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<BillingMethod>("bKash");
  const [paymentReference, setPaymentReference] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [submittingEnrollment, setSubmittingEnrollment] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // SSR-safe admissions countdown
  useEffect(() => {
    const targetMs = Date.now() + TARGET_OFFSET_SECONDS * 1000;
    const tick = () => {
      const remSec = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
      setCountdown(formatRemaining(remSec));
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser) {
        setPurchase(null);
        setProgress(DEFAULT_GD_PROGRESS);
      }
    });
    return () => unsub();
  }, []);

  // Real-time listener to this student's CoursePurchase document
  useEffect(() => {
    if (!authReady || !user) return;
    setPurchaseLoading(true);
    const purchaseId = buildPurchaseDocId(user.uid, course.id);
    const docPath = `coursePurchases/${purchaseId}`;

    const unsub = onSnapshot(
      doc(db, "coursePurchases", purchaseId),
      (snap) => {
        if (snap.exists()) {
          setPurchase({
            id: snap.id,
            ...(snap.data() as Omit<CoursePurchaseRecord, "id">),
          });
        } else {
          setPurchase(null);
        }
        setPurchaseLoading(false);
      },
      (err) => {
        setPurchaseLoading(false);
        handleFirestoreError(err, OperationType.GET, docPath);
      },
    );

    return () => unsub();
  }, [authReady, user, course.id]);

  // Hydrate per-user local quiz answers & watched checklist once signed in
  useEffect(() => {
    if (!user) return;
    const key = `ss_gd_course_progress_${user.uid}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LocalGdProgress>;
        setProgress({
          watchedIds: Array.isArray(parsed.watchedIds) ? parsed.watchedIds : [],
          quizResults:
            parsed.quizResults && typeof parsed.quizResults === "object" ? parsed.quizResults : {},
        });
      }
    } catch {
      // Ignore storage error
    }
  }, [user]);

  const isPaymentVerified = purchase?.paymentStatus === "Verified";
  const isPaymentPending = purchase?.paymentStatus === "Pending Verification";
  const isPaymentRejected = purchase?.paymentStatus === "Rejected";

  const persistLocalAndCloud = (next: LocalGdProgress, activeTitle?: string) => {
    setProgress(next);
    if (!user) return;
    try {
      window.localStorage.setItem(`ss_gd_course_progress_${user.uid}`, JSON.stringify(next));
    } catch {
      // Ignore storage error
    }

    if (isPaymentVerified) {
      const completedIds = course.lessons
        .filter((l) => next.watchedIds.includes(l.id) && Boolean(next.quizResults[l.id]))
        .map((l) => l.id);
      const quizValues = Object.values(next.quizResults);
      const avgPct =
        quizValues.length > 0
          ? quizValues.reduce((sum, r) => sum + (r.score / Math.max(1, r.total)) * 100, 0) /
            quizValues.length
          : 0;

      void syncVerifiedCourseProgress({
        user,
        courseId: course.id,
        courseTitle: course.title,
        courseRoute: course.route,
        courseType: "Paid Course",
        totalLessonsCount: course.lessons.length,
        completedLessonIds: completedIds,
        averageQuizScore: avgPct,
        lastActiveLessonTitle: activeTitle || course.lessons[0]!.topicTitle,
      });
    }
  };

  const handleMarkLessonStudied = (lessonId: string) => {
    if (!isPaymentVerified) return;
    if (progress.watchedIds.includes(lessonId)) return;
    const lesson = course.lessons.find((l) => l.id === lessonId);
    persistLocalAndCloud(
      {
        ...progress,
        watchedIds: [...progress.watchedIds, lessonId],
      },
      lesson?.topicTitle,
    );
  };

  const handleQuizSubmitted = (lessonId: string, result: SavedQuizResult) => {
    if (!isPaymentVerified) return;
    const lesson = course.lessons.find((l) => l.id === lessonId);
    const nextWatched = progress.watchedIds.includes(lessonId)
      ? progress.watchedIds
      : [...progress.watchedIds, lessonId];
    persistLocalAndCloud(
      {
        watchedIds: nextWatched,
        quizResults: {
          ...progress.quizResults,
          [lessonId]: result,
        },
      },
      lesson?.topicTitle,
    );
  };

  const isLessonUnlocked = (index: number): boolean => {
    if (!isPaymentVerified) return false;
    if (index === 0) return true;
    const prev = course.lessons[index - 1];
    if (!prev) return false;
    return (
      (progress.watchedIds.includes(prev.id) ||
        Boolean(purchase?.completedLessonIds?.includes(prev.id))) &&
      Boolean(progress.quizResults[prev.id])
    );
  };

  const completedClassIds = new Set<string>([
    ...(purchase?.completedLessonIds || []),
    ...course.lessons
      .filter((l) => progress.watchedIds.includes(l.id) && Boolean(progress.quizResults[l.id]))
      .map((l) => l.id),
  ]);
  const completedCount = completedClassIds.size;
  const completionPct = Math.round((completedCount / course.lessons.length) * 100);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setFeedbackBanner(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      setFeedbackBanner({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Google লগইন সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingEnrollment(true);
    setFeedbackBanner(null);

    try {
      const record = await submitPaidCourseEnrollment({
        user,
        courseId: course.id,
        courseTitle: course.title,
        courseRoute: course.route,
        amountBdt: course.priceBdt,
        totalLessonsCount: course.lessons.length,
        paymentMethod,
        paymentReference: `${paymentMethod} · TrxID: ${paymentReference.trim()}`,
        studentPhone: studentPhone.trim(),
        studentName: user.displayName || "Student",
      });
      setPurchase(record);
      setShowEnrollModal(false);
      setFeedbackBanner({
        type: "success",
        text: "আপনার পেমেন্ট তথ্য সফলভাবে জমা হয়েছে! পেমেন্ট ভেরিফিকেশন সম্পন্ন হলেই সকল ক্লাস আনলক হবে।",
      });
    } catch (error) {
      setFeedbackBanner({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "পেমেন্ট সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      });
    } finally {
      setSubmittingEnrollment(false);
    }
  };

  const handleCopyCourseLink = async () => {
    const url = `${window.location.origin}${course.route}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleCopyPreset = async (lessonId: string, presetText: string) => {
    try {
      await navigator.clipboard.writeText(presetText);
      setCopiedPresetId(lessonId);
      window.setTimeout(() => setCopiedPresetId(null), 2500);
    } catch {
      // Ignore clipboard failure
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-14 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
      {/* Feedback Notification Banner */}
      {feedbackBanner && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 text-xs font-medium sm:text-sm ${
            feedbackBanner.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackBanner.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedbackBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="rounded-full p-1 opacity-70 hover:opacity-100"
            aria-label="Close message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: HERO & ADMISSIONS DEADLINE OVERVIEW */}
      <section className="overflow-hidden rounded-3xl border border-border/80 bg-background/85 p-5 shadow-xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Left: Official Thumbnail Banner & Admissions Deadline */}
          <div className="flex flex-col justify-between space-y-5 lg:col-span-6">
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-md">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Clean unboxed metadata hairline row (no pill sandwiches) */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <span className="font-mono font-bold tabular-nums">{course.rating}/5</span>
                  <span className="text-muted-foreground">({course.reviewCount} রিভিউ)</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {course.enrolledCount}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-foreground">20+ Class · Support Included</span>
                </div>
              </div>
            </div>

            {/* Admissions Deadline Live Countdown */}
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Admission Deadline · Limited Time Offer
                </span>
                <span className="font-medium text-muted-foreground">নতুন লাইভ ব্যাচ ২০২৬</span>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { label: "Days", val: countdown.days },
                  { label: "Hrs", val: countdown.hours },
                  { label: "Mins", val: countdown.minutes },
                  { label: "Secs", val: countdown.seconds },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="rounded-xl border border-border/80 bg-background p-3 text-center"
                  >
                    <p className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
                      {unit.val}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {unit.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Title, Highlights, Pricing, Guarantees & Enroll CTA */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {course.kicker}
              </p>

              <h1 className="mt-2 font-['Hind_Siliguri','Outfit',sans-serif] text-3xl font-bold leading-tight tracking-tight text-foreground [text-wrap:balance] sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-1.5 text-base font-semibold text-foreground/80">{course.tagline}</p>

              {/* Highlights as crisp typographic bar */}
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-border/60 py-2.5 text-xs font-medium text-muted-foreground">
                {course.highlights.map((tag, idx) => (
                  <span key={tag} className="inline-flex items-center gap-3">
                    <span className="text-foreground">{tag}</span>
                    {idx < course.highlights.length - 1 && (
                      <span aria-hidden="true" className="text-border">
                        /
                      </span>
                    )}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {course.description}
              </p>

              {/* Fee & Guarantees Box */}
              <div className="mt-5 rounded-2xl border border-border/80 bg-muted/25 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/60 pb-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      কোর্স ফি (Limited Time Offer)
                    </p>
                    <div className="mt-1 flex items-baseline gap-3">
                      <span className="font-display text-3xl font-bold tracking-tight text-foreground tabular-nums sm:text-4xl">
                        ৳{course.priceBdt.toLocaleString("en-US")}
                      </span>
                      <span className="font-mono text-base text-muted-foreground line-through tabular-nums">
                        ৳{course.originalPriceBdt.toLocaleString("en-US")}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold text-foreground">
                      গুগল অ্যাকাউন্ট ভেরিফিকেশন
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      পেমেন্ট ভেরিফিকেশনের পর লাইফটাইম ক্লাসরুম অ্যাক্সেস
                    </p>
                  </div>
                </div>

                <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {course.guarantees.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-snug text-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons & Live Enrollment Status */}
            <div className="mt-6 space-y-4 border-t border-border/70 pt-5">
              {isPaymentVerified ? (
                <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                        <Unlock className="h-4 w-4" />
                        পেমেন্ট ভেরিফায়েড · অ্যাক্সেস সক্রিয়
                      </span>
                      <span className="font-mono tabular-nums text-foreground">
                        {completedCount}/{course.lessons.length} ({completionPct}%)
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background/80">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollToSection("classroom")}
                    className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    ক্লাসরুমে প্রবেশ করুন
                  </button>
                </div>
              ) : isPaymentPending ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      পেমেন্ট ভেরিফিকেশন পেন্ডিং ({purchase?.paymentMethod})
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      রেফারেন্স:{" "}
                      <strong className="text-foreground">{purchase?.paymentReference}</strong> ·
                      যাচাই সম্পন্ন হলেই সকল ক্লাস আনলক হবে।
                    </p>
                  </div>
                  <Link
                    to="/account"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground"
                  >
                    অ্যাকাউন্টে স্ট্যাটাস দেখুন
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-2.5">
                {!isPaymentVerified && !isPaymentPending && (
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(true)}
                    className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>
                      {isPaymentRejected
                        ? "পুনরায় পেমেন্ট সাবমিট করুন"
                        : `Enroll & Pay Now (৳${course.priceBdt.toLocaleString("en-US")})`}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => scrollToSection("curriculum")}
                  className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-background px-5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Curriculum দেখুন
                </button>

                <a
                  href={course.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  নতুন ব্যাচে জয়েন করতে নক দিন
                </a>

                <button
                  type="button"
                  onClick={handleCopyCourseLink}
                  aria-label="কোর্সের লিংক কপি করুন"
                  className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3.5 w-3.5" />
                      <span>লিংক কপি</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: COURSE OVERVIEW — এই কোর্সটি কাদের জন্য? */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Course Overview
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              এই কোর্সটি কাদের জন্য?
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            শূন্য থেকে শুরু করে প্রফেশনাল গ্রাফিক ডিজাইন ও এআই ইন্টিগ্রেশন শেখার উপযোগী সম্পূর্ণ
            বিগিনার-ফ্রেন্ডলি কারিকুলাম।
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {course.targetAudience.map((aud) => (
            <div
              key={aud.code}
              className="flex flex-col justify-between rounded-3xl border border-border/80 bg-background/75 p-6 shadow-sm"
            >
              <div>
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  {aud.code}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">
                  {aud.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {aud.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: LEARNING OUTCOMES — এই কোর্সে আপনি কী কী শিখবেন */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Learning Outcomes
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              এই কোর্সে আপনি কী কী শিখবেন
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            সফটওয়্যার মাস্টারির পাশাপাশি এআই ওয়ার্কফ্লো, ব্র্যান্ডিং এবং ফ্রিল্যান্সিং
            মার্কেটপ্লেসে আয় করার কৌশল।
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {course.learningOutcomes.map((skill) => (
            <div
              key={skill.code}
              className="rounded-3xl border border-border/80 bg-background/75 p-6 shadow-sm transition-colors hover:border-foreground/30"
            >
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {skill.code}
              </p>
              <h3 className="mt-2 font-display text-lg font-bold tracking-tight text-foreground">
                {skill.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {skill.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: COURSE CURRICULUM MODULES (01 - 06) */}
      <section id="curriculum" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col justify-between gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Course Curriculum · Detailed Structure
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Course Modules (০১ থেকে ০৬)
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            ৬টি পূর্ণাঙ্গ মডিউলে ২০+ প্র্যাকটিক্যাল ক্লাস—ফটোশপ, ইলাস্ট্রেটর, এআই টুলস,
            ফ্রিল্যান্সিং, ক্যারিয়ার ও ভিডিও অ্যানিমেশন।
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {course.modules.map((mod) => (
            <div
              key={mod.code}
              className="rounded-3xl border border-border/80 bg-background/80 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {mod.code}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                    {mod.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{mod.subtitle}</p>
                </div>
                <Layers className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>

              <ul className="mt-4 space-y-2.5">
                {mod.topics.map((topic) => (
                  <li
                    key={topic}
                    className="flex items-start gap-2.5 text-sm leading-snug text-foreground/90"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: PAID LMS SEQUENTIAL CLASSROOM (20 CLASSES + QUIZ) */}
      <section id="classroom" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col justify-between gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Interactive LMS Classroom · Google Verified Access
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              ক্লাস ০১ থেকে ক্লাস ২০ (ধারাবাহিক মডিউল ও কুইজ)
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            এই পেইড কোর্সটি সম্পন্ন করতে গুগল অ্যাকাউন্ট দিয়ে লগইন ও পেমেন্ট ভেরিফিকেশন সম্পন্ন
            থাকা আবশ্যক।
          </p>
        </div>

        {/* Access Gate Banner if payment is NOT Verified */}
        {!isPaymentVerified && (
          <div className="rounded-3xl border border-border/80 bg-muted/35 p-6 sm:p-8">
            {!authReady || purchaseLoading ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>অ্যাকাউন্ট ও পেমেন্ট ভেরিফিকেশন স্ট্যাটাস যাচাই করা হচ্ছে…</span>
              </div>
            ) : !user ? (
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Google Login &amp; Payment Verification Required</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">
                    কোর্স ক্লাস আনলক করতে আপনার গুগল অ্যাকাউন্ট দিয়ে লগইন করুন
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    কোর্সটি পারচেজ করতে এবং প্রোফাইলের Purchases সেকশনে আপনার প্রগ্রেস সংরক্ষণ করতে
                    ওয়েবসাইটের অফিশিয়াল গুগল অ্যাকাউন্ট লগইন ব্যবহার করুন। লগইন করার পর পেমেন্ট
                    (৳6,000) সাবমিট করে ভেরিফাইড হলেই সকল ২০টি ক্লাস ও প্র্যাকটিস ফাইল আনলক হবে।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Continue with Google
                  </button>
                </div>
              </div>
            ) : isPaymentPending ? (
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    <Clock className="h-4 w-4" />
                    <span>Payment Verification In Progress</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">
                    আপনার পেমেন্ট তথ্য সফলভাবে জমা হয়েছে — ভেরিফিকেশনের জন্য অপেক্ষমাণ
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    জমাকৃত অ্যাকাউন্ট: <strong className="text-foreground">{user.email}</strong> ·
                    মাধ্যম: <strong className="text-foreground">{purchase?.paymentMethod}</strong> ·
                    রেফারেন্স:{" "}
                    <strong className="text-foreground">{purchase?.paymentReference}</strong>।
                    পেমেন্ট ভেরিফিকেশন সম্পন্ন হলেই নিচের সকল ক্লাস আনলক হয়ে যাবে।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/account"
                    className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm"
                  >
                    {isCourseAdminEmail(user.email)
                      ? "Admin Verification Queue খুলুন"
                      : "প্রোফাইল Purchases দেখুন"}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : isPaymentRejected ? (
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Payment Verification Rejected</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-foreground">
                    আপনার পূর্বের পেমেন্ট রেফারেন্সটি যাচাই করা যায়নি
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {purchase?.adminNote ||
                      "অনুগ্রহ করে সঠিক Transaction ID (TrxID) সহ পুনরায় সাবমিট করুন।"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(true)}
                  className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground"
                >
                  পুনরায় পেমেন্ট সাবমিট করুন
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Signed In as {user.email} · Payment Required</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">
                    ক্লাসরুম আনলক করতে কোর্স ফি (৳{course.priceBdt.toLocaleString("en-US")}) পেমেন্ট
                    সাবমিট করুন
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    নিচের বাটনে ক্লিক করে বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে ৳6,000 পেমেন্ট
                    করে TrxID সাবমিট করুন। অ্যাডমিন ভেরিফাই করার সাথে সাথে আপনার অ্যাকাউন্টে কোর্সটি
                    আনলক হবে।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEnrollModal(true)}
                  className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md"
                >
                  <CreditCard className="h-4 w-4" />
                  Enroll &amp; Pay Now (৳{course.priceBdt.toLocaleString("en-US")})
                </button>
              </div>
            )}
          </div>
        )}

        {/* 20 Sequential Class Accordion */}
        <div className="space-y-4">
          {course.lessons.map((lesson, index) => {
            const unlocked = isLessonUnlocked(index);
            const lessonStudied =
              progress.watchedIds.includes(lesson.id) ||
              Boolean(purchase?.completedLessonIds?.includes(lesson.id));
            const quizResult = progress.quizResults[lesson.id];
            const lessonDone = lessonStudied && Boolean(quizResult);
            const isExpanded = unlocked && expandedLessonId === lesson.id;
            const nextLesson = course.lessons[index + 1];
            const classQuestions = GRAPHIC_DESIGN_CLASS_QUIZZES[lesson.id] ?? [];

            return (
              <article
                id={lesson.id}
                key={lesson.id}
                className={`scroll-mt-24 overflow-hidden rounded-3xl border transition-all duration-200 ${
                  unlocked
                    ? "border-border/90 bg-background shadow-md shadow-black/[0.03]"
                    : "border-border/60 bg-muted/35 opacity-80"
                }`}
              >
                {/* Class Header Toggle Row */}
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => {
                    if (!unlocked) return;
                    setExpandedLessonId((prev) => (prev === lesson.id ? "" : lesson.id));
                  }}
                  className={`flex w-full items-center justify-between gap-4 p-4 text-left sm:p-6 ${
                    unlocked ? "cursor-pointer hover:bg-muted/30" : "cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-bold tabular-nums ${
                        lessonDone
                          ? "border-emerald-600 bg-emerald-700 text-white"
                          : unlocked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {lessonDone ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : unlocked ? (
                        lesson.serial
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {lesson.classLabel} · {lesson.moduleCode}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{lesson.durationLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {!isPaymentVerified
                            ? "পেমেন্ট ভেরিফিকেশন প্রয়োজন"
                            : lessonDone
                              ? `সম্পন্ন (স্কোর: ${quizResult?.score ?? 0}/${quizResult?.total ?? 10})`
                              : lessonStudied
                                ? "লেসন স্টাডি সম্পন্ন · কুইজ বাকি"
                                : unlocked
                                  ? "আনলকড · স্টুডিও ল্যাব প্রস্তুত"
                                  : "পূর্ববর্তী ক্লাস ও কুইজ শেষ করুন"}
                        </span>
                      </div>
                      <h3 className="mt-0.5 text-base font-bold leading-snug text-foreground sm:text-lg">
                        {lesson.topicTitle}
                      </h3>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
                    {unlocked ? (
                      <>
                        <span className="hidden sm:inline">
                          {isExpanded ? "বন্ধ করুন" : "ক্লাস খুলুন"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-foreground" />
                        )}
                      </>
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Verified Classroom */}
                {isExpanded && unlocked && (
                  <div className="border-t border-border/70 p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                      {/* Left: Interactive Live Class Briefing & Practice Lab */}
                      <div className="space-y-4 rounded-2xl border border-border/80 bg-muted/25 p-5 lg:col-span-7">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {lesson.moduleCode}: {lesson.moduleTitle}
                          </span>
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {lesson.softwareTools.join(" · ")}
                          </span>
                        </div>

                        <p className="text-sm leading-relaxed text-foreground/90">
                          {lesson.summary}
                        </p>

                        <div className="space-y-2 rounded-xl border border-border bg-background p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Key Practical Takeaways
                          </p>
                          <ul className="space-y-2">
                            {lesson.keyTakeaways.map((point) => (
                              <li
                                key={point}
                                className="flex items-start gap-2 text-xs leading-relaxed text-foreground sm:text-sm"
                              >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <span className="text-xs text-muted-foreground">
                            {lessonStudied
                              ? "ক্লাস স্টাডি সম্পন্ন চিহ্নিত হয়েছে — নিচের কুইজ দিন।"
                              : "নোট ও প্র্যাকটিস টাস্ক সম্পন্ন করে নিচের বাটনে ক্লিক করুন:"}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleMarkLessonStudied(lesson.id)}
                            disabled={lessonStudied}
                            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-xs font-semibold transition-all ${
                              lessonStudied
                                ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                                : "cursor-pointer bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {lessonStudied ? "লেসন সম্পন্ন হয়েছে" : "Mark Class Studied"}
                          </button>
                        </div>
                      </div>

                      {/* Right: Practical Deliverable & AI Preset/Template Pack */}
                      <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-border/80 bg-background p-5 lg:col-span-5">
                        <div className="space-y-4">
                          <div>
                            <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5" />
                              Practice Deliverable
                            </p>
                            <p className="mt-1.5 text-sm font-semibold leading-relaxed text-foreground">
                              {lesson.practiceDeliverable}
                            </p>
                          </div>

                          <div className="rounded-xl border border-border/80 bg-muted/35 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                <FileCode2 className="h-3.5 w-3.5" />
                                Practice File / Preset Reference
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyPreset(lesson.id, lesson.aiPromptOrPreset)}
                                className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-foreground hover:underline"
                              >
                                {copiedPresetId === lesson.id ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="mt-2 font-mono text-xs leading-relaxed text-foreground">
                              {lesson.aiPromptOrPreset}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
                          <p>
                            লাইভ ক্লাস ও রিয়েল-টাইম সাপোর্টের জন্য মেন্টরের হোয়াটসঅ্যাপ গ্রুপে
                            প্রজেক্ট ফাইল সাবমিট করুন।
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Direct 10-MCQ Timed Quiz */}
                    <CourseQuizSection
                      classSerial={lesson.serial}
                      questions={classQuestions}
                      isVideoWatched={lessonStudied}
                      savedResult={quizResult}
                      hasNextClass={Boolean(nextLesson)}
                      durationSeconds={GD_QUIZ_DURATION_SECONDS}
                      lockedPrompt={`এই ক্লাসের ${classQuestions.length}টি MCQ কুইজ আনলক করতে প্রথমে উপরের "Mark Class Studied" বাটনে ক্লিক করে পাঠটি সম্পন্ন করুন।`}
                      readyPrompt={`ক্লাস ${lesson.serial}-এর স্টাডি সম্পন্ন হয়েছে! এখন ${classQuestions.length}টি প্রশ্নের কুইজ সম্পন্ন করলে পরবর্তী ক্লাস আনলক হবে।`}
                      onQuizSubmitted={(result) => handleQuizSubmitted(lesson.id, result)}
                      onUnlockAndGoNext={() => {
                        if (nextLesson) {
                          setExpandedLessonId(nextLesson.id);
                          window.setTimeout(() => {
                            document
                              .getElementById(nextLesson.id)
                              ?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 80);
                        }
                      }}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 6: OFFER VALUE — এই কোর্সের সাথে আপনি আর কী কী পাবেন */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Offer Value · Bonus Resources
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              এই কোর্সের সাথে আপনি আর কী কী পাবেন
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            ডিজাইনের গতি বাড়াতে প্রফেশনাল প্র্যাকটিস ফাইল, প্রিসেট এবং ফ্রিল্যান্সিং ক্যারিয়ার
            গাইডলাইন।
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {course.offerExtras.map((extra) => (
            <div
              key={extra.code}
              className="rounded-3xl border border-border/80 bg-background/80 p-6 shadow-sm"
            >
              <p className="font-mono text-xs font-bold text-muted-foreground">{extra.code}</p>
              <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight text-foreground">
                {extra.title}
              </h3>
              <ul className="mt-4 space-y-2 border-t border-border/60 pt-4">
                {extra.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: MEET YOUR MENTOR */}
      <section className="overflow-hidden rounded-3xl border border-border/80 bg-background/85 p-6 shadow-xl shadow-black/[0.03] sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border/80 bg-muted">
              <img
                src={course.mentor.avatar}
                alt={course.mentor.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>

          <div className="space-y-4 lg:col-span-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Meet Your Mentor
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {course.mentor.name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-foreground/80">
                {course.mentor.roleTitle} · {course.mentor.designation}
              </p>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {course.mentor.bio}
            </p>

            <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-5">
              {!isPaymentVerified && !isPaymentPending && (
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(true)}
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
                >
                  <Award className="h-4 w-4" />
                  Enroll &amp; Pay Now (৳{course.priceBdt.toLocaleString("en-US")})
                </button>
              )}

              <a
                href={course.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4" />
                নতুন ব্যাচে জয়েন করতে নক দিন
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Course Footer */}
      <footer className="border-t border-border/70 pt-6 text-center text-xs text-muted-foreground">
        © 2026 Sabbir Sakib · Bismahsoft Academy
      </footer>

      {/* ENROLLMENT & PAYMENT SUBMISSION MODAL */}
      {showEnrollModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="enroll-modal-title"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8">
            <div className="mb-5 flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Official Course Enrollment
                </p>
                <h3
                  id="enroll-modal-title"
                  className="font-display text-xl font-bold text-foreground sm:text-2xl"
                >
                  Enroll &amp; Payment Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close enrollment dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!user ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-border/80 bg-muted/35 p-4 text-sm leading-relaxed text-muted-foreground">
                  এই কোর্সটি কিনতে হলে আপনার গুগল অ্যাকাউন্ট দিয়ে লগইন করা বাধ্যতামূলক। লগইন করার
                  পর আপনি পেমেন্ট সাবমিট করতে পারবেন এবং আপনার প্রোফাইলের{" "}
                  <strong className="text-foreground">Purchases</strong> সেকশনে কোর্সটি সংরক্ষিত
                  থাকবে।
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-md disabled:opacity-60"
                >
                  {authLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Continue with Google
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnrollment} className="space-y-4">
                <div className="rounded-2xl border border-border/80 bg-muted/35 p-4 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">গুগল অ্যাকাউন্ট:</span>
                    <span className="font-semibold text-foreground">{user.email}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">কোর্স ফি (এককালীন):</span>
                    <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                      ৳{course.priceBdt.toLocaleString("en-US")} BDT
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-4 text-xs leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground">পেমেন্ট নির্দেশনা:</p>
                  <p className="mt-1">
                    bKash বা Nagad (Send Money) করুন:{" "}
                    <strong className="font-mono text-foreground">+880 1410-957506</strong> অথবা
                    নিচে আপনার পছন্দের পেমেন্ট মাধ্যম সিলেক্ট করে{" "}
                    <strong className="text-foreground">Transaction ID (TrxID)</strong> দিন।
                    অ্যাডমিন ভেরিফাই করলেই কোর্স আনলক হবে।
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as BillingMethod)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  >
                    {BILLING_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Transaction ID (TrxID) / Payment Reference
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={VALIDATION_LIMITS.PAYMENT_REFERENCE_MAX - 30}
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="যেমন: 9K7A4M2P8Q অথবা আপনার পেমেন্ট নম্বর"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    WhatsApp / Contact Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.PHONE_MAX}
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(false)}
                    className="h-10 rounded-full border border-border px-5 text-xs font-semibold"
                  >
                    বাতিল করুন
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEnrollment}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md disabled:opacity-60"
                  >
                    {submittingEnrollment && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    সাবমিট করুন (৳{course.priceBdt.toLocaleString("en-US")})
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
