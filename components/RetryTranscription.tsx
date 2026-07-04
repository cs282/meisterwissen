"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * "🔄 Transkription erneut versuchen": startet für einen Baustein, dessen
 * Aufnahme noch kein Transkript hat, einen neuen Whisper-Versuch.
 */
export default function RetryTranscription({ unitId }: { unitId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/transcribe/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: unitId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error ?? "Erneuter Versuch fehlgeschlagen.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={retry}
        disabled={busy}
        className="flex min-h-[48px] items-center justify-center rounded-xl bg-amber-600 px-4 text-base font-semibold text-white active:bg-amber-700 disabled:opacity-50"
      >
        {busy ? "Wird erneut transkribiert…" : "🔄 Transkription erneut versuchen"}
      </button>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
