// Zugriff auf die Personen-Einstellungen (Tabelle team_members).
// Läuft robust auch OHNE Tabelle: dann greift der berechnete Fallback aus people.ts,
// sodass die App vor der Migration nicht kaputtgeht.

import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePerson, personKey, personVoice, personEmoji } from "@/lib/people";

export type TeamMember = {
  name: string;
  role: string;
  expertise: string;
  voice: string;
  emoji: string;
  active: boolean;
};

export type ResolvedMember = {
  name: string;
  role: string;
  expertise: string;
  voice: string;
  emoji: string;
};

/** Lädt alle Personen-Einstellungen. Fehlt die Tabelle → leeres Array. */
export async function loadTeam(): Promise<TeamMember[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("name, role, expertise, voice, emoji, active");
    if (error || !data) return [];
    return data.map((m) => ({
      name: normalizePerson(m.name as string),
      role: (m.role as string) ?? "",
      expertise: (m.expertise as string) ?? "",
      voice: (m.voice as string) || "onyx",
      emoji: (m.emoji as string) || "👤",
      active: (m.active as boolean) ?? true,
    }));
  } catch {
    return [];
  }
}

/**
 * Löst Stimme/Emoji/Rolle für einen Namen auf:
 * erst aus den Einstellungen, sonst berechneter Fallback (immer gleich pro Name).
 */
export function resolveMember(name: string, team: TeamMember[]): ResolvedMember {
  const key = personKey(name);
  const found = team.find((m) => personKey(m.name) === key);
  const display = normalizePerson(name);
  return {
    name: display,
    role: found?.role ?? "",
    expertise: found?.expertise ?? "",
    voice: found?.voice || personVoice(display),
    emoji: found?.emoji || personEmoji(display),
  };
}
