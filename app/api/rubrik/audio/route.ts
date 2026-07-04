import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupKeyOf, groupLabelForKey, isGroupKey } from "@/lib/categories";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL = "claude-sonnet-4-6";

/**
 * POST /api/rubrik/audio  { kat: <Gruppen-Key> }
 * Willi fasst das gesammelte Wissen einer Rubrik in ein paar Sätzen zusammen
 * und liest es vor (MP3). Nutzt nur erfasstes Wissen – erfindet nichts.
 */
export async function POST(req: NextRequest) {
  try {
    const { kat } = await req.json();
    if (!isGroupKey(kat)) {
      return NextResponse.json({ error: "Unbekannte Rubrik." }, { status: 400 });
    }
    const key = String(kat).toUpperCase();
    const label = groupLabelForKey(key);

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return NextResponse.json({ error: "OPENAI_API_KEY fehlt." }, { status: 500 });
    if (!process.env.ANTHROPIC_API_KEY)
      return NextResponse.json({ error: "ANTHROPIC_API_KEY fehlt." }, { status: 500 });
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY)
      return NextResponse.json({ error: "Supabase-Zugangsdaten fehlen." }, { status: 500 });

    // Erfasstes Wissen dieser Rubrik laden (kein reiner Entwurf)
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("knowledge_units")
      .select("title, category, situation, steps, expert_tips, common_mistakes, diagnosis_hints, status")
      .in("status", ["published", "reviewed", "interviewed"]);

    const units = (data ?? []).filter((u) => groupKeyOf(u.category) === key);

    // Kompakter Kontext für Willi
    const arr = (v: unknown) => (Array.isArray(v) ? v : []);
    const context = units
      .map((u) => {
        const parts: string[] = [`• ${u.title ?? "Ohne Titel"}`];
        if (u.situation) parts.push(`  Situation: ${u.situation}`);
        const steps = arr(u.steps)
          .map((s) => (s as { anweisung?: string }).anweisung)
          .filter(Boolean);
        if (steps.length) parts.push(`  Schritte: ${steps.join("; ")}`);
        if (arr(u.expert_tips).length) parts.push(`  Tipps: ${arr(u.expert_tips).join("; ")}`);
        if (arr(u.common_mistakes).length) parts.push(`  Typische Fehler: ${arr(u.common_mistakes).join("; ")}`);
        return parts.join("\n");
      })
      .join("\n\n");

    const system = `Du bist "Werkstatt-Willi" der Malerwerkstätte Schmid. Erkläre einem Mitarbeiter in 4 bis 6 kurzen, flüssig sprechbaren Sätzen das gesammelte Wissen zur Rubrik "${label}". Locker, duzend, wie ein Kollege. Nutze AUSSCHLIESSLICH die unten aufgeführten Wissensbausteine – erfinde nichts dazu. Fasse die wichtigsten Punkte, Tricks und typischen Fehler zusammen. Wenn unten keine Bausteine stehen, sag in ein, zwei Sätzen, dass zu dieser Rubrik noch kein Wissen erfasst ist und man es am besten als neuen Baustein aufnimmt. Keine Aufzählungszeichen, keine Überschriften – reiner gesprochener Fließtext.`;

    const userContent = units.length
      ? `Wissensbausteine der Rubrik "${label}":\n\n${context}`
      : `Zur Rubrik "${label}" sind noch keine Wissensbausteine erfasst.`;

    // 1) Willi-Text erzeugen
    const anthropic = new Anthropic();
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: userContent }],
    });
    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join(" ")
      .trim();

    if (!text) return NextResponse.json({ error: "Konnte keinen Text erzeugen." }, { status: 500 });

    // 2) Vorlesen (TTS)
    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "tts-1", voice: "onyx", input: text.slice(0, 4000), response_format: "mp3" }),
    });
    if (!ttsRes.ok) {
      const t = await ttsRes.text();
      return NextResponse.json({ error: `TTS: ${t.slice(0, 200)}` }, { status: 500 });
    }
    const buf = Buffer.from(await ttsRes.arrayBuffer());
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 500 });
  }
}
