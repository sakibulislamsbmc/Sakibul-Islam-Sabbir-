import { Calendar, Info, Mail, MapPin, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { EVENT_CONFIG, WORKSHOP_ASSETS } from "@/data/workshop-data";

interface WorkshopRegistrationModalProps {
  open: boolean;
  onClose: () => void;
}

export function WorkshopRegistrationModal({ open, onClose }: WorkshopRegistrationModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="workshop-reg-title"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#00D978]/35 bg-[#050505] p-6 text-white shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close registration details"
          className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-[#0B0F0D] text-[#A1A1AA] transition-colors hover:border-[#00D978]/50 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0B0F0D] p-1.5">
            <img
              src={WORKSHOP_ASSETS.logo}
              alt="Workshop Crest"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D978]">
              {EVENT_CONFIG.edition} · ADMISSIONS UPDATE
            </p>
            <h3
              id="workshop-reg-title"
              className="mt-0.5 font-['Manrope',sans-serif] text-xl font-extrabold text-white"
            >
              {EVENT_CONFIG.eventName}
            </h3>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-[#0B0F0D] p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#00D978]" />
            <p className="text-xs leading-relaxed text-[#A1A1AA] sm:text-sm">
              Online seat registration is currently awaiting final date, venue, and fee confirmation
              from <strong className="text-white">{EVENT_CONFIG.organizer}</strong> and{" "}
              <strong className="text-white">{EVENT_CONFIG.mainSponsor}</strong>. Once announced,
              verified students will be able to confirm seats directly here.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-[#0B0F0D] p-3">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#00D978]">
              <Calendar className="h-3.5 w-3.5" />
              <span>Date</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-white">{EVENT_CONFIG.eventDateLabel}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0B0F0D] p-3">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#00D978]">
              <MapPin className="h-3.5 w-3.5" />
              <span>Venue</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-white">{EVENT_CONFIG.eventVenueLabel}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 border-t border-white/10 pt-5 sm:flex-row">
          <a
            href={`mailto:${EVENT_CONFIG.officialEmail}?subject=Workshop%202027%20Early%20Interest`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#00D978] px-4 text-xs font-extrabold uppercase tracking-wider text-[#050505] transition-opacity hover:opacity-90"
          >
            <Mail className="h-3.5 w-3.5" />
            Email Organizer
          </a>
          <Link
            to="/contact"
            onClick={onClose}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-white/15 bg-[#0B0F0D] px-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-[#00D978]/50 hover:text-[#00D978]"
          >
            Send Inquiry Form
          </Link>
        </div>
      </div>
    </div>
  );
}
