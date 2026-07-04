"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type Photo = { id: string; url: string | null };

/** Baustellenbilder anzeigen + hinzufügen (Kamera/Galerie). Wiederverwendbar. */
export default function PhotoSection({ unitId, items }: { unitId: string; items: Photo[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/knowledge/${unitId}/photo`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Upload fehlgeschlagen.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">Baustellenbilder</h2>
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((p) =>
            p.url ? (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="aspect-square overflow-hidden rounded-lg border border-neutral-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt="Baustellenfoto zu diesem Wissensbaustein"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </a>
            ) : null,
          )}
        </div>
      )}

      <label className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-4 text-base font-medium text-neutral-700 active:bg-neutral-100">
        {busy ? "Wird hochgeladen…" : "📷 Bild hinzufügen"}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPick}
          disabled={busy}
          className="hidden"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </section>
  );
}
