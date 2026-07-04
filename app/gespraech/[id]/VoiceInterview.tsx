"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { hasBaustein } from "@/lib/baustein";
import { encodeWav } from "@/lib/wav";

type ChatMessage = { role: "user" | "assistant"; content: string };

// json-Codeblock nicht vorlesen – nur den gesprochenen Teil.
function speakable(text: string): string {
  return text
    .replace(/```json[\s\S]*?```/g, " Ich hab dir unten den fertigen Baustein zusammengestellt. ")
    .replace(/```[\s\S]*?```/g, " ")
    .trim();
}

export default function VoiceInterview({
  id,
  title,
  categoryText,
}: {
  id: string;
  title: string;
  categoryText: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "willi" | "speaking" | "listening" | "thinking">("idle");
  const [error, setError] = useState<string | null>(null);
  const [savedInfo, setSavedInfo] = useState<string | null>(null);

  const lastSavedRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const skipResolveRef = useRef<(() => void) | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const srcRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcmRef = useRef<Float32Array[]>([]);
  const rateRef = useRef<number>(16000);

  // Willi vorlesen lassen
  async function speak(text: string) {
    const t = speakable(text);
    if (!t) return;
    try {
      setPhase("speaking");
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      if (!res.ok) throw new Error("Sprachausgabe fehlgeschlagen.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      await new Promise<void>((resolve) => {
        skipResolveRef.current = resolve;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
      skipResolveRef.current = null;
    } catch {
      /* Sprachausgabe optional – Text steht ja da */
    } finally {
      setPhase("idle");
    }
  }

  // Willi um Antwort bitten (Text-Stream), dann vorlesen
  async function askWilli(history: ChatMessage[]) {
    setError(null);
    setPhase("thinking");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, messages: history }),
      });
      if (!res.ok || !res.body) {
        let msg = "Willi antwortet gerade nicht.";
        try {
          const d = await res.json();
          if (d?.error) msg = d.error;
        } catch {}
        throw new Error(msg);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      setPhase("willi");
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: acc }]);
      }
      const finalMsgs: ChatMessage[] = [...history, { role: "assistant", content: acc }];
      setMessages(finalMsgs);
      autoSaveIfReady(finalMsgs);
      await speak(acc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler.");
      setPhase("idle");
    }
  }

  async function start() {
    setStarted(true);
    await askWilli([]);
  }

  // Willis Sprachausgabe abbrechen (überspringen)
  function stopSpeaking() {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
    }
    const r = skipResolveRef.current;
    skipResolveRef.current = null;
    r?.();
  }

  // Mikro an/aus – Aufnahme via Web-Audio-API, erzeugt sauberes WAV (browser-unabhängig)
  async function toggleMic() {
    if (phase === "listening") {
      await stopAndSend();
      return;
    }
    if (phase === "speaking") {
      // Willi überspringen und direkt mit der Antwort-Aufnahme starten
      stopSpeaking();
      await startRecording();
      return;
    }
    if (phase !== "idle") return;
    await startRecording();
  }

  async function startRecording() {
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
      setPhase("listening");
    } catch {
      setError("Kein Mikrofon-Zugriff. Bitte im Browser erlauben (nur über localhost oder https möglich).");
    }
  }

  async function stopAndSend() {
    setPhase("thinking");
    try { procRef.current?.disconnect(); } catch {}
    try { srcRef.current?.disconnect(); } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop());
    const rate = rateRef.current;
    const chunks = pcmRef.current;
    if (ctxRef.current) {
      try { await ctxRef.current.close(); } catch {}
    }
    const total = chunks.reduce((a, c) => a + c.length, 0);
    if (total < rate * 0.4) {
      setError("Zu kurz – tippe aufs Mikro, sprich 1–2 Sätze, dann tippe erst wieder zum Beenden.");
      setPhase("idle");
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
      fd.append("audio", wav, "antwort.wav");
      const res = await fetch("/api/stt", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Konnte dich nicht verstehen.");
      const text = (data.text ?? "").trim();
      if (!text) {
        setError("Nichts verstanden – bitte nochmal sprechen.");
        setPhase("idle");
        return;
      }
      const history = [...messages, { role: "user" as const, content: text }];
      setMessages(history);
      await askWilli(history);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler.");
      setPhase("idle");
    }
  }

  // Sobald Willi einen fertigen Baustein ausgibt: automatisch in die Wissensbank speichern.
  async function autoSaveIfReady(msgs: ChatMessage[]) {
    const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant || !hasBaustein(lastAssistant.content)) return;
    if (lastAssistant.content === lastSavedRef.current) return; // schon gespeichert
    lastSavedRef.current = lastAssistant.content;
    try {
      const res = await fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, messages: msgs }),
      });
      const d = await res.json();
      if (res.ok) {
        setSavedInfo("✅ Baustein automatisch in der Wissensbank gespeichert.");
      } else {
        setSavedInfo(`⚠️ Konnte nicht automatisch speichern: ${d?.error ?? "unbekannt"}`);
      }
    } catch {
      setSavedInfo("⚠️ Konnte nicht automatisch speichern (Verbindung).");
    }
  }
  const micBusy = phase === "thinking" || phase === "willi";

  const statusText =
    phase === "listening" ? "🎙️ Ich höre dir zu … (nochmal tippen = fertig)"
    : phase === "thinking" ? "… einen Moment"
    : phase === "willi" ? "Willi antwortet …"
    : phase === "speaking" ? "🔊 Willi spricht – tippe aufs Mikro, um ihn zu überspringen und direkt zu antworten"
    : "Tippe aufs Mikro und sprich";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-4">
      <header className="border-b border-neutral-200 pb-3">
        <h1 className="text-lg font-bold">🎧 Gespräch mit Willi</h1>
        <p className="text-sm text-neutral-500">{title}</p>
        <p className="text-xs text-neutral-500">{categoryText}</p>
      </header>

      {/* Verlauf (zum Mitlesen) */}
      <div className="flex flex-1 flex-col gap-3 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${
              m.role === "user"
                ? "ml-auto bg-neutral-900 text-white"
                : "mr-auto bg-neutral-100 text-neutral-900"
            } max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed`}
          >
            {m.content}
          </div>
        ))}
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>

      {/* Automatisch gespeichert */}
      {savedInfo && (
        <div className="mb-3 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-800">{savedInfo}</p>
          <button
            onClick={() => router.push("/bibliothek")}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            📚 In der Bibliothek ansehen
          </button>
        </div>
      )}

      {/* Steuerung */}
      <div className="sticky bottom-0 flex flex-col items-center gap-3 bg-white py-4">
        <p className="text-center text-sm text-neutral-500">{started ? statusText : "Bereit?"}</p>

        {!started ? (
          <button
            onClick={start}
            className="rounded-xl bg-neutral-900 px-6 py-4 text-base font-semibold text-white"
          >
            🎙️ Gespräch mit Willi starten
          </button>
        ) : (
          <>
            <button
              onClick={toggleMic}
              disabled={micBusy}
              className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white transition ${
                phase === "listening"
                  ? "animate-pulse bg-red-600"
                  : phase === "speaking"
                    ? "bg-blue-700"
                    : "bg-neutral-900"
              } disabled:opacity-40`}
              aria-label="Sprechen"
            >
              🎤
            </button>
            {phase === "speaking" && (
              <button
                onClick={stopSpeaking}
                className="text-xs font-medium text-neutral-500 underline"
              >
                ⏭️ Willi zu Ende überspringen (ohne zu antworten)
              </button>
            )}
          </>
        )}
        <p className="text-center text-xs text-neutral-500">
          Kopfhörer empfohlen · alles wird auch als Text angezeigt
        </p>
      </div>
    </main>
  );
}
