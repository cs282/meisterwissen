import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const PROMPT =
  "Fachbegriffe Malerhandwerk: Dispersion, Tiefgrund, Haftgrund, Aufbrennsperre, nass-in-nass, Florhöhe, Sinterhaut, Q3-Spachtelung, Abstreifgitter, Lunker, Gitterschnitt, Kreidetest";

/** Erkennt das Audioformat anhand der Datei-Signatur (Magic Bytes), nicht am Namen. */
function sniff(b: Buffer): { ext: string; mime: string } | null {
  if (b.length < 12) return null;
  const ascii = (from: number, to: number) => b.toString("ascii", from, to);
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WAVE") return { ext: "wav", mime: "audio/wav" };
  if (ascii(0, 4) === "OggS") return { ext: "ogg", mime: "audio/ogg" };
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { ext: "webm", mime: "audio/webm" };
  if (ascii(4, 8) === "ftyp") return { ext: "m4a", mime: "audio/mp4" };
  if (ascii(0, 3) === "ID3") return { ext: "mp3", mime: "audio/mpeg" };
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return { ext: "mp3", mime: "audio/mpeg" };
  return null;
}

/**
 * POST /api/stt  (multipart: audio)
 * Wandelt eine kurze Sprachantwort per Whisper in Text um. Erkennt das Format
 * am Inhalt und benennt die Datei korrekt – dadurch browser-unabhängig robust.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Keine Audioaufnahme erhalten." }, { status: 400 });
    }
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "OPENAI_API_KEY fehlt." }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length < 1200) {
      return NextResponse.json({ error: "Aufnahme war zu kurz." }, { status: 400 });
    }

    // Format am Inhalt erkennen; Fallback auf das, was der Browser mitschickt.
    const detected = sniff(buffer);
    const nameExt = (file.name.split(".").pop() || "").toLowerCase();
    const ext = detected?.ext || (nameExt || "webm");
    const mime = detected?.mime || file.type || "application/octet-stream";

    const fd = new FormData();
    fd.append("file", new File([new Uint8Array(buffer)], `antwort.${ext}`, { type: mime }));
    fd.append("model", "whisper-1");
    fd.append("language", "de");
    fd.append("prompt", PROMPT);

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `Whisper: ${t.slice(0, 200)}` }, { status: 500 });
    }
    const j = (await res.json()) as { text?: string };
    return NextResponse.json({ text: j.text ?? "" });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Fehler" },
      { status: 500 },
    );
  }
}
