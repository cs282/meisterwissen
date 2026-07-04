import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/knowledge/[id]/technical-data
 * multipart/form-data: file (PDF) + source (Quellenangabe)
 * Lädt das technische Datenblatt in den Storage und legt eine technical_data-Zeile an.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const form = await req.formData();
    const file = form.get("file");
    const source = String(form.get("source") ?? "").trim();

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Keine PDF-Datei erhalten." }, { status: 400 });
    }
    if (!source) {
      return NextResponse.json({ error: "Quellenangabe fehlt." }, { status: 400 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: "Supabase-Zugangsdaten sind nicht konfiguriert (.env.local)." },
        { status: 500 },
      );
    }

    const supabase = createAdminClient();

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "datenblatt.pdf";
    const storagePath = `technical/${id}/${Date.now()}-${cleanName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from("recordings")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/pdf",
        upsert: false,
      });
    if (upErr) {
      throw new Error(`Upload fehlgeschlagen: ${upErr.message}`);
    }

    const { error: insErr } = await supabase.from("technical_data").insert({
      knowledge_unit_id: id,
      source,
      data: { filename: file.name, size_bytes: file.size },
      file_url: storagePath,
    });
    if (insErr) {
      throw new Error(`Datenblatt speichern fehlgeschlagen: ${insErr.message}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
