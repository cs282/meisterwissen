"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CategoryPicker from "@/components/CategoryPicker";
import VoiceRecorder from "@/components/VoiceRecorder";
import PersonPicker, { AUTO } from "@/components/PersonPicker";

// Whisper transkribiert nur Dateien bis 25 MB – wir prüfen konservativ bei 24 MB.
const MAX_MB = 24;

export default function AufnehmenPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [autoCat, setAutoCat] = useState(true); // Willi ordnet selbst zu
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [person, setPerson] = useState(AUTO);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Bitte eine Video- oder Audiodatei auswählen.");
      return;
    }
    if (!autoCat && !category) {
      setError("Bitte eine Rubrik wählen – oder „Willi ordnet automatisch zu“.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      const mb = (file.size / 1024 / 1024).toFixed(0);
      setError(
        `Diese Datei ist ${mb} MB groß – für die automatische Transkription sind max. ${MAX_MB} MB möglich. ` +
          `Tipp: Nimm die Erklärung als kurze Sprachnotiz/Audio auf (winzig und reicht völlig), ` +
          `oder filme kürzer bzw. in niedrigerer Auflösung (z. B. 720p). Fotos lädst du separat am Baustein hoch.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", autoCat ? "AUTO" : category);
      fd.append("title", title);
      fd.append("person", person || AUTO);

      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Verarbeitung fehlgeschlagen.");
      }
      router.push(`/aufnehmen/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-5">
      <header className="pt-2">
        <p className="eyebrow text-neutral-400">Wissen sichern</p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">Aufnehmen</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Baustellen-Aufnahme hochladen – Werkstatt-Willi macht daraus einen
          Wissensbaustein.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Aufnahme: direkt sprechen ODER Datei wählen */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold">Aufnahme</label>
          <VoiceRecorder onRecorded={(f) => setFile(f)} disabled={submitting} />
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className="h-px flex-1 bg-neutral-200" />
            oder Datei hochladen
            <span className="h-px flex-1 bg-neutral-200" />
          </div>
          <input
            id="file"
            type="file"
            accept="video/*,audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="rounded-lg border border-neutral-300 p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-white"
          />
          {file && (
            <p
              className={`text-xs ${
                file.size > MAX_MB * 1024 * 1024 ? "font-medium text-red-600" : "text-neutral-500"
              }`}
            >
              {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
              {file.size > MAX_MB * 1024 * 1024 ? ` — zu groß (max. ${MAX_MB} MB)` : ""}
            </p>
          )}
          <p className="text-xs text-neutral-500">
            💡 Für die Transkription reicht <b>Audio</b> (Sprachnotiz) – winzig und schnell. Videos
            bitte kurz halten (max. {MAX_MB} MB). Fotos lädst du direkt am Baustein hoch.
          </p>
        </div>

        {/* Rubrik: automatisch (Standard) oder selbst wählen */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Rubrik im Rahmenplan</label>

          {autoCat ? (
            <div className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                🤖 Willi ordnet automatisch zu
              </p>
              <p className="text-xs text-blue-800">
                Nach dem Transkribieren erkennt Willi anhand deiner Erklärung den passenden
                Punkt im Rahmenplan (Ausbildungsverordnung). Du kannst die Zuordnung später
                im Baustein jederzeit ändern.
              </p>
              <button
                type="button"
                onClick={() => setAutoCat(false)}
                className="mt-1 self-start text-sm font-medium text-blue-700 underline"
              >
                Lieber selbst wählen
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <CategoryPicker value={category} onChange={setCategory} id="category" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Rubriken nach der Ausbildungsverordnung – oder ganz unten „Freie Eingabe".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAutoCat(true);
                    setCategory("");
                  }}
                  className="shrink-0 text-sm font-medium text-blue-700 underline"
                >
                  🤖 Willi soll zuordnen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Titel */}
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-semibold">
            Titel
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. Nikotinwand isolieren im Treppenhaus"
            className="rounded-lg border border-neutral-300 p-3 text-sm"
            required
          />
        </div>

        {/* Wer nimmt auf? Person antippen oder Automatisch */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Wer nimmt auf?</label>
          <PersonPicker value={person} onChange={setPerson} disabled={submitting} />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-ink mt-1 min-h-[56px] px-4 text-base disabled:opacity-50"
        >
          {submitting ? "Wird verarbeitet & transkribiert…" : "Aufnahme hochladen"}
        </button>

        {submitting && (
          <p className="text-center text-xs text-neutral-500">
            Datei wird hochgeladen und per Whisper transkribiert – das kann bei
            längeren Aufnahmen etwas dauern. Bitte Seite nicht schließen.
          </p>
        )}
      </form>
    </main>
  );
}
