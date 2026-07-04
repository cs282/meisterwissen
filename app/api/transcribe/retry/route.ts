import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifyCategory, classifyPerson } from "@/lib/classify";
import { loadTeam } from "@/lib/team";
import { runTranscription } from "@/lib/transcribe";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST /api/transcribe/retry  { id: knowledge_unit_id }
 * Transkribiert eine bereits gespeicherte Aufnahme erneut (z. B. nachdem Whisper
 * beim ersten Mal gescheitert ist). Ordnet Rubrik/Person nach, falls noch leer.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    if (!id) return NextResponse.json({ error: "Baustein-ID fehlt." }, { status: 400 });

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return NextResponse.json({ error: "OPENAI_API_KEY fehlt." }, { status: 500 });
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase-Zugangsdaten fehlen." }, { status: 500 });
    }

    const supabase = createAdminClient();

    const { data: ku } = await supabase
      .from("knowledge_units")
      .select("id, title, category, created_by")
      .eq("id", id)
      .single();
    if (!ku) return NextResponse.json({ error: "Baustein nicht gefunden." }, { status: 404 });

    // Aufnahme ohne Transkript suchen (die zu rettende).
    const { data: recs } = await supabase
      .from("recordings")
      .select("id, file_url, transcript")
      .eq("knowledge_unit_id", id)
      .neq("type", "photo")
      .order("recorded_at", { ascending: false });

    const rec = (recs ?? []).find((r) => !r.transcript || !String(r.transcript).trim());
    if (!rec) {
      return NextResponse.json({ error: "Es gibt keine Aufnahme ohne Transkript." }, { status: 400 });
    }
    if (!rec.file_url) {
      return NextResponse.json({ error: "Zu dieser Aufnahme ist keine Datei gespeichert." }, { status: 400 });
    }

    // Datei aus dem Storage holen.
    const { data: blob, error: dlErr } = await supabase.storage.from("recordings").download(rec.file_url as string);
    if (dlErr || !blob) {
      return NextResponse.json({ error: `Datei konnte nicht geladen werden: ${dlErr?.message ?? "unbekannt"}` }, { status: 500 });
    }
    const buffer = Buffer.from(await blob.arrayBuffer());
    const ext = ((rec.file_url as string).split(".").pop() || "bin").toLowerCase();

    // Erneut transkribieren.
    let text = "";
    let duration: number | undefined;
    try {
      const r = await runTranscription(buffer, ext, "", openaiKey);
      text = r.text;
      duration = r.duration;
    } catch (e) {
      return NextResponse.json(
        { error: `Transkription erneut fehlgeschlagen: ${e instanceof Error ? e.message : "unbekannt"}` },
        { status: 502 },
      );
    }
    if (!text.trim()) {
      return NextResponse.json({ error: "Es wurde kein Text erkannt – bitte neu aufnehmen." }, { status: 422 });
    }

    await supabase
      .from("recordings")
      .update({ transcript: text, duration_sec: duration != null ? Math.round(duration) : null })
      .eq("id", rec.id);

    // Rubrik/Person nachziehen, falls noch leer.
    if (!ku.category) {
      const code = await classifyCategory(text, ku.title as string);
      if (code) await supabase.from("knowledge_units").update({ category: code }).eq("id", id);
    }
    if (!ku.created_by) {
      const team = await loadTeam();
      const suggested = await classifyPerson(text, ku.title as string, team);
      if (suggested) {
        await supabase.from("knowledge_units").update({ created_by: suggested }).eq("id", id);
        await supabase.from("recordings").update({ recorded_by: suggested }).eq("id", rec.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 500 });
  }
}
