"use client";

import { useRef, useState } from "react";
import { encodeWav } from "@/lib/wav";

/**
 * Direkte Sprachaufnahme im Browser (Web-Audio → sauberes WAV).
 * Ruft onRecorded(file) mit einer fertigen WAV-Datei auf – kein Datei-Upload nötig.
 */
export default function VoiceRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (file: File) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const srcRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcmRef = useRef<Float32Array[]>([]);
  const rateRef = useRef<number>(16000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function start() {
    setError(null);
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
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Kein Mikrofon-Zugriff. Bitte im Browser erlauben (nur über localhost oder https).");
    }
  }

  async function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    try { procRef.current?.disconnect(); } catch {}
    try { srcRef.current?.disconnect(); } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop());
    const rate = rateRef.current;
    const chunks = pcmRef.current;
    if (ctxRef.current) {
      try { await ctxRef.current.close(); } catch {}
    }
    const total = chunks.reduce((a, c) => a + c.length, 0);
    if (total < rate * 0.5) {
      setError("Aufnahme war zu kurz – bitte etwas länger sprechen.");
      return;
    }
    const merged = new Float32Array(total);
    let off = 0;
    for (const c of chunks) {
      merged.set(c, off);
      off += c.length;
    }
    const wav = encodeWav(merged, rate);
    const file = new File([wav], `aufnahme-${Date.now()}.wav`, { type: "audio/wav" });
    onRecorded(file);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(1, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={recording ? stop : start}
        disabled={disabled}
        className={`flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold text-white disabled:opacity-40 ${
          recording ? "animate-pulse bg-red-600" : "bg-neutral-900"
        }`}
      >
        {recording ? `⏹ Aufnahme beenden (${mm}:${ss})` : "🎤 Direkt aufnehmen"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
