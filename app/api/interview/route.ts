import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { categoryLabel } from "@/lib/categories";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL = "claude-sonnet-4-6";

const WILLI_SYSTEM = `Du bist "Werkstatt-Willi", der Wissens-Interviewer der Malerwerkstätte Schmid – ein energiegeladener, herzlicher Handwerker-Kollege. Du duzt, sprichst zackiges, lebendiges Deutsch und bringst Schwung rein: Du freust dich hörbar über jeden Trick, den jemand teilt (kurzes, ehrliches Lob wie "Stark!", "Genau solche Tricks brauchen wir!"), und machst Lust, noch mehr Wissen beizusteuern. Nie langweilig, nie förmlich, nie wie ein Formular – aber immer auf den Punkt. Dein Input: das Transkript einer Baustellen-Aufnahme plus die Rubrik (Rahmenplan oder freies Thema, auch Büro-/Betriebsabläufe). Dein Ablauf: (1) Fasse das Transkript in EINEM knackigen Satz zusammen ("Okay, du hast gezeigt, wie du..."). (2) Identifiziere Lücken anhand des Pflichtschemas: Situation, Arbeitsschritte mit Reihenfolge und Zeiten, Material mit Verbrauch pro m², Werkzeug, Trocknungszeiten, Raumklima. (3) Stelle gezielte Rückfragen – immer nur EINE pro Nachricht. Priorisiere implizites Erfahrungswissen: "Woran erkennst du, ob...?", "Was machen Anfänger hier typischerweise falsch?", "Was ist dein persönlicher Trick?", "Wann funktioniert das NICHT?", "Wie lange dauert das realistisch pro m²?". (4) Nach spätestens 8–10 Fragen: Ausgabe des strukturierten Wissensbausteins als JSON in einem json-Codeblock mit exakt diesen Feldern: situation (string), steps (Array aus {nr, anweisung, dauer_min, warnung}), materials (Array aus {produkt, hersteller, verbrauch_pro_m2, gebinde}), tools (Array aus {werkzeug, spezifikation}), expert_tips (string[]), common_mistakes (string[]), diagnosis_hints (string[]), open_gaps (string[]). Regeln: Erfinde NIEMALS Fachwissen – alles kommt vom Interviewten. Bei unplausiblen Angaben nachfragen statt korrigieren. Bei "kommt drauf an" nachhaken: "worauf genau?". Halte das Interview unter 15 Minuten.

ABSCHLUSS (sehr wichtig): Wenn der Nutzer aufhören will (z. B. "stop", "fertig", "das reicht", "genug", "keine Zeit", "mach fertig", "Schluss") ODER du zu allen Pflichtfeldern genug weißt (gern auch früher als nach 8 Fragen), beende SOFORT: Schreibe GENAU EINEN kurzen, anerkennenden Abschluss-Satz (z. B. "Stark, sauber erklärt – ich pack das in die Wissensbank!") und gib direkt danach den JSON-Baustein aus. Dabei gilt: KEINE Zusammenfassung des Inhalts im Text, KEINE Aufzählung fehlender Punkte im Text (alles Fehlende/Unsichere gehört AUSSCHLIESSLICH ins Feld open_gaps), KEINE Frage mehr nach dem JSON – auch nicht "passt das so?". Das Gespräch ist damit beendet; dränge nie zum Weitermachen.

STIL: Fass dich sehr KURZ – maximal 1–2 Sätze pro Nachricht, keine langen Erklärungen oder Aufzählungen im Gespräch (die Details kommen erst ganz am Ende in den JSON-Baustein). Die Zusammenfassung am Anfang ist genau EIN Satz, jede Rückfrage ist ein einziger kurzer Satz mit Energie.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * POST /api/interview
 * Body: { id: string, messages: ChatMessage[] }
 * Startet/setzt das Interview mit Willi fort. Streamt die Antwort als Text.
 * Das Transkript wird serverseitig aus der DB geladen und als erster
 * (kontext-)Turn vorangestellt – der Client trackt nur den sichtbaren Dialog.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

    if (!id) {
      return NextResponse.json({ error: "knowledge_unit-ID fehlt." }, { status: 400 });
    }

    const messages: ChatMessage[] = rawMessages
      .filter(
        (m: unknown): m is ChatMessage =>
          !!m &&
          typeof m === "object" &&
          (((m as ChatMessage).role === "user") || ((m as ChatMessage).role === "assistant")) &&
          typeof (m as ChatMessage).content === "string",
      )
      .map((m: ChatMessage) => ({ role: m.role, content: m.content }));

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY ist nicht konfiguriert (.env.local)." },
        { status: 500 },
      );
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: "Supabase-Zugangsdaten sind nicht konfiguriert (.env.local)." },
        { status: 500 },
      );
    }

    // knowledge_unit + Transkript laden
    const supabase = createAdminClient();
    const { data: ku } = await supabase
      .from("knowledge_units")
      .select("id, title, category")
      .eq("id", id)
      .single();
    if (!ku) {
      return NextResponse.json({ error: "Wissensbaustein nicht gefunden." }, { status: 404 });
    }
    const { data: recording } = await supabase
      .from("recordings")
      .select("transcript")
      .eq("knowledge_unit_id", id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const transcript = recording?.transcript?.trim() || "(kein Transkript vorhanden)";

    const contextTurn: ChatMessage = {
      role: "user",
      content:
        `Hier ist das Transkript einer Baustellen-Aufnahme, das du zu einem Wissensbaustein machen sollst.\n\n` +
        `Kategorie: ${categoryLabel(ku.category)}\n` +
        `Titel der Aufnahme: ${ku.title ?? "—"}\n\n` +
        `Transkript:\n"""\n${transcript}\n"""\n\n` +
        `Leg los mit Schritt 1 (Zusammenfassung), dann Schritt 2 und 3 – und denk dran: immer nur EINE Frage pro Nachricht.`,
    };

    const fullMessages: Anthropic.MessageParam[] = [contextTurn, ...messages];

    const client = new Anthropic();
    const anthropicStream = client.messages.stream({
      model: MODEL,
      max_tokens: 8192,
      system: WILLI_SYSTEM,
      messages: fullMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
