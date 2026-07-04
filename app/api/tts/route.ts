import { NextRequest, NextResponse } from "next/server";
import { ALL_TTS_VOICES } from "@/lib/people";
import { synthesizeSpeech } from "@/lib/tts";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/tts  { text, voice? }
 * Erzeugt aus einem Text eine Sprachausgabe (MP3) via OpenAI TTS.
 * Ohne voice = Willi (onyx, energiegeladen & zügig).
 * Personen-Avatare geben ihre eigene Stimme mit (neutraler Stil).
 */
export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json();
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Kein Text." }, { status: 400 });
    }
    // Nur erlaubte Stimmen zulassen, sonst Willi (onyx).
    const isWilli = typeof voice !== "string" || !(ALL_TTS_VOICES as readonly string[]).includes(voice);
    const chosen = isWilli ? "onyx" : (voice as string);

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "OPENAI_API_KEY fehlt." }, { status: 500 });
    }

    const buf = await synthesizeSpeech(text, chosen, key, { energetic: isWilli });
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
