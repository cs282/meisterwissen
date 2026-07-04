import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupKeyOf } from "@/lib/categories";
import { normalizePerson, personKey, personSlug } from "@/lib/people";
import { loadTeam, resolveMember } from "@/lib/team";

export const dynamic = "force-dynamic";

type Row = { created_by: string | null; category: string | null };
type Person = { name: string; total: number; handwerk: number; buero: number };

export default async function TeamPage() {
  const supabase = createAdminClient();
  const team = await loadTeam();
  const { data } = await supabase
    .from("knowledge_units")
    .select("created_by, category")
    .in("status", ["published", "reviewed", "interviewed"]);

  // Personen aus dem "Aufgenommen von"-Feld ableiten und Wissen zählen.
  const map = new Map<string, Person>();
  for (const r of (data ?? []) as Row[]) {
    const name = normalizePerson(r.created_by);
    if (!name) continue;
    const key = personKey(name);
    const e = map.get(key) ?? { name, total: 0, handwerk: 0, buero: 0 };
    e.total++;
    if (groupKeyOf(r.category) === "BUERO") e.buero++;
    else e.handwerk++;
    map.set(key, e);
  }
  const people = [...map.values()].sort((a, b) => b.total - a.total);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-5">
      <header className="pt-2">
        <Link href="/" className="text-sm text-neutral-500 underline">
          ← Start
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Team &amp; Avatare</h1>
        <p className="mt-1 text-base text-neutral-600">
          Jede Person, die Wissen beigesteuert hat, wird zum eigenen Avatar –
          du kannst sie direkt fragen, in ihrem Stil und mit ihrer Stimme.
        </p>
        <Link
          href="/team/einstellungen"
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800 active:bg-neutral-100"
        >
          ⚙️ Personen &amp; Stimmen einrichten
        </Link>
      </header>

      {people.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-base text-neutral-600">
          Noch keine Personen erfasst.
          <br />
          <Link href="/aufnehmen" className="mt-3 inline-block font-medium text-blue-700 underline">
            Erstes Wissen aufnehmen
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {people.map((p) => (
          <Link
            key={p.name}
            href={`/team/${personSlug(p.name)}`}
            className="flex min-h-[72px] items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 active:bg-neutral-100"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-2xl">
              {resolveMember(p.name, team).emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-neutral-900">{p.name}</p>
              <p className="mt-0.5 text-sm text-neutral-500">
                {p.total} Baustein{p.total === 1 ? "" : "e"}
                {p.handwerk > 0 && ` · 🎨 ${p.handwerk} Handwerk`}
                {p.buero > 0 && ` · 🏢 ${p.buero} Büro`}
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-blue-700">fragen →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
