import { useEffect, useState } from "react";
import {
  Award,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Link2,
  Lock,
  Play,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { CLASS_QUIZZES } from "@/data/course-quizzes";
import { QURAN_COURSE } from "@/data/courses-data";
import { syncVerifiedCourseProgress } from "@/lib/course-purchases";
import { auth } from "@/lib/firebase";
import { CourseQuizSection, type SavedQuizResult } from "./CourseQuizSection";
import { CourseVideoPlayer } from "./CourseVideoPlayer";

const PROGRESS_STORAGE_KEY = "ss_quran_course_progress_v2";

interface PersistedCourseProgress {
  watchedIds: string[];
  quizResults: Record<string, SavedQuizResult>;
}

const DEFAULT_PROGRESS: PersistedCourseProgress = {
  watchedIds: [],
  quizResults: {},
};

export function CourseLMSPlayer() {
  const course = QURAN_COURSE;

  // Deterministic initial state for SSR hydration parity; hydrated from localStorage in useEffect
  const [progress, setProgress] = useState<PersistedCourseProgress>(DEFAULT_PROGRESS);
  const [expandedLessonId, setExpandedLessonId] = useState<string>("class-01");
  const [activeVisitors, setActiveVisitors] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [signedInUser, setSignedInUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setSignedInUser(u);
    });
    return () => unsub();
  }, []);

  // Real-time course presence heartbeat with server endpoint
  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");

    let sessionId = "";
    try {
      const existing = window.sessionStorage.getItem("ss_course_visitor_id");
      if (existing) {
        sessionId = existing;
      } else {
        sessionId =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        window.sessionStorage.setItem("ss_course_visitor_id", sessionId);
      }
    } catch {
      sessionId = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }

    let cancelled = false;
    const sendHeartbeat = async () => {
      try {
        const res = await fetch("/api/course-presence", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { activeVisitors?: number };
        if (!cancelled && typeof data.activeVisitors === "number") {
          setActiveVisitors(data.activeVisitors);
        }
      } catch {
        // Ignore transient network errors
      }
    };

    void sendHeartbeat();
    const interval = window.setInterval(() => {
      void sendHeartbeat();
    }, 15_000);

    const handleLeave = () => {
      try {
        void fetch(`/api/course-presence?sessionId=${encodeURIComponent(sessionId)}`, {
          method: "DELETE",
          keepalive: true,
        });
      } catch {
        // Ignore cleanup error
      }
    };

    window.addEventListener("beforeunload", handleLeave);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", handleLeave);
      handleLeave();
    };
  }, []);

  const handleCopyCourseLink = async () => {
    const shareUrl = `${window.location.origin}/courses`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setLinkCopied(true);
        window.setTimeout(() => setLinkCopied(false), 3000);
      } catch {
        // Ignore clipboard denial
      }
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") return;
    try {
      await navigator.share({
        title: `${course.title} — ${course.englishTitle}`,
        text: `${course.title} (${course.subtitle}) — বিনামূল্যে ধারাবাহিক কুরআন শিক্ষা কোর্স`,
        url: `${window.location.origin}/courses`,
      });
    } catch {
      // User dismissed native share sheet
    }
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedCourseProgress>;
      const watchedIds = Array.isArray(parsed.watchedIds)
        ? parsed.watchedIds.filter((id): id is string => typeof id === "string")
        : [];
      const quizResults =
        parsed.quizResults && typeof parsed.quizResults === "object" ? parsed.quizResults : {};
      setProgress({ watchedIds, quizResults });

      // Automatically open the highest newly unlocked incomplete class
      let lastUnlocked = "class-01";
      for (let i = 0; i < course.lessons.length; i++) {
        const lesson = course.lessons[i]!;
        if (i === 0) {
          lastUnlocked = lesson.id;
        } else {
          const prev = course.lessons[i - 1]!;
          const prevDone = watchedIds.includes(prev.id) && Boolean(quizResults[prev.id]);
          if (prevDone) {
            lastUnlocked = lesson.id;
          } else {
            break;
          }
        }
      }
      setExpandedLessonId(lastUnlocked);
    } catch {
      // Ignore storage read error
    }
  }, [course.lessons]);

  const syncAccountProgress = (next: PersistedCourseProgress, activeTitle?: string) => {
    if (!signedInUser || !signedInUser.emailVerified) return;
    const completedIds = course.lessons
      .filter((l) => next.watchedIds.includes(l.id) && Boolean(next.quizResults[l.id]))
      .map((l) => l.id);
    const quizEntries = Object.values(next.quizResults);
    const avgPct =
      quizEntries.length > 0
        ? quizEntries.reduce((acc, q) => acc + (q.score / Math.max(1, q.total)) * 100, 0) /
          quizEntries.length
        : 0;
    const fallbackTitle =
      course.lessons.find((l) => l.id === completedIds[completedIds.length - 1])?.topicTitle ||
      course.lessons[0]?.topicTitle ||
      "Class 01";

    void syncVerifiedCourseProgress({
      user: signedInUser,
      courseId: course.id,
      courseTitle: course.title,
      courseRoute: "/courses",
      courseType: "Free Course",
      totalLessonsCount: course.lessons.length,
      completedLessonIds: completedIds,
      averageQuizScore: avgPct,
      lastActiveLessonTitle: activeTitle || fallbackTitle,
    }).catch(() => {
      // Ignore background cloud sync failures for free local playback
    });
  };

  const saveProgress = (next: PersistedCourseProgress, activeTitle?: string) => {
    setProgress(next);
    try {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage write error
    }
    syncAccountProgress(next, activeTitle);
  };

  const handleMarkVideoWatched = (lessonId: string) => {
    if (progress.watchedIds.includes(lessonId)) return;
    const lesson = course.lessons.find((l) => l.id === lessonId);
    saveProgress(
      {
        ...progress,
        watchedIds: [...progress.watchedIds, lessonId],
      },
      lesson?.topicTitle,
    );
  };

  const handleQuizSubmitted = (lessonId: string, result: SavedQuizResult) => {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    const nextWatched = progress.watchedIds.includes(lessonId)
      ? progress.watchedIds
      : [...progress.watchedIds, lessonId];
    saveProgress(
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
    if (index === 0) return true;
    const prev = course.lessons[index - 1];
    if (!prev) return false;
    return progress.watchedIds.includes(prev.id) && Boolean(progress.quizResults[prev.id]);
  };

  const completedClassCount = course.lessons.filter(
    (l) => progress.watchedIds.includes(l.id) && Boolean(progress.quizResults[l.id]),
  ).length;
  const completionPct = Math.round((completedClassCount / course.lessons.length) * 100);

  // Find current active class for Hero CTA
  const currentUnlockedIndex = course.lessons.findIndex(
    (l, i) =>
      isLessonUnlocked(i) &&
      !(progress.watchedIds.includes(l.id) && Boolean(progress.quizResults[l.id])),
  );
  const resumeLesson =
    course.lessons[currentUnlockedIndex === -1 ? 0 : currentUnlockedIndex] ?? course.lessons[0]!;

  const scrollToLesson = (lessonId: string) => {
    setExpandedLessonId(lessonId);
    window.setTimeout(() => {
      document.getElementById(lessonId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <div className="space-y-10 font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
      {/* SECTION 1: LARGE THUMBNAIL & COURSE INTRODUCTION */}
      <section className="overflow-hidden rounded-3xl border border-border/80 bg-background/80 p-5 shadow-xl shadow-black/[0.03] ring-1 ring-inset ring-foreground/[0.04] backdrop-blur-2xl sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left: Large Course Thumbnail Preview */}
          <div className="space-y-4 lg:col-span-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-md">
              <img
                src={course.thumbnail}
                alt={course.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Clean Rating, Student Statistics & Compact Live Active Visitors Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                </div>
                <span className="font-mono font-bold tabular-nums">{course.rating}</span>
                <span className="text-muted-foreground">({course.reviewCount} রিভিউ)</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  {course.enrolledCount}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>বর্তমানে দেখছেন:</span>
                  <span className="font-mono font-bold tabular-nums">
                    {activeVisitors !== null ? `${activeVisitors} জন` : "..."}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Course Introduction, Instructor & Organization Profile */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {course.organization.name} · {course.subtitle}
              </p>

              <h1 className="mt-2 font-['Hind_Siliguri','Outfit',sans-serif] text-3xl font-bold leading-tight tracking-tight text-foreground [text-wrap:balance] sm:text-4xl">
                {course.title}
                <span className="mt-1 block text-base font-medium text-muted-foreground sm:text-lg">
                  {course.englishTitle}
                </span>
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {course.description}
              </p>

              {/* Instructor & Organization Box */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-muted/35 p-3.5">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 shrink-0 rounded-xl border border-border object-cover object-top"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground">কোর্স প্রশিক্ষক</p>
                    <p className="truncate text-sm font-bold text-foreground">
                      {course.instructor.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      সাবেক শিক্ষক, মসজিদে নববী
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-muted/35 p-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground">প্রতিষ্ঠান</p>
                    <p className="truncate text-sm font-bold text-foreground">
                      {course.organization.nameBn}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {course.organization.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Progress + Start Action */}
            <div className="mt-6 flex flex-col gap-4 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-[200px] flex-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    আপনার কোর্স অগ্রগতি
                  </span>
                  <span className="font-mono tabular-nums text-foreground">
                    {completedClassCount}/{course.lessons.length} ({completionPct}%)
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyCourseLink}
                  className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>লিংক কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3.5 w-3.5" />
                      <span>লিংক কপি করুন</span>
                    </>
                  )}
                </button>

                {canNativeShare && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    aria-label="সোশ্যাল মিডিয়ায় শেয়ার করুন"
                    className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => scrollToLesson(resumeLesson.id)}
                  className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{resumeLesson.classLabel} শুরু করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DIRECT CLASS-BY-CLASS CURRICULUM (Class 01 -> Class 27 + 25-MCQ Quiz each) */}
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              ধারাবাহিক ক্লাস ও কুইজ সূচি
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              ক্লাস ০১ থেকে ক্লাস ২৭ (আনলক পদ্ধতি)
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            প্রথমে ক্লাস ০১ আনলক থাকবে। প্রতিটি ভিডিও না টেনে সম্পূর্ণ দেখা এবং ক্লাস-ভিত্তিক ২৫টি
            MCQ কুইজ সম্পন্ন করার পরই পরবর্তী ক্লাস আনলক হবে।
          </p>
        </div>

        <div className="space-y-4">
          {course.lessons.map((lesson, index) => {
            const unlocked = isLessonUnlocked(index);
            const videoWatched = progress.watchedIds.includes(lesson.id);
            const quizResult = progress.quizResults[lesson.id];
            const lessonDone = videoWatched && Boolean(quizResult);
            const isExpanded = unlocked && expandedLessonId === lesson.id;
            const nextLesson = course.lessons[index + 1];
            const classQuestions = CLASS_QUIZZES[lesson.id] ?? [];

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
                    {/* Crisp Monochrome / Status Serial Circle */}
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
                        <span className="font-semibold text-foreground">{lesson.classLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {lessonDone
                            ? `সম্পন্ন (স্কোর: ${quizResult?.score ?? 0}/${quizResult?.total ?? 25})`
                            : videoWatched
                              ? "ভিডিও দেখা সম্পন্ন · কুইজ বাকি"
                              : unlocked
                                ? "আনলকড · দেখার জন্য প্রস্তুত"
                                : "লক করা (পূর্ববর্তী ক্লাস ও কুইজ শেষ করুন)"}
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

                {/* Expanded Class Classroom: Non-Skippable Video Player + Direct 25-MCQ Timed Quiz */}
                {isExpanded && unlocked && (
                  <div className="border-t border-border/70 p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                      {/* Video Player Column */}
                      <div className="lg:col-span-8">
                        <CourseVideoPlayer
                          youtubeId={lesson.youtubeId}
                          title={lesson.youtubeTitle}
                          thumbnail={lesson.thumbnail}
                          isCompleted={videoWatched}
                          onVideoCompleted={() => handleMarkVideoWatched(lesson.id)}
                        />
                      </div>

                      {/* Class Notes & Key Learning Points Column */}
                      <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-muted/30 p-5 lg:col-span-4">
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            ক্লাসের বিষয়বস্তু · {lesson.classLabel}
                          </p>
                          <h4 className="mt-1.5 text-sm font-bold leading-snug text-foreground">
                            {lesson.youtubeTitle}
                          </h4>
                          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            {lesson.summary}
                          </p>

                          <div className="mt-4 border-t border-border/70 pt-3.5">
                            <p className="text-xs font-semibold text-foreground">
                              এই ক্লাসে যা শিখবেন:
                            </p>
                            <ul className="mt-2 space-y-2">
                              {lesson.keyTakeaways.map((point) => (
                                <li
                                  key={point}
                                  className="flex items-start gap-2 text-xs text-muted-foreground"
                                >
                                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-5 border-t border-border/70 pt-3.5 text-xs">
                          <p className="font-semibold text-foreground">নিয়মাবলী:</p>
                          <p className="mt-1 leading-relaxed text-muted-foreground">
                            ভিডিওটি শুরু থেকে শেষ পর্যন্ত না টেনে দেখার পর নিচের ২৫টি প্রশ্নের (২০
                            মিনিট সময়) কুইজ সাবমিট করলে পরবর্তী ক্লাস আনলক হবে।
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Directly Below Every Class: 25-MCQ 20-Minute Quiz Section */}
                    <CourseQuizSection
                      classSerial={lesson.serial}
                      questions={classQuestions}
                      isVideoWatched={videoWatched}
                      savedResult={quizResult}
                      hasNextClass={Boolean(nextLesson)}
                      onQuizSubmitted={(result) => handleQuizSubmitted(lesson.id, result)}
                      onUnlockAndGoNext={() => {
                        if (nextLesson) {
                          scrollToLesson(nextLesson.id);
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
    </div>
  );
}
