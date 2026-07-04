import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/knowledge/[id]/photo  (multipart: file = Bild)
 * Lädt ein Baustellenbild in den Storage und legt es als recording (type=photo) an.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const form = await req.formData();
    const file = form.get("file");
    const recordedBy = String(form.get("recorded_by") ?? "").trim() || null;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Kein Bild erhalten." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Bitte eine Bilddatei wählen." }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Bild ist zu groß (max. 15 MB). Tipp: normales Handy-Foto reicht völlig." },
        { status: 400 },
      );
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase-Zugangsdaten fehlen." }, { status: 500 });
    }

    const supabase = createAdminClient();
    const clean = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "bild.jpg";
    const path = `photos/${id}/${Date.now()}-${clean}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from("recordings")
      .upload(path, buffer, { contentType: file.type || "image/jpeg", upsert: false });
    if (upErr) throw new Error(`Upload fehlgeschlagen: ${upErr.message}`);

    const { error: insErr } = await supabase.from("recordings").insert({
      knowledge_unit_id: id,
      type: "photo",
      file_url: path,
      recorded_by: recordedBy,
    });
    if (insErr) throw new Error(`Bild speichern fehlgeschlagen: ${insErr.message}`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Fehler" },
      { status: 500 },
    );
  }
}
