"use client";

import { useRef, useState } from "react";

/**
 * „🔊 Willi erklärt": holt eine kurze gesprochene Zusammenfassung des
 * gesammelten Wissens einer Rubrik und spielt sie ab.
 */
export default function RubrikAudioButton({ kat, label }: { kat: string; label: string }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function play() {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }
    setError(null);
    setState("loading");
    try {
      const res = await fetch("/api/rubrik/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kat }),
      });
      if (!res.ok) {
        let msg = "Konnte die Erklärung nicht erstellen.";
        try {
          const d = await res.json();
          if (d?.error) msg = d.error;
        } catch {}
        throw new Error(msg);
      }
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      audio.onended = () => setState("idle");
      audio.onerror = () => setState("idle");
      await audio.play();
      setState("playing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler.");
      setState("idle");
    }
  }

  return (
    <span className="flex flex-col items-end">
      <button
        onClick={play}
        disabled={state === "loading"}
        aria-label={`Willi erklärt die Rubrik ${label}`}
        className="flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-800 active:bg-neutral-100 disabled:opacity-50"
      >
        {state === "loading" ? "Willi überlegt…" : state === "playing" ? "⏹ Stopp" : "🔊 Willi erklärt"}
      </button>
      {error && <span className="mt-1 max-w-[180px] text-right text-[11px] text-red-600">{error}</span>}
    </span>
  );
}
