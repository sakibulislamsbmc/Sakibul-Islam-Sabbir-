import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ExternalLink,
  Globe,
  GripHorizontal,
  MessageCircle,
  RotateCcw,
  Send,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  answerFromOfflineKnowledge,
  ASSISTANT_AVATAR_URL,
  ASSISTANT_STARTER_PROMPTS,
  ASSISTANT_WELCOME_MESSAGE,
  type AssistantRouteSuggestion,
  type AssistantWebSource,
} from "@/lib/assistant-knowledge";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  mode?: "welcome" | "online" | "offline" | "error";
  sources?: AssistantWebSource[];
  suggestedRoutes?: AssistantRouteSuggestion[];
  failedQuery?: string;
}

const BUBBLE_SIZE = 58;
const VIEWPORT_MARGIN = 14;
const HEADER_SAFE_TOP = 72;
const POSITION_STORAGE_KEY = "bismah_assistant_bubble_pos_v1";

function clampPosition(x: number, y: number, vw: number, vh: number) {
  const maxX = Math.max(VIEWPORT_MARGIN, vw - BUBBLE_SIZE - VIEWPORT_MARGIN);
  const maxY = Math.max(HEADER_SAFE_TOP, vh - BUBBLE_SIZE - VIEWPORT_MARGIN);
  return {
    x: Math.min(Math.max(VIEWPORT_MARGIN, x), maxX),
    y: Math.min(Math.max(HEADER_SAFE_TOP, y), maxY),
  };
}

function renderFormattedText(raw: string) {
  const lines = raw.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIdx} className="block min-h-[1.2em]">
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return (
              <strong key={partIdx} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={partIdx}>{part}</span>;
        })}
      </span>
    );
  });
}

export function BismahAssistantWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [viewport, setViewport] = useState({ width: 1280, height: 800 });
  const [bubblePos, setBubblePos] = useState({ x: 1180, y: 700 });
  const [isDragging, setIsDragging] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: ASSISTANT_WELCOME_MESSAGE,
      mode: "welcome",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [typingState, setTypingState] = useState<{
    messageId: string;
    visibleCount: number;
  } | null>(null);

  const dragStartRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPosX: number;
    startPosY: number;
    didMove: boolean;
  } | null>(null);

  const messagesScrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const suppressNextClickRef = useRef(false);

  // Post-mount hydration initialization (safe viewport & saved bubble position)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setViewport({ width: vw, height: vh });
    setIsOnline(navigator.onLine);

    const isMobileViewport = vw < 768;
    const defaultPos = {
      x: vw - BUBBLE_SIZE - (isMobileViewport ? 16 : 24),
      y: vh - BUBBLE_SIZE - (isMobileViewport ? 94 : 24),
    };

    try {
      const saved = window.sessionStorage.getItem(POSITION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { x?: number; y?: number };
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setBubblePos(clampPosition(parsed.x, parsed.y, vw, vh));
        } else {
          setBubblePos(clampPosition(defaultPos.x, defaultPos.y, vw, vh));
        }
      } else {
        setBubblePos(clampPosition(defaultPos.x, defaultPos.y, vw, vh));
      }
    } catch {
      setBubblePos(clampPosition(defaultPos.x, defaultPos.y, vw, vh));
    }

    setMounted(true);

    const handleResize = () => {
      const nextVw = window.innerWidth;
      const nextVh = window.innerHeight;
      setViewport({ width: nextVw, height: nextVh });
      setBubblePos((prev) => clampPosition(prev.x, prev.y, nextVw, nextVh));
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("resize", handleResize);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cleanup active typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current !== null) {
        window.clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  // Auto-scroll smoothly while thinking/typing/messages update
  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el || !isOpen) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, typingState?.visibleCount, isOpen]);

  // Global pointer listeners while dragging either the bubble or chat drawer header
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: globalThis.PointerEvent) => {
      const drag = dragStartRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;

      const dx = e.clientX - drag.startClientX;
      const dy = e.clientY - drag.startClientY;
      if (Math.hypot(dx, dy) > 6) {
        drag.didMove = true;
      }

      const next = clampPosition(
        drag.startPosX + dx,
        drag.startPosY + dy,
        window.innerWidth,
        window.innerHeight,
      );
      setBubblePos(next);
      try {
        window.sessionStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage restrictions
      }
    };

    const handlePointerUp = (e: globalThis.PointerEvent) => {
      const drag = dragStartRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;

      suppressNextClickRef.current = drag.didMove;
      dragStartRef.current = null;
      setIsDragging(false);

      if (drag.didMove) {
        window.setTimeout(() => {
          suppressNextClickRef.current = false;
        }, 60);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging]);

  const handleBubblePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragStartRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPosX: bubblePos.x,
      startPosY: bubblePos.y,
      didMove: false,
    };
    setIsDragging(true);
  };

  const handleHeaderDragStart = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragStartRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPosX: bubblePos.x,
      startPosY: bubblePos.y,
      didMove: true,
    };
    setIsDragging(true);
  };

  const startHumanTypingReveal = useCallback((messageId: string, fullText: string) => {
    if (typingTimerRef.current !== null) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReducedMotion || fullText.length === 0) {
      setTypingState(null);
      return;
    }

    setTypingState({ messageId, visibleCount: 0 });
    let cursor = 0;

    typingTimerRef.current = window.setInterval(() => {
      // Reveal naturally 2-5 characters advancing smoothly toward word boundaries
      const step = Math.min(4, Math.max(2, Math.ceil(fullText.length / 95)));
      cursor = Math.min(fullText.length, cursor + step);

      setTypingState({ messageId, visibleCount: cursor });

      if (cursor >= fullText.length) {
        if (typingTimerRef.current !== null) {
          window.clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        setTypingState(null);
      }
    }, 20);
  }, []);

  const handleSendMessage = useCallback(
    async (rawText?: string) => {
      const trimmed = (rawText ?? inputValue).trim();
      if (!trimmed || isThinking) return;

      if (!rawText) {
        setInputValue("");
      }

      // Finish any in-flight typing animation cleanly before starting next turn
      if (typingTimerRef.current !== null) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        setTypingState(null);
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
      };

      const nextHistory = [...messages, userMessage];
      setMessages(nextHistory);
      setIsThinking(true);

      const deliverBotReply = (botMsg: ChatMessage) => {
        setIsThinking(false);
        setMessages((prev) => [...prev, botMsg]);
        startHumanTypingReveal(botMsg.id, botMsg.text);
      };

      // Check real-time offline status first
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setIsOnline(false);
        const offline = answerFromOfflineKnowledge(trimmed, pathname);
        window.setTimeout(() => {
          deliverBotReply({
            id: `bot-${Date.now()}`,
            role: "assistant",
            text: offline.reply,
            mode: "offline",
            suggestedRoutes: offline.suggestedRoutes,
          });
        }, 500);
        return;
      }

      try {
        const res = await fetch("/api/assistant-chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
            currentPath: pathname,
          }),
        });

        const payload = (await res.json().catch(() => ({}))) as {
          reply?: string;
          sources?: AssistantWebSource[];
          suggestedRoutes?: AssistantRouteSuggestion[];
          error?: string;
          errorCode?: string;
        };

        if (!res.ok) {
          deliverBotReply({
            id: `bot-${Date.now()}`,
            role: "assistant",
            text:
              payload.error ||
              "অনলাইন AI সার্ভিসে সংযোগ করতে সাময়িক সমস্যা হচ্ছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন অথবা নিচের বাটনে ওয়েবসাইটের তথ্য থেকে উত্তর দেখুন।",
            mode: "error",
            failedQuery: trimmed,
            suggestedRoutes: [
              {
                label: "Contact & WhatsApp",
                href: "/contact",
                description: "সরাসরি যোগাযোগ করুন",
              },
            ],
          });
          return;
        }

        setIsOnline(true);
        deliverBotReply({
          id: `bot-${Date.now()}`,
          role: "assistant",
          text:
            payload.reply?.trim() ||
            "দুঃখিত, এই বিষয়ে সুনির্দিষ্ট তথ্য পাওয়া যায়নি। অনুগ্রহ করে অন্য কোনো প্রশ্ন জিজ্ঞাসা করুন।",
          mode: "online",
          sources: Array.isArray(payload.sources) ? payload.sources : [],
          suggestedRoutes: Array.isArray(payload.suggestedRoutes) ? payload.suggestedRoutes : [],
        });
      } catch {
        // Genuine network failure / disconnected internet: seamlessly answer via local website knowledge
        setIsOnline(false);
        const offline = answerFromOfflineKnowledge(trimmed, pathname);
        deliverBotReply({
          id: `bot-${Date.now()}`,
          role: "assistant",
          text: offline.reply,
          mode: "offline",
          suggestedRoutes: offline.suggestedRoutes,
        });
      }
    },
    [inputValue, isThinking, messages, pathname, startHumanTypingReveal],
  );

  const handleResetChat = () => {
    if (typingTimerRef.current !== null) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setTypingState(null);
    setIsThinking(false);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        text: ASSISTANT_WELCOME_MESSAGE,
        mode: "welcome",
      },
    ]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  if (!mounted) return null;

  // Smartly position the transparent glass chat box relative to the dragged bubble inside viewport bounds
  const panelWidth = Math.min(396, viewport.width - 24);
  const panelHeight = Math.min(560, viewport.height - 104);
  const bubbleCenterX = bubblePos.x + BUBBLE_SIZE / 2;
  const openAbove = bubblePos.y > viewport.height * 0.45;

  const rawPanelLeft =
    bubbleCenterX > viewport.width / 2 ? bubblePos.x + BUBBLE_SIZE - panelWidth : bubblePos.x;
  const panelLeft = Math.min(Math.max(12, rawPanelLeft), viewport.width - panelWidth - 12);

  const rawPanelTop = openAbove ? bubblePos.y - panelHeight - 12 : bubblePos.y + BUBBLE_SIZE + 12;
  const panelTop = Math.min(
    Math.max(HEADER_SAFE_TOP, rawPanelTop),
    viewport.height - panelHeight - 14,
  );

  const showStarterPrompts = messages.length === 1 && !isThinking;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[85] font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]"
      aria-live="polite"
    >
      {/* Expanded Transparent Frosted Glass Messenger Window */}
      {isOpen && (
        <section
          role="dialog"
          aria-label="Bismah সাব্বির স্যার এর Ai Assistant"
          style={{
            left: `${panelLeft}px`,
            top: `${panelTop}px`,
            width: `${panelWidth}px`,
            height: `${panelHeight}px`,
          }}
          className="pointer-events-auto fixed flex flex-col overflow-hidden rounded-[28px] border border-border/80 bg-background/60 text-foreground shadow-[0_28px_80px_-18px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-foreground/[0.08] backdrop-blur-2xl transition-[opacity,transform] duration-200"
        >
          {/* Subtle glass refraction highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-foreground/[0.045] to-transparent"
          />

          {/* Draggable Chat Header */}
          <div
            onPointerDown={handleHeaderDragStart}
            className="relative z-10 flex cursor-grab touch-none items-center justify-between gap-2 border-b border-border/60 bg-background/45 px-4 py-3 backdrop-blur-xl active:cursor-grabbing"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/80 bg-background/80 shadow-sm">
                <img
                  src={ASSISTANT_AVATAR_URL}
                  alt="Bismah সাব্বির স্যার এর Ai Assistant"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="truncate font-display text-sm font-bold tracking-tight text-foreground">
                    Bismah AI Assistant
                  </h2>
                  <GripHorizontal
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
                    aria-hidden="true"
                  />
                </div>
                <p className="flex items-center gap-1.5 truncate text-[11px] font-medium text-muted-foreground">
                  {isOnline ? (
                    <>
                      <Wifi className="h-3 w-3 shrink-0 text-foreground/80" />
                      <span>সাব্বির স্যার এর Assistant · Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>অফলাইন মোড · ওয়েবসাইট তথ্য</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="নতুন কথোপকথন শুরু করুন"
                aria-label="Reset conversation"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:border-border/70 hover:bg-background/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="বন্ধ করুন"
                aria-label="Close assistant"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:border-border/70 hover:bg-background/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            ref={messagesScrollRef}
            className="relative z-10 flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isCurrentlyTyping = typingState?.messageId === msg.id;
              const displayedText = isCurrentlyTyping
                ? msg.text.slice(0, typingState.visibleCount)
                : msg.text;
              const isFinishedRevealing = !isCurrentlyTyping;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-sm ${
                      isUser
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-border/75 bg-background/70 text-foreground backdrop-blur-xl"
                    }`}
                  >
                    <div className="space-y-1">
                      {renderFormattedText(displayedText)}
                      {isCurrentlyTyping && (
                        <span
                          aria-hidden="true"
                          className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-foreground/75 align-middle"
                        />
                      )}
                    </div>

                    {/* Explicit user-triggered Website Knowledge action when online API has an error */}
                    {!isUser && isFinishedRevealing && msg.mode === "error" && msg.failedQuery && (
                      <div className="mt-3 border-t border-border/50 pt-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const offline = answerFromOfflineKnowledge(
                              msg.failedQuery || "",
                              pathname,
                            );
                            const replyMsg: ChatMessage = {
                              id: `bot-offline-${Date.now()}`,
                              role: "assistant",
                              text: offline.reply,
                              mode: "offline",
                              suggestedRoutes: offline.suggestedRoutes,
                            };
                            setMessages((prev) => [...prev, replyMsg]);
                            startHumanTypingReveal(replyMsg.id, replyMsg.text);
                          }}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                          <span>ওয়েবসাইট তথ্য থেকে উত্তর দেখুন</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      </div>
                    )}

                    {/* In-app clickable section buttons (appear smoothly once text finishes typing) */}
                    {!isUser &&
                      isFinishedRevealing &&
                      msg.suggestedRoutes &&
                      msg.suggestedRoutes.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/50 pt-2.5">
                          {msg.suggestedRoutes.map((route) => (
                            <Link
                              key={route.href}
                              to={route.href}
                              className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-background/75 px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                            >
                              <span>{route.label}</span>
                              <ArrowUpRight className="h-3 w-3 shrink-0" />
                            </Link>
                          ))}
                        </div>
                      )}

                    {/* Verified Online Research Citations */}
                    {!isUser && isFinishedRevealing && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 space-y-1 border-t border-border/50 pt-2">
                        <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>রিসার্চ সোর্স</span>
                        </p>
                        <div className="flex flex-col gap-1">
                          {msg.sources.map((src) => (
                            <a
                              key={src.url}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 truncate text-[11px] text-foreground/80 underline-offset-2 hover:text-foreground hover:underline"
                            >
                              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate">{src.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isUser && msg.mode && msg.mode !== "welcome" && isFinishedRevealing && (
                    <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                      {msg.mode === "online"
                        ? "অনলাইন AI ও ওয়েব রিসার্চ"
                        : msg.mode === "offline"
                          ? "অফলাইন · ওয়েবসাইট তথ্য"
                          : "সিস্টেম বার্তা"}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Human-like Messenger Typing Indicator */}
            {isThinking && (
              <div className="flex items-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border/75 bg-background/70 px-4 py-2.5 text-xs text-muted-foreground backdrop-blur-xl">
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/70 [animation-delay:-0.25s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/70 [animation-delay:-0.12s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/70" />
                  </span>
                  <span>টাইপ করছেন…</span>
                </div>
              </div>
            )}

            {/* Quick Starter Question Chips on Initial Open */}
            {showStarterPrompts && (
              <div className="space-y-1.5 pt-1">
                <p className="px-0.5 text-[11px] font-medium text-muted-foreground">
                  দ্রুত জিজ্ঞাসা করতে পারেন:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ASSISTANT_STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void handleSendMessage(prompt)}
                      className="rounded-xl border border-border/80 bg-background/55 px-3 py-1.5 text-left text-xs font-medium text-foreground/90 backdrop-blur-md transition-colors hover:border-foreground/30 hover:bg-background/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transparent Glass Message Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage();
            }}
            className="relative z-10 border-t border-border/60 bg-background/45 p-3 backdrop-blur-xl"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-background/60 px-3 py-2 focus-within:border-foreground/50">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="যেকোনো প্রশ্ন লিখুন..."
                aria-label="Message Bismah AI Assistant"
                className="max-h-24 min-h-[36px] flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isThinking}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Messenger-Style Draggable Transparent Floating Bubble */}
      <button
        type="button"
        onPointerDown={handleBubblePointerDown}
        onClick={() => {
          if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            return;
          }
          setIsOpen((prev) => !prev);
        }}
        aria-label={
          isOpen
            ? "Bismah AI Assistant বন্ধ করুন (অথবা ড্র্যাগ করে সরান)"
            : "Bismah AI Assistant খুলুন (অথবা ড্র্যাগ করে সরান)"
        }
        aria-expanded={isOpen}
        title="Bismah সাব্বির স্যার এর Ai Assistant — ড্র্যাগ করে যেকোনো জায়গায় সরান"
        style={{
          left: `${bubblePos.x}px`,
          top: `${bubblePos.y}px`,
          width: `${BUBBLE_SIZE}px`,
          height: `${BUBBLE_SIZE}px`,
        }}
        className={`pointer-events-auto fixed flex cursor-grab touch-none select-none items-center justify-center rounded-full border border-border/85 bg-background/55 p-1 shadow-[0_14px_40px_-8px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-foreground/15 backdrop-blur-2xl transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing ${
          isDragging ? "scale-105" : "hover:scale-105"
        }`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full border border-border/60 bg-background/40">
          <img
            src={ASSISTANT_AVATAR_URL}
            alt="Bismah Assistant"
            referrerPolicy="no-referrer"
            draggable={false}
            className="pointer-events-none h-full w-full object-cover object-top"
          />
        </div>

        {/* Crisp corner Messenger icon badge */}
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-md"
        >
          {isOpen ? <X className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
        </span>
      </button>
    </div>
  );
}
