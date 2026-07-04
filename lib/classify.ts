// Automatische Zuordnung eines Wissens-Textes zu einer Rubrik des Rahmenplans
// (Ausbildungsverordnung Maler und Lackierer). Willi liest das Transkript und
// wählt GENAU EINEN Code – oder gibt null zurück, wenn nichts eindeutig passt.

import Anthropic from "@anthropic-ai/sdk";
import { ALL_CATEGORIES, CATEGORY_CODES } from "./categories";

const MODEL = "claude-sonnet-4-6";

/**
 * Ordnet einen Text (Transkript + optional Titel) einem Rahmenplan-Code zu.
 * Gibt den Code (z. B. "G6") zurück – oder null, wenn keine Zuordnung möglich
 * ist (zu wenig Inhalt, kein API-Key, nichts passt). null = „nicht zugeordnet".
 */
export async function classifyCategory(
  transcript: string,
  title?: string,
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const text = (transcript ?? "").trim();
  const titel = (title ?? "").trim();
  // Zu wenig Inhalt für eine seriöse Zuordnung.
  if (text.length + titel.length < 20) return null;

  const list = ALL_CATEGORIES.map((c) => `${c.code}: ${c.label}`).join("\n");

  const system =
    `Du bist ein Klassifizierer für einen Malerbetrieb. Die Codes decken zwei Bereiche ab: ` +
    `das Maler- und Lackiererhandwerk (Innenanstriche, Codes ohne "BO") UND die ` +
    `Büro-/Betriebsabläufe des Betriebs (Codes mit "BO": Angebote, Rechnungen, Bestellungen, ` +
    `Kundenkommunikation, Personal, Reklamationen).\n\n` +
    `Ordne den beschriebenen Wissens-Inhalt GENAU EINEM Code zu. ` +
    `Geht es um Büro/Organisation/Kaufmännisches, wähle einen "BO"-Code; geht es um die ` +
    `handwerkliche Ausführung, wähle einen der übrigen Codes.\n\n` +
    `Antworte AUSSCHLIESSLICH mit dem Code (z. B. "G6" oder "BO3") – kein weiterer Text. ` +
    `Wenn wirklich nichts eindeutig passt, antworte mit "SONST".\n\n` +
    `Codes:\n${list}`;

  const userContent =
    (titel ? `Titel: ${titel}\n\n` : "") +
    `Inhalt (gesprochene Baustellen-Erklärung):\n${text.slice(0, 6000)}`;

  try {
    const anthropic = new Anthropic();
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 10,
      system,
      messages: [{ role: "user", content: userContent }],
    });

    const raw = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join(" ")
      .toUpperCase();

    // Ersten Code herauslesen, der wirklich im Rahmenplan existiert.
    const match = raw.match(/[A-Z]{1,3}\d{1,2}/);
    const code = match?.[0] ?? "";
    if (CATEGORY_CODES.includes(code)) return code;

    return null; // "SONST" oder unbekannt -> nicht zugeordnet
  } catch {
    return null; // Klassifizierung ist optional – bei Fehler einfach nicht zuordnen
  }
}

/**
 * Schlägt anhand des Inhalts die passende Person vor – auf Basis ihres
 * hinterlegten Fachgebiets (team_members.expertise). Gibt den EXAKTEN Namen
 * aus der Liste zurück, oder null, wenn nichts eindeutig passt.
 *
 * Wichtig: Das ist ein VORSCHLAG anhand des Themas – nicht das Erkennen der
 * echten Stimme. Der Mensch bestätigt/überschreibt.
 */
export async function classifyPerson(
  transcript: string,
  title: string | undefined,
  team: { name: string; role?: string; expertise?: string }[],
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!team.length) return null;

  const text = (transcript ?? "").trim();
  const titel = (title ?? "").trim();
  if (text.length + titel.length < 20) return null;

  const list = team
    .map((p) => `- ${p.name}${p.role ? ` (${p.role})` : ""}: ${p.expertise || "—"}`)
    .join("\n");

  const system =
    `Ein Malerbetrieb erfasst Wissen. Ordne den beschriebenen Inhalt der Person zu, ` +
    `deren Fachgebiet inhaltlich AM BESTEN passt.\n\n` +
    `Antworte AUSSCHLIESSLICH mit dem exakten Namen aus der Liste – Wort für Wort, ` +
    `kein weiterer Text. Wenn keine Person eindeutig passt, antworte mit "KEINE".\n\n` +
    `Personen und ihre Fachgebiete:\n${list}`;

  const userContent =
    (titel ? `Titel: ${titel}\n\n` : "") + `Inhalt:\n${text.slice(0, 6000)}`;

  try {
    const anthropic = new Anthropic();
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 30,
      system,
      messages: [{ role: "user", content: userContent }],
    });
    const raw = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join(" ")
      .trim();

    if (!raw || /keine/i.test(raw)) return null;

    // Exakten Namen aus der Liste finden (tolerant: Modell könnte leicht abweichen).
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
    const hit = team.find((p) => norm(p.name) === norm(raw));
    if (hit) return hit.name;
    const contained = team.find((p) => norm(raw).includes(norm(p.name)));
    return contained?.name ?? null;
  } catch {
    return null;
  }
}
