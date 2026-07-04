/**
 * Wortmarke „Schmid – Die Malerwerkstätte" mit Farbroller-Symbol.
 * Reines SVG/Text – keine Bilddatei nötig. Bei echtem Logo einfach hier tauschen.
 *
 * variant: "light" für dunklen Hintergrund (weiße Schrift),
 *          "dark"  für hellen Hintergrund.
 */
export default function Logo({
  variant = "light",
  compact = false,
  className = "",
}: {
  variant?: "light" | "dark";
  compact?: boolean;
  className?: string;
}) {
  const light = variant === "light";
  const text = light ? "text-white" : "text-neutral-900";
  const sub = light ? "text-[#c2a15c]" : "text-neutral-500";
  const frame = light ? "bg-white/[0.06] ring-[#c2a15c]/35" : "bg-neutral-900/[0.04] ring-neutral-900/10";

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${frame}`}>
          <RollerIcon className={`h-5 w-5 ${text}`} />
        </span>
        <span className="flex items-baseline gap-1.5">
          <span className={`text-base font-extrabold tracking-tight ${text}`}>Schmid</span>
          <span className={`hidden text-[9px] font-semibold uppercase tracking-[0.18em] ${sub} sm:inline`}>
            Malerwerkstätte
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${frame}`}>
        <RollerIcon className={`h-7 w-7 ${text}`} />
      </span>
      <span className="leading-none">
        <span className={`block text-2xl font-extrabold tracking-tight ${text}`}>Schmid</span>
        <span className={`mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] ${sub}`}>
          Die Malerwerkstätte
        </span>
      </span>
    </div>
  );
}

function RollerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      {/* frische Farbspur */}
      <rect x="6" y="25" width="24" height="5" rx="2.5" fill="#3b82f6" />
      {/* Roller-Walze */}
      <rect x="6" y="8" width="24" height="12" rx="3.5" fill="currentColor" />
      {/* Bügel + Griff */}
      <path
        d="M30 12h5a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 35 20H21.5a2.5 2.5 0 0 0-2.5 2.5V25"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="16.6" y="30" width="4.8" height="11" rx="2.4" fill="currentColor" />
    </svg>
  );
}
