import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import BausteinDetail from "./BausteinDetail";

export const dynamic = "force-dynamic";

export default async function BausteinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: ku } = await supabase
    .from("knowledge_units")
    .select(
      "id, title, category, status, situation, steps, materials, tools, expert_tips, common_mistakes, diagnosis_hints, reviewed_by, created_by",
    )
    .eq("id", id)
    .single();

  if (!ku) notFound();

  // Aufnahme (für Player) + offene Lücken aus dem Interview
  const { data: recording } = await supabase
    .from("recordings")
    .select("type, file_url")
    .eq("knowledge_unit_id", id)
    .neq("type", "photo")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: photos } = await supabase
    .from("recordings")
    .select("id, file_url")
    .eq("knowledge_unit_id", id)
    .eq("type", "photo")
    .order("recorded_at", { ascending: false });

  const { data: interview } = await supabase
    .from("interviews")
    .select("open_gaps")
    .eq("knowledge_unit_id", id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: technical } = await supabase
    .from("technical_data")
    .select("id, source, data, file_url")
    .eq("knowledge_unit_id", id);

  // Signierte URLs für privaten Storage erzeugen
  let recordingUrl: string | null = null;
  if (recording?.file_url) {
    const { data: signed } = await supabase.storage
      .from("recordings")
      .createSignedUrl(recording.file_url, 60 * 60);
    recordingUrl = signed?.signedUrl ?? null;
  }

  const technicalItems = await Promise.all(
    (technical ?? []).map(async (t) => {
      let url: string | null = null;
      if (t.file_url) {
        const { data: signed } = await supabase.storage
          .from("recordings")
          .createSignedUrl(t.file_url, 60 * 60);
        url = signed?.signedUrl ?? null;
      }
      const filename =
        t.data && typeof t.data === "object" && "filename" in t.data
          ? String((t.data as { filename?: unknown }).filename ?? "Datenblatt.pdf")
          : "Datenblatt.pdf";
      return { id: t.id, source: t.source as string, filename, url };
    }),
  );

  const photoItems = await Promise.all(
    (photos ?? []).map(async (p) => {
      let url: string | null = null;
      if (p.file_url) {
        const { data: signed } = await supabase.storage
          .from("recordings")
          .createSignedUrl(p.file_url, 60 * 60);
        url = signed?.signedUrl ?? null;
      }
      return { id: p.id as string, url };
    }),
  );

  return (
    <BausteinDetail
      unit={ku}
      openGaps={(interview?.open_gaps as string[]) ?? []}
      recordingType={(recording?.type as string) ?? null}
      recordingUrl={recordingUrl}
      technical={technicalItems}
      photos={photoItems.filter((p) => p.url)}
    />
  );
}
