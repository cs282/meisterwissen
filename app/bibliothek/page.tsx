import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DISPLAY_GROUPS,
  groupKeyOf,
  groupLabelForKey,
  isGroupKey,
  categoryLabel,
} from "@/lib/categories";
import { statusMeta } from "@/lib/status";
import RubrikAudioButton from "@/components/RubrikAudioButton";

export const dynamic = "force-dynamic";

type Unit = {
  id: string;
  title: string | null;
  category: string | null;
  status: string;
};

export default async function BibliothekPage({
  searchParams,
}: {
  searchParams: Promise<{ kat?: string }>;
}) {
  const { kat } = await searchParams;
  const filter = isGroupKey(kat) ? kat!.toUpperCase() : null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("knowledge_units")
    .select("id, title, category, status")
    .order("created_at", { ascending: false });

  const all: Unit[] = data ?? [];
  const units = filter ? all.filter((u) => groupKeyOf(u.category) === filter) : all;

  const grouped: Record<string, Unit[]> = {};
  for (const u of units) {
    (grouped[groupKeyOf(u.category)] ??= []).push(u);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-5">
      <header className="pt-2">
        <p className="eyebrow text-neutral-400">Wissensbank</p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">Bibliothek</h1>
        <p className="mt-1 text-base text-neutral-600">
          {units.length} Wissensbaustein{units.length === 1 ? "" : "e"}
          {filter ? ` in „${groupLabelForKey(filter)}"` : ""}
        </p>
      </header>

      {/* Filter nach Ober-Rubrik (Verordnung) */}
      <nav aria-label="Nach Rubrik filtern" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        <FilterChip href="/bibliothek" label="Alle" active={!filter} />
        {DISPLAY_GROUPS.map((g) => (
          <FilterChip
            key={g.key}
            href={`/bibliothek?kat=${g.key}`}
            label={g.short}
            active={filter === g.key}
          />
        ))}
      </nav>

      {units.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-base text-neutral-600">
          {filter
            ? "In dieser Rubrik gibt es noch keinen Wissensbaustein."
            : "Noch keine Wissensbausteine vorhanden."}
          <br />
          <Link href="/aufnehmen" className="mt-3 inline-block font-medium text-blue-700 underline">
            Neues Wissen aufnehmen
          </Link>
        </div>
      )}

      {DISPLAY_GROUPS.map((g) => {
        const items = grouped[g.key];
        if (!items || items.length === 0) return null;
        return (
          <section key={g.key} className="flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="eyebrow pt-1 text-neutral-400">{g.label}</h2>
              <RubrikAudioButton kat={g.key} label={g.short} />
            </div>
            <div className="flex flex-col gap-2">
              {items.map((u) => {
                const s = statusMeta(u.status);
                return (
                  <Link
                    key={u.id}
                    href={`/bibliothek/${u.id}`}
                    className="flex min-h-[64px] items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 active:bg-neutral-100"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-base font-semibold text-neutral-900">
                        {u.title || "Ohne Titel"}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-neutral-500">
                        {categoryLabel(u.category)}
                      </p>
                    </div>
                    <span
                      className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.badge}`}
                    >
                      <span aria-hidden>{s.icon}</span> {s.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium ${
        active
          ? "bg-neutral-900 text-white"
          : "border border-neutral-300 bg-white text-neutral-700"
      }`}
    >
      {label}
    </Link>
  );
}
