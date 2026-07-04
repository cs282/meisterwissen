import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidCategory } from "@/lib/categories";
import { classifyCategory, classifyPerson } from "@/lib/classify";
import { loadTeam } from "@/lib/team";
import { normalizePerson } from "@/lib/people";
import { runTranscription, sanitizeName } from "@/lib/transcribe";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST /api/transcribe  (multipart/form-data: file, category, title, person)
 *   1. legt eine knowledge_unit (draft) an
 *   2. lädt die Datei in den Storage-Bucket "recordings"
 *   3. speichert SOFORT ein recording (Audio ist damit gesichert)
 *   4. transkribiert per Whisper – schlägt das fehl, bleibt die Aufnahme erhalten
 *      und kann später über /api/transcribe/retry erneut transkribiert werden
 *   5. ordnet Rubrik & Person automatisch zu (falls "AUTO")
 * Antwort: { id, transcribed }.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const rawCategory = String(form.get("category") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const rawPerson = String(form.get("person") ?? form.get("recorded_by") ?? "").trim();

    const autoAssign = rawCategory === "" || rawCategory.toUpperCase() === "AUTO";
    const autoPerson = rawPerson === "" || rawPerson.toUpperCase() === "AUTO";
    const person = autoPerson ? "" : normalizePerson(rawPerson);

    // --- Validierung ------------------------------------------------------
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Keine Datei erhalten." }, { status: 400 });
    }
    if (!autoAssign && !isValidCategory(rawCategory)) {
      return NextResponse.json({ error: "Bitte eine Rubrik wählen." }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "Titel fehlt." }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY ist nicht konfiguriert (.env.local)." }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase-Zugangsdaten sind nicht konfiguriert (.env.local)." }, { status: 500 });
    }

    const supabase = createAdminClient();

    // --- 1) knowledge_unit (draft) ---------------------------------------
    const { data: ku, error: kuErr } = await supabase
      .from("knowledge_units")
      .insert({
        category: autoAssign ? "" : rawCategory,
        title,
        status: "draft",
        created_by: autoPerson ? "" : person,
      })
      .select("id")
      .single();
    if (kuErr || !ku) {
      throw new Error(`knowledge_unit anlegen fehlgeschlagen: ${kuErr?.message ?? "unbekannt"}`);
    }

    // --- 2) Datei in Storage ---------------------------------------------
    const isVideo = file.type.startsWith("video/");
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const storagePath = `${ku.id}/${sanitizeName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from("recordings")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) {
      throw new Error(`Upload in Storage fehlgeschlagen: ${upErr.message}`);
    }

    // --- 3) recording SOFORT speichern (Aufnahme ist damit gesichert) ----
    const { data: rec, error: recErr } = await supabase
      .from("recordings")
      .insert({
        knowledge_unit_id: ku.id,
        type: isVideo ? "video" : "audio",
        file_url: storagePath,
        transcript: null,
        duration_sec: null,
        recorded_by: autoPerson ? "" : person,
      })
      .select("id")
      .single();
    if (recErr || !rec) {
      throw new Error(`recording anlegen fehlgeschlagen: ${recErr?.message ?? "unbekannt"}`);
    }

    // --- 4) Transkribieren (abgesichert) ---------------------------------
    let transcribed = false;
    try {
      const { text, duration } = await runTranscription(buffer, ext, file.type, openaiKey);

      await supabase
        .from("recordings")
        .update({ transcript: text, duration_sec: duration != null ? Math.round(duration) : null })
        .eq("id", rec.id);
      transcribed = true;

      // 4a) Rubrik automatisch zuordnen
      if (autoAssign) {
        const code = await classifyCategory(text, title);
        if (code) await supabase.from("knowledge_units").update({ category: code }).eq("id", ku.id);
      }
      // 4b) Person vorschlagen (nach Fachgebiet)
      if (autoPerson) {
        const team = await loadTeam();
        const suggested = await classifyPerson(text, title, team);
        if (suggested) {
          await supabase.from("knowledge_units").update({ created_by: suggested }).eq("id", ku.id);
          await supabase.from("recordings").update({ recorded_by: suggested }).eq("id", rec.id);
        }
      }
    } catch {
      // Transkription fehlgeschlagen – Aufnahme bleibt erhalten, Retry möglich.
      transcribed = false;
    }

    return NextResponse.json({ id: ku.id, transcribed });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
