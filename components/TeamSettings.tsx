"use client";

import { useEffect, useRef, useState } from "react";
import { VOICE_OPTIONS } from "@/lib/people";

type Person = {
  name: string;
  role: string;
  expertise: string;
  voice: string;
  emoji: string;
  count: number;
  configured: boolean;
};

export default function TeamSettings() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      const d = await res.json();
      setPeople(d.people ?? []);
    } catch {
      setLoadError("Personen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function update(name: string, patch: Partial<Person>) {
    setPeople((ps) => ps.map((p) => (p.name === name ? { ...p, ...patch } : p)));
  }

  async function preview(voice: string, name: string) {
    audioRef.current?.pause();
    setPreviewing(name);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Hallo, ich bin ${name}. So klinge ich, wenn ich dir etwas erkläre.`, voice }),
      });
      if (!res.ok) throw new Error();
      const audio = new Audio(URL.createObjectURL(await res.blob()));
      audioRef.current = audio;
      audio.onended = () => setPreviewing(null);
      await audio.play();
    } catch {
      setPreviewing(null);
    }
  }

  async function save(p: Person) {
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error ?? "Speichern fehlgeschlagen.");
      update(p.name, { configured: true });
      flash(p.name, "✓ gespeichert");
    } catch (e) {
      flash(p.name, e instanceof Error ? e.message : "Fehler", true);
    }
  }

  const [flashes, setFlashes] = useState<Record<string, { msg: string; err?: boolean }>>({});
  function flash(name: string, msg: string, err = false) {
    setFlashes((f) => ({ ...f, [name]: { msg, err } }));
    setTimeout(() => setFlashes((f) => ({ ...f, [name]: undefined as never })), 3000);
  }

  function addPerson() {
    const name = newName.replace(/\s+/g, " ").trim();
    if (!name || people.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setNewName("");
      return;
    }
    setPeople((ps) => [
      { name, role: "", expertise: "", voice: "onyx", emoji: "👤", count: 0, configured: false },
      ...ps,
    ]);
    setNewName("");
  }

  if (loading) return <p className="text-sm text-neutral-500">Personen werden geladen…</p>;
  if (loadError) return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{loadError}</p>;

  return (
    <div className="flex flex-col gap-5">
      {/* Neue Person anlegen */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Neue Person (Name)…"
          className="min-h-[44px] flex-1 rounded-xl border border-neutral-300 px-3 text-base"
        />
        <button
          onClick={addPerson}
          disabled={!newName.trim()}
          className="min-h-[44px] rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          + Anlegen
        </button>
      </div>

      {people.length === 0 && (
        <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          Noch keine Personen. Lege oben eine an – oder nimm etwas unter einem Namen auf.
        </p>
      )}

      {people.map((p) => (
        <div key={p.name} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <input
              value={p.emoji}
              onChange={(e) => update(p.name, { emoji: e.target.value })}
              aria-label="Emoji"
              className="h-11 w-12 rounded-lg border border-neutral-300 text-center text-2xl"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold">{p.name}</p>
              <p className="text-xs text-neutral-500">
                {p.count} Baustein{p.count === 1 ? "" : "e"}
                {!p.configured && " · noch nicht eingerichtet"}
              </p>
            </div>
          </div>

          <label className="text-xs font-semibold text-neutral-600">Rolle</label>
          <input
            value={p.role}
            onChange={(e) => update(p.name, { role: e.target.value })}
            placeholder="z. B. Bauleiter & Geschäftsführer"
            className="min-h-[44px] rounded-lg border border-neutral-300 px-3 text-sm"
          />

          <label className="text-xs font-semibold text-neutral-600">
            Fachgebiet <span className="font-normal text-neutral-400">(wofür die KI diese Person vorschlägt)</span>
          </label>
          <textarea
            value={p.expertise}
            onChange={(e) => update(p.name, { expertise: e.target.value })}
            rows={2}
            placeholder="z. B. Löhne, Rechnungen, Mahnwesen, Materialbestellung, Büro"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />

          <label className="text-xs font-semibold text-neutral-600">Stimme</label>
          <div className="flex gap-2">
            <select
              value={p.voice}
              onChange={(e) => update(p.name, { voice: e.target.value })}
              className="min-h-[44px] flex-1 rounded-lg border border-neutral-300 px-3 text-sm"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => preview(p.voice, p.name)}
              className="min-h-[44px] shrink-0 rounded-lg border border-neutral-300 px-3 text-sm font-medium active:bg-neutral-100"
            >
              {previewing === p.name ? "🔊…" : "🔊 Hörprobe"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => save(p)}
              className="btn-ink min-h-[44px] px-5 text-sm"
            >
              Speichern
            </button>
            {flashes[p.name] && (
              <span className={`text-sm ${flashes[p.name]?.err ? "text-red-600" : "text-emerald-700"}`}>
                {flashes[p.name]?.msg}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
