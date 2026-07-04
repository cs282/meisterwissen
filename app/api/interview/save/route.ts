import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractBaustein } from "@/lib/baustein";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * POST /api/interview/save
 * Body: { id: string, messages: ChatMessage[] }
 * Extrahiert den JSON-Baustein aus der letzten Willi-Antwort, aktualisiert die
 * knowledge_unit (Status -> interviewed) und speichert den Chatverlauf +
 * offene Lücken in interviews.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];

    if (!id) {
      return NextResponse.json({ error: "knowledge_unit-ID fehlt." }, { status: 400 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: "Supabase-Zugangsdaten sind nicht konfiguriert (.env.local)." },
        { status: 500 },
      );
    }

    // Letzte Assistant-Nachricht mit gültigem JSON-Baustein finden
    let baustein = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "assistant") {
        const parsed = extractBaustein(messages[i].content);
        if (parsed) {
          baustein = parsed;
          break;
        }
      }
    }
    if (!baustein) {
      return NextResponse.json(
        { error: "Kein bestätigter JSON-Baustein im Verlauf gefunden." },
        { status: 400 },
      );
    }

    const asStringArray = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];

    const supabase = createAdminClient();

    // knowledge_unit aktualisieren -> Status interviewed
    const { error: kuErr } = await supabase
      .from("knowledge_units")
      .update({
        situation: typeof baustein.situation === "string" ? baustein.situation : null,
        steps: Array.isArray(baustein.steps) ? baustein.steps : [],
        materials: Array.isArray(baustein.materials) ? baustein.materials : [],
        tools: Array.isArray(baustein.tools) ? baustein.tools : [],
        expert_tips: asStringArray(baustein.expert_tips),
        common_mistakes: asStringArray(baustein.common_mistakes),
        diagnosis_hints: asStringArray(baustein.diagnosis_hints),
        status: "interviewed",
      })
      .eq("id", id);
    if (kuErr) {
      throw new Error(`knowledge_unit aktualisieren fehlgeschlagen: ${kuErr.message}`);
    }

    // Interview speichern
    const { error: ivErr } = await supabase.from("interviews").insert({
      knowledge_unit_id: id,
      transcript: messages,
      extracted_fields: baustein,
      open_gaps: asStringArray(baustein.open_gaps),
      completed_at: new Date().toISOString(),
    });
    if (ivErr) {
      throw new Error(`Interview speichern fehlgeschlagen: ${ivErr.message}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
