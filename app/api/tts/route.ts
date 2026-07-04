import { NextRequest, NextResponse } from "next/server";
import { ALL_TTS_VOICES } from "@/lib/people";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/tts  { text, voice? }
 * Erzeugt aus einem Text eine Sprachausgabe (MP3) via OpenAI TTS.
 * Ohne voice = Willi (onyx). Personen-Avatare geben ihre eigene Stimme mit.
 */
export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json();
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Kein Text." }, { status: 400 });
    }
    // Nur erlaubte Stimmen zulassen, sonst Willi (onyx).
    const chosen =
      typeof voice === "string" && (ALL_TTS_VOICES as readonly string[]).includes(voice)
        ? voice
        : "onyx";

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "OPENAI_API_KEY fehlt." }, { status: 500 });
    }

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "tts-1",
        voice: chosen,
        input: text.slice(0, 4000),
        response_format: "mp3",
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `TTS: ${t.slice(0, 200)}` }, { status: 500 });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Fehler" },
      { status: 500 },
    );
  }
}
