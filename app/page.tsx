import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import WissensChat from "@/components/WissensChat";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const supabase = createAdminClient();
    const { count: total } = await supabase
      .from("knowledge_units")
      .select("id", { count: "exact", head: true });
    const { count: published } = await supabase
      .from("knowledge_units")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");
    return { total: total ?? 0, published: published ?? 0 };
  } catch {
    return { total: 0, published: 0 };
  }
}

export default async function Dashboard() {
  const { total, published } = await getStats();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-5">
      {/* Kopf */}
      <header className="surface-ink rounded-3xl p-7 shadow-2xl">
        {/* dezentes Leuchten in Markenblau */}
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#1e50e0]/20 blur-3xl" />
        <div className="relative">
          <p className="eyebrow text-gold">Digitales Wissensarchiv</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">Meisterwissen</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            Das Erfahrungswissen deines Betriebs – bewahrt, geprüft, jederzeit abrufbar.
          </p>

          {/* Gold-Haarlinie */}
          <div className="rule-gold mt-7" />

          {/* Zahlen als editorial-Statistik */}
          <div className="mt-6 flex items-stretch gap-6">
            <div>
              <div className="font-display text-3xl leading-none">{total}</div>
              <div className="eyebrow mt-2 text-white/40">Bausteine</div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="font-display text-3xl leading-none">{published}</div>
              <div className="eyebrow mt-2 text-white/40">Veröffentlicht</div>
            </div>
          </div>
        </div>
      </header>

      {/* Fragebot – Herzstück */}
      <section className="card p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="surface-ink flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ring-1 ring-[#c2a15c]/30">
            🤖
          </span>
          <div>
            <p className="eyebrow text-neutral-400">Sofort-Antwort</p>
            <h2 className="font-display text-lg font-semibold leading-tight">Frag die Wissensbank</h2>
          </div>
        </div>
        <WissensChat />
      </section>

      {/* Aktionen */}
      <section className="grid grid-cols-2 gap-3">
        <Tile href="/aufnehmen" emoji="🎤" title="Wissen aufnehmen" subtitle="Baustelle → Willi" />
        <Tile href="/bibliothek" emoji="📚" title="Bibliothek" subtitle="Alle Bausteine" accent />
      </section>

      {/* Team & Avatare */}
      <Link href="/team" className="card card-tap flex items-center gap-3 p-4">
        <span className="surface-ink flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ring-1 ring-[#c2a15c]/30">
          🧑‍🤝‍🧑
        </span>
        <div className="flex-1">
          <p className="font-display font-semibold leading-tight">Team &amp; Avatare</p>
          <p className="text-xs text-neutral-500">
            Einzelne Personen fragen – Handwerk &amp; Büro, in ihrem Stil &amp; ihrer Stimme
          </p>
        </div>
        <span className="text-gold text-lg">→</span>
      </Link>

      <footer className="flex flex-col items-center gap-3 pb-8 pt-4">
        <span className="rule-gold w-16" />
        <p className="eyebrow text-neutral-400">Meisterwissen · Modul Innenanstrich</p>
      </footer>
    </main>
  );
}

function Tile({
  href,
  emoji,
  title,
  subtitle,
  accent,
}: {
  href: string;
  emoji: string;
  title: string;
  subtitle: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card-tap relative flex min-h-[128px] flex-col gap-1 overflow-hidden rounded-2xl p-5 ${
        accent ? "surface-ink shadow-2xl" : "card text-neutral-900"
      }`}
    >
      {accent && (
        <>
          <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#1e50e0]/25 blur-2xl" />
          <span className="rule-gold absolute inset-x-5 top-0" />
        </>
      )}
      <span className="relative text-2xl">{emoji}</span>
      <span className={`relative mt-auto font-display font-semibold leading-tight ${accent ? "text-white" : ""}`}>
        {title}
      </span>
      <span className={`relative text-xs ${accent ? "text-white/60" : "text-neutral-500"}`}>
        {subtitle}
      </span>
    </Link>
  );
}
