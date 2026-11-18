import { useCallback, useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileQuestion,
  Lock,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { QUIZ_DURATION_SECONDS, type QuizQuestion } from "@/data/course-quizzes";

export interface SavedQuizResult {
  score: number;
  total: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  answers: Record<string, number>;
  autoSubmitted: boolean;
}

function formatTimer(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const OPTION_LABELS = ["ক", "খ", "গ", "ঘ"] as const;

export function CourseQuizSection({
  classSerial,
  questions,
  isVideoWatched,
  savedResult,
  hasNextClass,
  durationSeconds = QUIZ_DURATION_SECONDS,
  lockedPrompt,
  readyPrompt,
  onQuizSubmitted,
  onUnlockAndGoNext,
}: {
  classSerial: string;
  questions: QuizQuestion[];
  isVideoWatched: boolean;
  savedResult: SavedQuizResult | undefined;
  hasNextClass: boolean;
  durationSeconds?: number;
  lockedPrompt?: string;
  readyPrompt?: string;
  onQuizSubmitted: (result: SavedQuizResult) => void;
  onUnlockAndGoNext: () => void;
}) {
  const [quizActive, setQuizActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showReview, setShowReview] = useState(false);
  const durationMins = Math.max(1, Math.round(durationSeconds / 60));

  const gradeAndSubmit = useCallback(
    (isAuto: boolean, currentAnswers: Record<string, number>) => {
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      for (const q of questions) {
        const picked = currentAnswers[q.id];
        if (picked === undefined) {
          unansweredCount += 1;
        } else if (picked === q.correctIndex) {
          correctCount += 1;
        } else {
          wrongCount += 1;
        }
      }

      const result: SavedQuizResult = {
        score: correctCount,
        total: questions.length,
        correctCount,
        wrongCount,
        unansweredCount,
        answers: currentAnswers,
        autoSubmitted: isAuto,
      };

      setQuizActive(false);
      setShowReview(true);
      onQuizSubmitted(result);
    },
    [questions, onQuizSubmitted],
  );

  // Countdown timer with automatic submission at 00:00
  useEffect(() => {
    if (!quizActive) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          gradeAndSubmit(true, answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [quizActive, answers, gradeAndSubmit]);

  const startQuiz = () => {
    setAnswers({});
    setSecondsLeft(durationSeconds);
    setShowReview(false);
    setQuizActive(true);
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-muted/35 p-4 sm:p-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-xs">
            {isVideoWatched ? (
              <FileQuestion className="h-5 w-5" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              ক্লাস {classSerial} মূল্যায়ন · {questions.length}টি MCQ · {durationMins} মিনিট সময়
            </p>
            <h4 className="mt-0.5 text-base font-bold text-foreground sm:text-lg">
              ক্লাস {classSerial} পরবর্তী কুইজ পরীক্ষা
            </h4>
          </div>
        </div>

        {quizActive && (
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-primary px-4 py-1.5 font-mono text-xs font-bold tabular-nums text-primary-foreground shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            <span>বাকি সময়: {formatTimer(secondsLeft)}</span>
          </div>
        )}
      </div>

      {/* State 1: Locked until lesson/video watched */}
      {!isVideoWatched && (
        <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {lockedPrompt ||
              `এই ক্লাসের ${questions.length}টি MCQ কুইজ আনলক করতে প্রথমে উপরের ভিডিওটি শুরু থেকে শেষ পর্যন্ত না টেনে সম্পূর্ণ দেখুন।`}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            ক্লাস শেষ করার পর আনলক হবে
          </span>
        </div>
      )}

      {/* State 2: Lesson watched/completed, quiz not started and no result yet */}
      {isVideoWatched && !quizActive && !savedResult && (
        <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            <p>
              {readyPrompt ||
                `ক্লাস ${classSerial}-এর পাঠ সম্পন্ন হয়েছে! এখন এই ক্লাসের ওপর ভিত্তি করে ${questions.length}টি বহুনির্বাচনি (MCQ) প্রশ্নের উত্তর দিন।`}
            </p>
            <p>
              সময়সীমা:{" "}
              <strong className="font-semibold text-foreground">{durationMins} মিনিট</strong> (
              {durationMins} মিনিট পূর্ণ হলে স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে)। কুইজ সম্পন্ন হলে
              পরবর্তী ক্লাস আনলক হবে।
            </p>
          </div>

          <button
            type="button"
            onClick={startQuiz}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            কুইজ শুরু করুন
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* State 3: Active Timed Quiz */}
      {quizActive && (
        <div className="mt-5 space-y-5">
          {/* Progress Sticky Bar inside Quiz */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs">
            <span className="font-medium text-muted-foreground">
              উত্তর দিয়েছেন:{" "}
              <strong className="font-mono font-bold tabular-nums text-foreground">
                {answeredCount} / {questions.length}
              </strong>
            </span>
            <span className="text-muted-foreground">
              {durationMins} মিনিট পর স্বয়ংক্রিয়ভাবে কুইজ সাবমিট হবে
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const selectedOption = answers[q.id];
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-border bg-background p-4 sm:p-5"
                >
                  <p className="text-sm font-semibold leading-relaxed text-foreground sm:text-base">
                    <span className="mr-2 font-mono text-xs text-muted-foreground tabular-nums">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    {q.question}
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOption === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs leading-snug transition-all sm:text-sm ${
                            isChosen
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border bg-muted/35 text-foreground hover:border-foreground/30 hover:bg-muted/70"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                              isChosen
                                ? "border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
                                : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            {OPTION_LABELS[optIdx]}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              মোট {answeredCount}টি প্রশ্নের উত্তর চিহ্নিত করা হয়েছে (মোট {questions.length}টি)
            </span>
            <button
              type="button"
              onClick={() => gradeAndSubmit(false, answers)}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-7 text-xs font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
            >
              কুইজ সাবমিট করুন
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* State 4: Submitted Quiz Scorecard & Next Class Unlock */}
      {!quizActive && savedResult && (
        <div className="mt-5 space-y-5">
          {savedResult.autoSubmitted && (
            <p className="text-xs font-medium text-muted-foreground">
              {durationMins} মিনিট সময় পূর্ণ হওয়ায় আপনার কুইজ স্বয়ংক্রিয়ভাবে সাবমিট হয়েছে।
            </p>
          )}

          {/* Clean Scorecard Grid matching white/monochrome palette */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[11px] font-medium text-muted-foreground">মোট স্কোর</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground">
                {savedResult.score}/{savedResult.total}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {Math.round((savedResult.score / savedResult.total) * 100)}% নম্বর
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[11px] font-medium text-muted-foreground">সঠিক উত্তর</p>
              <p className="mt-1 flex items-center gap-1.5 font-mono text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {savedResult.correctCount}টি
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[11px] font-medium text-muted-foreground">ভুল উত্তর</p>
              <p className="mt-1 flex items-center gap-1.5 font-mono text-2xl font-bold tabular-nums text-rose-700 dark:text-rose-400">
                <XCircle className="h-5 w-5 shrink-0" />
                {savedResult.wrongCount}টি
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[11px] font-medium text-muted-foreground">উত্তরহীন</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-muted-foreground">
                {savedResult.unansweredCount}টি
              </p>
            </div>
          </div>

          {/* Action Row: Unlock / Jump to Next Class + Toggle Review + Retake */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Award className="h-4 w-4 shrink-0" />
              <span>
                {hasNextClass
                  ? "কুইজ সম্পন্ন হয়েছে — পরবর্তী ক্লাস আনলক করা হয়েছে!"
                  : "অভিনন্দন! আপনি সম্পূর্ণ কোর্সটি সফলভাবে শেষ করেছেন।"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReview((prev) => !prev)}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-muted/50 px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {showReview ? "উত্তর পর্যালোচনা লুকান" : "উত্তর পর্যালোচনা দেখুন"}
              </button>

              <button
                type="button"
                onClick={startQuiz}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                পুনরায় কুইজ দিন
              </button>

              {hasNextClass && (
                <button
                  type="button"
                  onClick={onUnlockAndGoNext}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                >
                  পরবর্তী ক্লাসে যান
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Detailed Answer Breakdown */}
          {showReview && (
            <div className="space-y-3 border-t border-border pt-4">
              {questions.map((q, idx) => {
                const picked = savedResult.answers[q.id];
                const isCorrect = picked === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-border bg-background p-4 text-xs sm:text-sm"
                  >
                    <p className="font-semibold text-foreground">
                      {String(idx + 1).padStart(2, "0")}. {q.question}
                    </p>
                    <p className="mt-1.5 text-muted-foreground">
                      আপনার উত্তর:{" "}
                      <span
                        className={
                          picked === undefined
                            ? "font-semibold text-muted-foreground"
                            : isCorrect
                              ? "font-semibold text-emerald-700 dark:text-emerald-400"
                              : "font-semibold text-rose-700 dark:text-rose-400"
                        }
                      >
                        {picked !== undefined ? q.options[picked] : "উত্তর দেওয়া হয়নি"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="mt-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                        সঠিক উত্তর: {q.options[q.correctIndex]}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      ব্যাখ্যা: {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
