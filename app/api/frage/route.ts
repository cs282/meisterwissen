import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { categoryLabel } from "@/lib/categories";
import { normalizePerson, personKey } from "@/lib/people";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL = "claude-sonnet-4-6";

const SYSTEM = `Du bist der Wissensassistent der Malerwerkstätte Schmid. Mitarbeiter stellen dir Fragen zum Innenanstrich. Du beantwortest sie AUSSCHLIESSLICH auf Basis der internen Wissensbausteine, die dir unten mitgegeben werden. Regeln: Erfinde NIEMALS Fachwissen und rate nicht. Wenn die Antwort nicht in den Bausteinen steht, sag ehrlich: "Dazu haben wir noch kein gesichertes Wissen erfasst – frag am besten den Meister oder nehmt es als neuen Wissensbaustein auf." Antworte kurz, praxisnah und auf Deutsch, duze den Mitarbeiter. Nenne am Ende in Klammern den Titel des Bausteins, aus dem deine Antwort stammt (z. B. "(Quelle: Scharfe Kante bei abgesetzter Wandfläche)").`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function formatUnit(u: Record<string, unknown>): string {
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  const lines: string[] = [];
  lines.push(`### ${u.title ?? "Ohne Titel"} [${categoryLabel(u.category as string)}]`);
  if (u.situation) lines.push(`Situation: ${u.situation}`);
  const steps = arr(u.steps);
  if (steps.length) {
    lines.push("Arbeitsschritte:");
    steps.forEach((s) => {
      const st = s as { nr?: number; anweisung?: string; dauer_min?: number; warnung?: string };
      lines.push(
        `  ${st.nr ?? "-"}. ${st.anweisung ?? ""}${st.dauer_min != null ? ` (${st.dauer_min} min)` : ""}${st.warnung ? ` ⚠ ${st.warnung}` : ""}`,
      );
    });
  }
  const mats = arr(u.materials);
  if (mats.length) {
    lines.push("Material:");
    mats.forEach((m) => {
      const mt = m as { produkt?: string; hersteller?: string; verbrauch_pro_m2?: string; gebinde?: string };
      lines.push(`  - ${mt.produkt ?? ""} ${mt.hersteller ? `(${mt.hersteller})` : ""} ${mt.verbrauch_pro_m2 ? `· ${mt.verbrauch_pro_m2}` : ""}`);
    });
  }
  const tools = arr(u.tools);
  if (tools.length) {
    lines.push("Werkzeug: " + tools.map((t) => {
      const tt = t as { werkzeug?: string; spezifikation?: string };
      return `${tt.werkzeug ?? ""}${tt.spezifikation ? ` (${tt.spezifikation})` : ""}`;
    }).join(", "));
  }
  if (arr(u.expert_tips).length) lines.push("Experten-Tipps: " + arr(u.expert_tips).join(" | "));
  if (arr(u.common_mistakes).length) lines.push("Typische Fehler: " + arr(u.common_mistakes).join(" | "));
  if (arr(u.diagnosis_hints).length) lines.push("Diagnose-Hinweise: " + arr(u.diagnosis_hints).join(" | "));
  return lines.join("\n");
}

/**
 * POST /api/frage  { question, messages? }
 * Mitarbeiter-Fragebot: beantwortet Fragen NUR aus den erfassten Wissensbausteinen.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = String(body?.question ?? "").trim();
    const person = normalizePerson(body?.person); // optional: nur Wissen dieser Person
    const history: ChatMessage[] = (
      Array.isArray(body?.messages)
        ? body.messages.filter(
            (m: ChatMessage) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string",
          )
        : []
    ).slice(-12); // Verlauf begrenzen – hält Kontext & Kosten im Rahmen

    if (!question) {
      return NextResponse.json({ error: "Keine Frage." }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY fehlt." }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase-Zugangsdaten fehlen." }, { status: 500 });
    }

    // Erfasstes Wissen laden (alles, was durch Willi lief – kein reiner Entwurf)
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("knowledge_units")
      .select("title, category, created_by, situation, steps, materials, tools, expert_tips, common_mistakes, diagnosis_hints, status")
      .in("status", ["published", "reviewed", "interviewed"]);

    let units = data ?? [];

    // Avatar-Modus: nur das Wissen der gewählten Person berücksichtigen.
    if (person) {
      const wanted = personKey(person);
      units = units.filter((u) => personKey(u.created_by as string) === wanted);
    }

    const wissen = units.length
      ? units.map(formatUnit).join("\n\n")
      : "(Es sind noch keine Wissensbausteine erfasst.)";

    const personaRule = person
      ? `\n\nDu antwortest im Namen von ${person}. Sprich aus der Ich-Perspektive, wie ${person} es einem Kollegen erklären würde – locker und in ihrem/seinem Stil. Nutze AUSSCHLIESSLICH die Bausteine unten, die von ${person} stammen. Wenn ${person} dazu nichts erfasst hat, sag ehrlich: "Dazu hab ich noch nichts aufgenommen – frag mich das mal auf der Baustelle, dann halten wir's fest."`
      : "";

    const system = `${SYSTEM}${personaRule}\n\n=== INTERNE WISSENSBAUSTEINE ===\n${wissen}\n=== ENDE WISSENSBAUSTEINE ===`;

    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: question },
    ];

    const client = new Anthropic();
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
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
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 500 });
  }
}
