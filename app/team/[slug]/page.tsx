import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { categoryLabel, groupKeyOf } from "@/lib/categories";
import { personKey } from "@/lib/people";
import { loadTeam, resolveMember } from "@/lib/team";
import WissensChat from "@/components/WissensChat";

export const dynamic = "force-dynamic";

type Row = { id: string; title: string | null; category: string | null; created_by: string | null };

export default async function AvatarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wanted = personKey(decodeURIComponent(slug));

  const supabase = createAdminClient();
  const team = await loadTeam();
  const { data } = await supabase
    .from("knowledge_units")
    .select("id, title, category, created_by")
    .in("status", ["published", "reviewed", "interviewed"]);

  const mine = ((data ?? []) as Row[]).filter(
    (u) => personKey(u.created_by) === wanted,
  );
  if (mine.length === 0) notFound();

  // Anzeigenamen aus dem ersten Treffer + Einstellungen (Stimme/Emoji/Rolle).
  const resolved = resolveMember(mine[0].created_by ?? "", team);
  const name = resolved.name;
  const emoji = resolved.emoji;
  const voice = resolved.voice;
  const buero = mine.filter((u) => groupKeyOf(u.category) === "BUERO").length;
  const handwerk = mine.length - buero;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-5">
      <header className="pt-2">
        <Link href="/team" className="text-sm text-neutral-500 underline">
          ← Team &amp; Avatare
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-3xl">
            {emoji}
          </span>
          <div className="min-w-0">
            <h1 className="font-display truncate text-3xl font-semibold tracking-tight">{name}</h1>
            {resolved.role && <p className="truncate text-sm text-neutral-600">{resolved.role}</p>}
            <p className="text-sm text-neutral-500">
              {mine.length} Baustein{mine.length === 1 ? "" : "e"}
              {handwerk > 0 && ` · 🎨 ${handwerk} Handwerk`}
              {buero > 0 && ` · 🏢 ${buero} Büro`}
            </p>
          </div>
        </div>
      </header>

      {/* Mit der Person sprechen (Avatar) */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <h2 className="font-bold leading-tight">Frag {name}</h2>
            <p className="text-xs text-neutral-500">
              Antworten kommen nur aus dem, was {name} beigesteuert hat – im eigenen
              Stil und mit eigener Stimme. Nichts erfunden.
            </p>
          </div>
        </div>
        <WissensChat person={name} personEmoji={emoji} voice={voice} />
      </section>

      {/* Wissen dieser Person */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-500">
          Wissen von {name}
        </h3>
        <div className="flex flex-col gap-2">
          {mine.map((u) => (
            <Link
              key={u.id}
              href={`/bibliothek/${u.id}`}
              className="flex min-h-[56px] flex-col justify-center rounded-xl border border-neutral-200 bg-white p-3.5 active:bg-neutral-100"
            >
              <span className="truncate text-base font-semibold text-neutral-900">
                {u.title || "Ohne Titel"}
              </span>
              <span className="mt-0.5 truncate text-sm text-neutral-500">
                {categoryLabel(u.category)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
