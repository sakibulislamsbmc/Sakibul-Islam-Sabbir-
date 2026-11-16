export function GoogleMeetFingertip({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-3.5 rounded-xl border border-[#00D978]/30 bg-[#050505]/95 ${
        compact ? "px-3.5 py-2.5" : "px-4 py-3.5"
      }`}
    >
      {/* Concentric Fingertip Ripple Framing the Google Meet App Icon */}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
        {/* Outer fingertip ripple rings */}
        <svg
          viewBox="0 0 64 64"
          className="absolute inset-0 h-full w-full text-[#00D978]"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14 26C14 15.5 22.1 7 32 7C41.9 7 50 15.5 50 26"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10 34C10 19.6 19.8 8 32 8C44.2 8 54 19.6 54 34C54 44.5 47 54 36 57"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="4 3"
          />
          <path
            d="M19 46C22.5 50.5 27 53 32 53C38.6 53 44 47.6 44 41"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle
            cx="32"
            cy="32"
            r="20"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        </svg>

        {/* Inner Google Meet App Platform Tile */}
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white p-1.5 shadow-[0_0_18px_rgba(0,217,120,0.28)]">
          <svg viewBox="0 0 48 48" className="h-full w-full" aria-label="Google Meet icon">
            <path fill="#00832d" d="M27.5 19.5V28.5L34 34V14L27.5 19.5Z" />
            <path fill="#0066da" d="M6 15V33C6 35.2 7.8 37 10 37H27.5V28.5H14V19.5H6V15Z" />
            <path fill="#e94235" d="M14 11H27.5V19.5H14V11Z" />
            <path fill="#ffba00" d="M6 15L14 11V19.5H6V15Z" />
            <path fill="#00ac47" d="M14 19.5H27.5V28.5H14V19.5Z" />
            <path
              fill="#00ac47"
              d="M34 14L41.2 8.4C42.5 7.4 44 8.3 44 10V38C44 39.7 42.5 40.6 41.2 39.6L34 34V14Z"
            />
          </svg>
        </div>
      </div>

      <div className="min-w-0">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00D978]">
          LIVE ONLINE PLATFORM
        </p>
        <p className="mt-0.5 font-['Manrope',sans-serif] text-sm font-bold text-white">
          Google Meet · Instant Access at Your Fingertips
        </p>
      </div>
    </div>
  );
}
