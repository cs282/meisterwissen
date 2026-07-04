"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type Technical = { id: string; source: string; filename: string; url: string | null };

/** Technische Merkblätter (PDF) anzeigen + hinzufügen. Wiederverwendbar. */
export default function TechnicalSection({
  unitId,
  items,
}: {
  unitId: string;
  items: Technical[];
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Bitte PDF wählen.");
      return;
    }
    if (!source.trim()) {
      setError("Bitte Quellenangabe eintragen.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("source", source);
      const res = await fetch(`/api/knowledge/${unitId}/technical-data`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Upload fehlgeschlagen.");
      setFile(null);
      setSource("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <h2 className="eyebrow text-neutral-400">Technische Merkblätter</h2>
        <span className="rule-gold flex-1" />
      </div>
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((t) => (
            <li key={t.id} className="rounded-lg border border-neutral-200 p-3">
              <p className="text-base font-medium text-neutral-800">{t.source}</p>
              {t.url ? (
                <a href={t.url} target="_blank" rel="noreferrer" className="text-sm text-blue-700 underline">
                  📄 {t.filename}
                </a>
              ) : (
                <span className="text-sm text-neutral-500">📄 {t.filename}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={upload} className="mt-1 flex flex-col gap-2 rounded-lg border border-dashed border-neutral-300 p-3">
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder='Quelle (z. B. "Caparol TI Indeko-plus")'
          className="min-h-[44px] w-full rounded-lg border border-neutral-300 p-2 text-base"
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-neutral-800 file:px-2.5 file:py-1.5 file:text-white"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="btn-ink min-h-[48px] px-4 text-base disabled:opacity-50"
        >
          {busy ? "Wird hochgeladen…" : "Merkblatt hochladen"}
        </button>
      </form>
    </section>
  );
}
