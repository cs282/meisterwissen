"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Wie bekomme ich eine messerscharfe Kante?",
  "Was muss ich bei einer Nikotinwand beachten?",
  "Welche Farbe für eine abgesetzte Wandfläche?",
];

/**
 * Fragebot. Ohne Props = allgemeine Wissensbank (Willi).
 * Mit person = Avatar-Modus: antwortet nur aus dem Wissen dieser Person,
 * in ihrem Stil, und liest die Antwort in ihrer eigenen Stimme vor.
 */
export default function WissensChat({
  person,
  personEmoji,
  voice,
}: {
  person?: string;
  personEmoji?: string;
  voice?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Beim Verlassen der Seite laufende Sprachausgabe stoppen.
  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setError(null);
    const history: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(history);
    setInput("");
    setBusy(true);
    setStreaming("");
    try {
      const res = await fetch("/api/frage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, messages, person }),
      });
      if (!res.ok || !res.body) {
        let msg = "Der Bot antwortet gerade nicht.";
        try {
          const d = await res.json();
          if (d?.error) msg = d.error;
        } catch {}
        throw new Error(msg);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setStreaming(acc);
      }
      setMessages([...history, { role: "assistant", content: acc }]);
      setStreaming("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler.");
    } finally {
      setBusy(false);
    }
  }

  async function speak(idx: number, text: string) {
    // Läuft gerade dieselbe Nachricht → stoppen.
    if (speaking === idx) {
      audioRef.current?.pause();
      setSpeaking(null);
      return;
    }
    audioRef.current?.pause();
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      audio.onended = () => setSpeaking(null);
      audio.onerror = () => setSpeaking(null);
      await audio.play();
      setSpeaking(idx);
    } catch {
      setSpeaking(null);
    }
  }

  const placeholder = person
    ? `Frag ${person} etwas…`
    : "Stell eine Frage zum Betriebswissen…";

  return (
    <div className="flex flex-col gap-3">
      {/* Verlauf */}
      {(messages.length > 0 || streaming) && (
        <div className="flex max-h-[46vh] flex-col gap-2.5 overflow-y-auto rounded-xl bg-neutral-50 p-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`${
                m.role === "user"
                  ? "ml-auto bg-neutral-900 text-white"
                  : "mr-auto bg-white text-neutral-900 ring-1 ring-neutral-200"
              } max-w-[88%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed`}
            >
              <span className="whitespace-pre-wrap">{m.content}</span>
              {m.role === "assistant" && m.content.trim() && (
                <button
                  onClick={() => speak(i, m.content)}
                  aria-label="Antwort vorlesen"
                  className="mt-1.5 flex items-center gap-1 text-xs font-medium text-blue-700 active:opacity-60"
                >
                  {speaking === i ? "⏹ Stopp" : `🔊 ${person ? personEmoji ?? "" : ""} anhören`}
                </button>
              )}
            </div>
          ))}
          {busy && streaming && (
            <div className="mr-auto max-w-[88%] whitespace-pre-wrap rounded-2xl bg-white px-3.5 py-2 text-sm leading-relaxed text-neutral-900 ring-1 ring-neutral-200">
              {streaming}
            </div>
          )}
          {busy && !streaming && (
            <div className="mr-auto rounded-2xl bg-white px-3.5 py-2 text-sm text-neutral-500 ring-1 ring-neutral-200">
              {person ? `${person} überlegt…` : "sucht in der Wissensbank…"}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Vorschläge (nur am Anfang, nur allgemeiner Bot) */}
      {messages.length === 0 && !busy && !person && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="min-h-[44px] rounded-full border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800 active:bg-neutral-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* Eingabe */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder={placeholder}
          aria-label="Frage an die Wissensbank"
          className="min-h-[48px] flex-1 rounded-full border border-neutral-300 px-5 text-base outline-none focus:border-neutral-900 disabled:bg-neutral-100"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="btn-ink min-h-[48px] px-6 text-base disabled:opacity-30"
        >
          Fragen
        </button>
      </form>
    </div>
  );
}
