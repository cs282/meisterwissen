"use client";

/**
 * Wiedergabe-Tempo für Willis Stimme (1× / 1,5× / 2×).
 * Clientseitig über audio.playbackRate – Tonhöhe bleibt natürlich,
 * keine zusätzlichen Kosten. Auswahl wird pro Gerät gemerkt.
 */

const LS_KEY = "mw_willi_speed";
export const SPEEDS = [1, 1.5, 2] as const;

export function getWilliSpeed(): number {
  if (typeof window === "undefined") return 1;
  const v = parseFloat(window.localStorage.getItem(LS_KEY) ?? "1");
  return (SPEEDS as readonly number[]).includes(v) ? v : 1;
}

export function setWilliSpeed(v: number) {
  if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, String(v));
}

export default function SpeedControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Willis Sprechtempo">
      <span className="mr-1 text-xs text-neutral-500">Tempo</span>
      {SPEEDS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => {
            setWilliSpeed(s);
            onChange(s);
          }}
          aria-pressed={value === s}
          className={`min-h-[36px] rounded-full px-3 text-xs font-semibold ${
            value === s
              ? "bg-neutral-900 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 active:bg-neutral-100"
          }`}
        >
          {s === 1 ? "1×" : s === 1.5 ? "1,5×" : "2×"}
        </button>
      ))}
    </div>
  );
}
