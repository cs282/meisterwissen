"use client";

import { useEffect, useRef, useState } from "react";
import { getWilliSpeed } from "@/components/SpeedControl";
import { encodeWav } from "@/lib/wav";

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
  const [voiceState, setVoiceState] = useState<"idle" | "rec" | "stt">("idle");
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mikrofon-Aufnahme (Web Audio -> WAV, wie im Willi-Gespräch)
  const ctxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const srcRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcmRef = useRef<Float32Array[]>([]);
  const rateRef = useRef<number>(16000);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Beim Verlassen der Seite Sprachausgabe & Mikro stoppen.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      cleanupMic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanupMic() {
    try { procRef.current?.disconnect(); } catch {}
    try { srcRef.current?.disconnect(); } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }

  async function toggleMic() {
    if (voiceState === "rec") {
      await stopAndAsk();
      return;
    }
    if (voiceState !== "idle" || busy) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      rateRef.current = ctx.sampleRate;
      const src = ctx.createMediaStreamSource(stream);
      srcRef.current = src;
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      procRef.current = proc;
      pcmRef.current = [];
      proc.onaudioprocess = (e) => {
        pcmRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };
      src.connect(proc);
      proc.connect(ctx.destination);
      setError(null);
      setVoiceState("rec");
    } catch {
      setError("Kein Mikrofon-Zugriff. Bitte im Browser erlauben (nur über localhost oder https möglich).");
    }
  }

  async function stopAndAsk() {
    setVoiceState("stt");
    cleanupMic();
    const rate = rateRef.current;
    const chunks = pcmRef.current;
    const total = chunks.reduce((a, c) => a + c.length, 0);
    if (total < rate * 0.4) {
      setError("Zu kurz – Mikro antippen, Frage sprechen, dann nochmal antippen.");
      setVoiceState("idle");
      return;
    }
    const merged = new Float32Array(total);
    let off = 0;
    for (const c of chunks) {
      merged.set(c, off);
      off += c.length;
    }
    const wav = encodeWav(merged, rate);
    try {
      const fd = new FormData();
      fd.append("audio", wav, "frage.wav");
      const res = await fetch("/api/stt", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error ?? "Konnte dich nicht verstehen.");
      const text = (d.text ?? "").trim();
      setVoiceState("idle");
      if (!text) {
        setError("Nichts verstanden – bitte nochmal sprechen.");
        return;
      }
      ask(text); // gesprochene Frage direkt abschicken
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler.");
      setVoiceState("idle");
    }
  }

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
      if (!voice) audio.playbackRate = getWilliSpeed(); // Willi-Tempo (Avatare: normal)
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

      {/* Eingabe: sprechen ODER tippen */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2"
      >
        <button
          type="button"
          onClick={toggleMic}
          disabled={busy || voiceState === "stt"}
          aria-label={voiceState === "rec" ? "Aufnahme beenden und fragen" : "Frage einsprechen"}
          className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full text-xl transition ${
            voiceState === "rec"
              ? "animate-pulse bg-red-600 text-white"
              : "border border-neutral-300 bg-white active:bg-neutral-100"
          } disabled:opacity-40`}
        >
          🎤
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy || voiceState !== "idle"}
          placeholder={
            voiceState === "rec"
              ? "🎙️ Ich höre zu – Mikro nochmal antippen…"
              : voiceState === "stt"
                ? "Wird verstanden…"
                : placeholder
          }
          aria-label="Frage an die Wissensbank"
          className="min-h-[48px] min-w-0 flex-1 rounded-full border border-neutral-300 px-5 text-base outline-none focus:border-neutral-900 disabled:bg-neutral-100"
        />
        <button
          type="submit"
          disabled={busy || !input.trim() || voiceState !== "idle"}
          className="btn-ink min-h-[48px] px-5 text-base disabled:opacity-30"
        >
          Fragen
        </button>
      </form>
    </div>
  );
}
