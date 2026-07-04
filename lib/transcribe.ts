// Gemeinsame Transkriptions-Logik (Whisper), genutzt von /api/transcribe
// (Erstaufnahme) UND /api/transcribe/retry (erneuter Versuch).

import { spawn } from "node:child_process";

export const WHISPER_PROMPT =
  "Fachbegriffe Malerhandwerk: Dispersion, Tiefgrund, Haftgrund, Aufbrennsperre, nass-in-nass, Florhöhe, Sinterhaut, Q3-Spachtelung, Abstreifgitter, Lunker, Gitterschnitt, Kreidetest";

// Container-Formate, die die Whisper-API direkt akzeptiert. Andere Video-Container
// werden per ffmpeg zu MP3 umgewandelt.
export const WHISPER_SUPPORTED = [
  "flac", "m4a", "mp3", "mp4", "mpeg", "mpga", "oga", "ogg", "wav", "webm",
];

export function sanitizeName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  return `${Date.now()}-${clean || "aufnahme"}`;
}

export type TranscriptionResult = { text: string; duration?: number };

/**
 * Extrahiert (falls nötig) die Audiospur und transkribiert per Whisper (de).
 * Wirft bei Fehlern – der Aufrufer entscheidet, wie er damit umgeht.
 */
export async function runTranscription(
  buffer: Buffer,
  ext: string,
  mime: string,
  apiKey: string,
): Promise<TranscriptionResult> {
  const audio = await extractAudioIfNeeded(buffer, ext, mime);
  return transcribe(audio.buffer, audio.filename, audio.contentType, apiKey);
}

type AudioPayload = { buffer: Buffer; filename: string; contentType: string };

async function extractAudioIfNeeded(buffer: Buffer, ext: string, mime: string): Promise<AudioPayload> {
  if (WHISPER_SUPPORTED.includes(ext)) {
    return { buffer, filename: `aufnahme.${ext}`, contentType: mime || "application/octet-stream" };
  }
  const mp3 = await ffmpegToMp3(buffer);
  return { buffer: mp3, filename: "aufnahme.mp3", contentType: "audio/mpeg" };
}

/** Extrahiert die Audiospur aus beliebigem Video-Input als MP3 (benötigt ffmpeg). */
function ffmpegToMp3(input: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const args = ["-i", "pipe:0", "-vn", "-f", "mp3", "-ar", "16000", "-ac", "1", "pipe:1"];
    let proc;
    try {
      proc = spawn("ffmpeg", args);
    } catch {
      return reject(new Error("ffmpeg nicht gefunden – bitte Audio oder MP4/WebM hochladen."));
    }
    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];
    proc.on("error", () =>
      reject(new Error("ffmpeg nicht gefunden – bitte Audio oder MP4/WebM hochladen.")),
    );
    proc.stdout.on("data", (d: Buffer) => chunks.push(d));
    proc.stderr.on("data", (d: Buffer) => errChunks.push(d));
    proc.on("close", (code) => {
      if (code === 0 && chunks.length > 0) resolve(Buffer.concat(chunks));
      else reject(new Error(`Audio-Extraktion fehlgeschlagen: ${Buffer.concat(errChunks).toString().slice(-300)}`));
    });
    proc.stdin.write(input);
    proc.stdin.end();
  });
}

async function transcribe(
  buffer: Buffer,
  filename: string,
  contentType: string,
  apiKey: string,
): Promise<TranscriptionResult> {
  const fd = new FormData();
  fd.append("file", new File([new Uint8Array(buffer)], filename, { type: contentType }));
  fd.append("model", "whisper-1");
  fd.append("language", "de");
  fd.append("prompt", WHISPER_PROMPT);
  fd.append("response_format", "verbose_json");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Whisper-API (${res.status}): ${detail.slice(0, 300)}`);
  }
  const json = (await res.json()) as { text?: string; duration?: number };
  return { text: json.text ?? "", duration: json.duration };
}
