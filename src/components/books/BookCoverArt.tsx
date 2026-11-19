import type { BookItem } from "../../data/books-data";

interface BookCoverArtProps {
  book: BookItem;
  className?: string;
  showBadge?: boolean;
  unlockedBadge?: boolean;
}

export function BookCoverArt({
  book,
  className = "",
  showBadge = true,
  unlockedBadge = false,
}: BookCoverArtProps) {
  return (
    <div className={`relative aspect-[3/4.15] w-full overflow-hidden select-none ${className}`}>
      {book.coverImageUrl ? (
        <img
          src={book.coverImageUrl}
          alt={book.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <CoverArtCanvas book={book} />
      )}

      {showBadge && (
        <div className="pointer-events-none absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className="inline-flex items-center rounded-xl bg-white/95 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-900 shadow-sm backdrop-blur-sm">
            {book.badgeLabel}
          </span>
          {unlockedBadge && book.accessType === "paid" && (
            <span className="inline-flex items-center rounded-xl bg-emerald-600/95 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
              UNLOCKED
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function CoverArtCanvas({ book }: { book: BookItem }) {
  if (book.coverTheme === "crimson-signal") {
    return (
      <div className="relative h-full w-full bg-[#1a1416] text-white transition-transform duration-500 group-hover:scale-[1.02]">
        <svg
          viewBox="0 0 400 435"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="crimsonSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6c1824" />
              <stop offset="100%" stopColor="#a81f2c" />
            </linearGradient>
            <radialGradient id="crimsonGlow" cx="50%" cy="62%" r="55%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#450a0a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="435" fill="url(#crimsonSky)" />
          <rect width="400" height="435" fill="url(#crimsonGlow)" />
          {/* Concentric editorial signal rings */}
          {[28, 48, 68, 88, 108, 128, 148, 168, 188, 212].map((r, i) => (
            <circle
              key={r}
              cx="200"
              cy="252"
              r={r}
              fill="none"
              stroke={i % 2 === 0 ? "#dc2626" : "#7f1d1d"}
              strokeWidth="10"
              opacity={0.72 - i * 0.045}
            />
          ))}
          {/* Radiant signal pathways */}
          <path
            d="M 200 226 C 170 185, 110 155, 42 52"
            fill="none"
            stroke="#fecaca"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <path
            d="M 200 226 C 218 170, 192 120, 208 14"
            fill="none"
            stroke="#fecaca"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.75"
          />
          <path
            d="M 200 226 C 258 190, 315 162, 386 108"
            fill="none"
            stroke="#fecaca"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          {/* Portal arc */}
          <circle cx="200" cy="248" r="30" fill="#ffffff" />
          {/* Dark angled editorial foreground */}
          <polygon points="0,256 400,224 400,435 0,435" fill="#1b1719" />
          {/* Light beam path */}
          <polygon points="184,248 216,248 232,292 174,292" fill="#e5e7eb" opacity="0.92" />
          {/* Minimal silhouette */}
          <circle cx="200" cy="231" r="4" fill="#111111" />
          <path d="M196 237 L204 237 L203 251 L197 251 Z" fill="#111111" />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-6 text-center">
          <p className="font-['Hind_Siliguri'] text-[26px] leading-[1.08] font-bold tracking-tight text-neutral-100 drop-shadow-sm sm:text-[30px]">
            {book.coverTitleTop}
          </p>
          <p className="font-['Hind_Siliguri'] text-[34px] leading-[1.05] font-extrabold tracking-tight text-[#ef4444] drop-shadow-sm sm:text-[38px]">
            {book.coverTitleMain}
          </p>
          <p className="mt-1.5 max-w-[260px] font-['Hind_Siliguri'] text-[11px] font-medium text-neutral-300">
            {book.coverSubtitle}
          </p>
          <div className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-3 text-left">
            <div>
              <p className="font-['Hind_Siliguri'] text-[11px] font-semibold text-neutral-200">
                {book.authorBn}
              </p>
              <p className="font-['Hind_Siliguri'] text-[9px] text-neutral-400">
                {book.authorRoleBn}
              </p>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
              AI EDITION
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (book.coverTheme === "indigo-studio") {
    return (
      <div className="relative h-full w-full bg-[#111526] text-white transition-transform duration-500 group-hover:scale-[1.02]">
        <svg
          viewBox="0 0 400 435"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="indigoBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="55%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="400" height="435" fill="url(#indigoBg)" />
          {/* Swiss studio grid lines */}
          {[60, 120, 180, 240, 300, 340].map((x) => (
            <line
              key={`v-${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="260"
              stroke="#ffffff"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          ))}
          {[55, 110, 165, 220].map((y) => (
            <line
              key={`h-${y}`}
              x1="0"
              y1={y}
              x2="400"
              y2={y}
              stroke="#ffffff"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          ))}
          {/* Geometric bezier composition */}
          <circle cx="290" cy="118" r="72" fill="#f59e0b" opacity="0.18" />
          <circle cx="290" cy="118" r="44" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
          <path
            d="M 70 198 C 120 82, 220 220, 330 90"
            fill="none"
            stroke="#c7d2fe"
            strokeWidth="2.5"
          />
          <rect x="64" y="192" width="12" height="12" fill="#fbbf24" />
          <rect x="324" y="84" width="12" height="12" fill="#fbbf24" />
          <circle cx="195" cy="145" r="7" fill="#ffffff" />
          {/* Foreground diagonal stage */}
          <polygon points="0,248 400,218 400,435 0,435" fill="#0d101d" />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start px-6 pb-6 text-left">
          <span className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-300/90">
            CREATIVE STUDIO BLUEPRINT
          </span>
          <p className="font-['Hind_Siliguri'] text-[24px] leading-[1.1] font-bold text-indigo-100 sm:text-[27px]">
            {book.coverTitleTop}
          </p>
          <p className="font-['Hind_Siliguri'] text-[34px] leading-[1.06] font-extrabold text-amber-400 sm:text-[38px]">
            {book.coverTitleMain}
          </p>
          <p className="mt-1.5 font-['Hind_Siliguri'] text-[11px] font-medium text-indigo-200/80">
            {book.coverSubtitle}
          </p>
          <div className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-3">
            <div>
              <p className="font-['Hind_Siliguri'] text-[11px] font-semibold text-white">
                {book.authorBn}
              </p>
              <p className="font-['Hind_Siliguri'] text-[9px] text-indigo-300/80">
                {book.authorRoleBn}
              </p>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-indigo-300/80">
              STUDIO ED.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (book.coverTheme === "obsidian-ai") {
    return (
      <div className="relative h-full w-full bg-[#091211] text-white transition-transform duration-500 group-hover:scale-[1.02]">
        <svg
          viewBox="0 0 400 435"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="emeraldDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="60%" stopColor="#022c22" />
              <stop offset="100%" stopColor="#090d0c" />
            </linearGradient>
          </defs>
          <rect width="400" height="435" fill="url(#emeraldDark)" />
          {/* Shield geometry */}
          {[36, 62, 88, 114, 140].map((r, i) => (
            <polygon
              key={r}
              points={`200,${150 - r * 0.72} ${200 + r * 0.68},${150 - r * 0.34} ${200 + r * 0.68},${150 + r * 0.38} 200,${150 + r * 0.82} ${200 - r * 0.68},${150 + r * 0.38} ${200 - r * 0.68},${150 - r * 0.34}`}
              fill="none"
              stroke="#34d399"
              strokeWidth="1.4"
              opacity={0.55 - i * 0.08}
            />
          ))}
          <circle cx="200" cy="150" r="18" fill="#10b981" opacity="0.9" />
          <path
            d="M193 150 L198 155 L208 144"
            fill="none"
            stroke="#022c22"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon points="0,256 400,236 400,435 0,435" fill="#0b100f" />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-6 text-center">
          <span className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-300/90">
            OPEN ACCESS COMMUNITY GUIDE
          </span>
          <p className="font-['Hind_Siliguri'] text-[24px] leading-[1.08] font-bold text-emerald-50 sm:text-[28px]">
            {book.coverTitleTop}
          </p>
          <p className="font-['Hind_Siliguri'] text-[34px] leading-[1.06] font-extrabold text-emerald-400 sm:text-[38px]">
            {book.coverTitleMain}
          </p>
          <p className="mt-1.5 max-w-[260px] font-['Hind_Siliguri'] text-[11px] font-medium text-emerald-100/75">
            {book.coverSubtitle}
          </p>
          <div className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-3 text-left">
            <div>
              <p className="font-['Hind_Siliguri'] text-[11px] font-semibold text-white">
                {book.authorBn}
              </p>
              <p className="font-['Hind_Siliguri'] text-[9px] text-emerald-200/70">
                {book.authorRoleBn}
              </p>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-300/80">
              FREE PDF
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ivory-scholar (Warm editorial book cover)
  return (
    <div className="relative h-full w-full bg-[#f4f1ea] text-neutral-900 transition-transform duration-500 group-hover:scale-[1.02]">
      <svg
        viewBox="0 0 400 435"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="400" height="435" fill="#f5f2eb" />
        {/* Architectural arch & ruled notebook geometry */}
        <rect
          x="26"
          y="26"
          width="348"
          height="383"
          fill="none"
          stroke="#18181b"
          strokeWidth="1"
          opacity="0.16"
        />
        <path
          d="M 110 230 L 110 132 A 90 90 0 0 1 290 132 L 290 230 Z"
          fill="#18181b"
          opacity="0.93"
        />
        <circle cx="200" cy="136" r="46" fill="none" stroke="#d97706" strokeWidth="2" />
        <circle cx="200" cy="136" r="22" fill="#d97706" opacity="0.9" />
        <line x1="65" y1="230" x2="335" y2="230" stroke="#18181b" strokeWidth="2" />
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-7 pb-6 text-center">
        <span className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-700">
          STUDENT HANDBOOK • FREE
        </span>
        <p className="font-['Hind_Siliguri'] text-[22px] leading-[1.1] font-bold text-neutral-800 sm:text-[26px]">
          {book.coverTitleTop}
        </p>
        <p className="font-['Hind_Siliguri'] text-[32px] leading-[1.08] font-extrabold text-neutral-950 sm:text-[36px]">
          {book.coverTitleMain}
        </p>
        <p className="mt-1.5 max-w-[260px] font-['Hind_Siliguri'] text-[11px] font-medium text-neutral-600">
          {book.coverSubtitle}
        </p>
        <div className="mt-4 flex w-full items-center justify-between border-t border-neutral-900/15 pt-3 text-left">
          <div>
            <p className="font-['Hind_Siliguri'] text-[11px] font-semibold text-neutral-900">
              {book.authorBn}
            </p>
            <p className="font-['Hind_Siliguri'] text-[9px] text-neutral-600">
              {book.authorRoleBn}
            </p>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-700">
            OPEN PDF
          </span>
        </div>
      </div>
    </div>
  );
}
