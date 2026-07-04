import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadTeam, resolveMember } from "@/lib/team";
import { normalizePerson, personKey, ALL_TTS_VOICES } from "@/lib/people";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/team
 * Liefert alle bekannten Personen (aus Einstellungen UND aus vorhandenen
 * Bausteinen) inkl. aufgelöster Stimme/Emoji/Rolle – für Einstellungs-Seite & Picker.
 */
export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase-Zugangsdaten fehlen." }, { status: 500 });
    }
    const supabase = createAdminClient();
    const team = await loadTeam();

    // Beitragende aus den Bausteinen (auch ohne Einstellungs-Eintrag).
    const { data } = await supabase.from("knowledge_units").select("created_by");
    const counts = new Map<string, { name: string; count: number }>();
    for (const r of data ?? []) {
      const name = normalizePerson(r.created_by as string);
      if (!name) continue;
      const k = personKey(name);
      const e = counts.get(k) ?? { name, count: 0 };
      e.count++;
      counts.set(k, e);
    }

    // Namen aus Einstellungen + Beitragende zusammenführen.
    const keys = new Set<string>([...counts.keys(), ...team.map((m) => personKey(m.name))]);
    const people = [...keys]
      .map((k) => {
        const name = counts.get(k)?.name ?? team.find((m) => personKey(m.name) === k)?.name ?? k;
        const r = resolveMember(name, team);
        const configured = team.some((m) => personKey(m.name) === k);
        return { ...r, count: counts.get(k)?.count ?? 0, configured };
      })
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return NextResponse.json({ people });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Fehler" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/team  { name, role?, expertise?, voice?, emoji? }
 * Legt eine Person an oder aktualisiert sie (Upsert über den Namen).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = normalizePerson(body?.name);
    if (!name) return NextResponse.json({ error: "Name fehlt." }, { status: 400 });

    const voice =
      typeof body?.voice === "string" && (ALL_TTS_VOICES as readonly string[]).includes(body.voice)
        ? body.voice
        : "onyx";

    const row = {
      name,
      role: typeof body?.role === "string" ? body.role.slice(0, 200) : "",
      expertise: typeof body?.expertise === "string" ? body.expertise.slice(0, 1000) : "",
      voice,
      emoji: typeof body?.emoji === "string" && body.emoji.trim() ? body.emoji.trim().slice(0, 8) : "👤",
      active: true,
    };

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase-Zugangsdaten fehlen." }, { status: 500 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("team_members").upsert(row, { onConflict: "name" });
    if (error) {
      const hint = /relation .*team_members.* does not exist/i.test(error.message)
        ? "Die Tabelle team_members fehlt noch – bitte die Migration 0002_team.sql in Supabase ausführen."
        : error.message;
      return NextResponse.json({ error: hint }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 500 });
  }
}
