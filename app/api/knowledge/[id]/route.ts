import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidCategory } from "@/lib/categories";

export const runtime = "nodejs";

/**
 * POST /api/knowledge/[id]
 * Body: { action: "save" | "publish", fields: {...}, reviewerName?: string }
 * - "save":    speichert die (im Meister-Review) bearbeiteten Felder, Status -> reviewed
 * - "publish": speichert + setzt reviewed_by und Status -> published (Meister-Freigabe)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const action = body?.action === "publish" ? "publish" : "save";
    const fields = body?.fields ?? {};
    const reviewerName = String(body?.reviewerName ?? "").trim();

    if (action === "publish" && !reviewerName) {
      return NextResponse.json(
        { error: "Bitte Name des Prüfers eintragen, um freizugeben." },
        { status: 400 },
      );
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: "Supabase-Zugangsdaten sind nicht konfiguriert (.env.local)." },
        { status: 500 },
      );
    }

    const asStringArray = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim() !== "") : [];
    const asObjArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

    const update: Record<string, unknown> = {
      title: typeof fields.title === "string" ? fields.title : null,
      situation: typeof fields.situation === "string" ? fields.situation : null,
      steps: asObjArray(fields.steps),
      materials: asObjArray(fields.materials),
      tools: asObjArray(fields.tools),
      expert_tips: asStringArray(fields.expert_tips),
      common_mistakes: asStringArray(fields.common_mistakes),
      diagnosis_hints: asStringArray(fields.diagnosis_hints),
    };

    // Kategorie übernehmen (Standard-Rubrik oder Freie Eingabe)
    if (isValidCategory(fields.category)) {
      update.category = fields.category;
    }

    if (action === "publish") {
      update.reviewed_by = reviewerName;
      update.status = "published";
    } else {
      update.status = "reviewed";
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("knowledge_units").update(update).eq("id", id);
    if (error) {
      throw new Error(`Speichern fehlgeschlagen: ${error.message}`);
    }

    return NextResponse.json({ ok: true, status: update.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
