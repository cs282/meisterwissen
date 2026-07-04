import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { categoryLabel } from "@/lib/categories";
import PhotoSection from "@/components/PhotoSection";
import TechnicalSection from "@/components/TechnicalSection";
import RetryTranscription from "@/components/RetryTranscription";

export const dynamic = "force-dynamic";

function formatDuration(sec: number | null): string | null {
  if (sec == null) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")} min`;
}

export default async function TranskriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: ku } = await supabase
    .from("knowledge_units")
    .select("id, title, category, status")
    .eq("id", id)
    .single();

  if (!ku) notFound();

  const { data: recording } = await supabase
    .from("recordings")
    .select("type, transcript, duration_sec, recorded_by")
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

  const { data: technical } = await supabase
    .from("technical_data")
    .select("id, source, data, file_url")
    .eq("knowledge_unit_id", id);

  async function signed(path: string | null): Promise<string | null> {
    if (!path) return null;
    const { data } = await supabase.storage.from("recordings").createSignedUrl(path, 60 * 60);
    return data?.signedUrl ?? null;
  }

  const photoItems = (
    await Promise.all(
      (photos ?? []).map(async (p) => ({ id: p.id as string, url: await signed(p.file_url) })),
    )
  ).filter((p) => p.url);

  const technicalItems = await Promise.all(
    (technical ?? []).map(async (t) => {
      const filename =
        t.data && typeof t.data === "object" && "filename" in t.data
          ? String((t.data as { filename?: unknown }).filename ?? "Datenblatt.pdf")
          : "Datenblatt.pdf";
      return { id: t.id as string, source: t.source as string, filename, url: await signed(t.file_url) };
    }),
  );

  const duration = formatDuration(recording?.duration_sec ?? null);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-5">
      <header className="pt-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
            Status: {ku.status}
          </span>
          {recording?.type && (
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
              {recording.type === "video" ? "Video" : "Audio"}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold">{ku.title}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          <span className="text-neutral-400">Rubrik: </span>
          {ku.category
            ? categoryLabel(ku.category)
            : "noch keiner Rubrik zugeordnet"}
          <span className="text-neutral-400"> · im Baustein änderbar</span>
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          {recording?.recorded_by ? `Aufgenommen von ${recording.recorded_by}` : ""}
          {duration ? ` · ${duration}` : ""}
        </p>
        <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
          Hier gehört alles zu diesem Baustein zusammen: Transkript prüfen, mit Willi sprechen,
          Baustellenbilder und technische Merkblätter hinzufügen.
        </p>
      </header>

      {/* Transkript */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Transkript zur Sichtkontrolle</h2>
        {recording?.transcript ? (
          <div className="whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-800">
            {recording.transcript}
          </div>
        ) : recording ? (
          <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              🔒 <b>Deine Aufnahme ist sicher gespeichert</b> – aber die automatische
              Verschriftlichung hat noch nicht geklappt (z. B. Verbindung). Nichts ist verloren,
              du kannst es einfach erneut versuchen.
            </p>
            <RetryTranscription unitId={ku.id} />
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            Kein Transkript vorhanden.
          </div>
        )}
      </section>

      {/* Interview mit Willi */}
      <div className="flex flex-col gap-3">
        <Link
          href={`/gespraech/${ku.id}`}
          className="flex min-h-[56px] items-center justify-center rounded-xl bg-blue-700 px-4 text-center text-base font-semibold text-white active:bg-blue-800"
        >
          🎧 Interview mit Willi starten (sprechen)
        </Link>
        <Link
          href={`/interview/${ku.id}`}
          className="flex min-h-[48px] items-center justify-center rounded-xl border border-neutral-300 px-4 text-center text-base font-medium text-neutral-800 active:bg-neutral-100"
        >
          ⌨️ Lieber tippen
        </Link>
      </div>

      {/* Baustellenbilder */}
      <PhotoSection unitId={ku.id} items={photoItems} />

      {/* Technische Merkblätter */}
      <TechnicalSection unitId={ku.id} items={technicalItems} />

      <Link href="/aufnehmen" className="text-center text-sm text-neutral-600 underline">
        Weitere Aufnahme hinzufügen
      </Link>
    </main>
  );
}
