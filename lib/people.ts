// Personen / Avatare: leiten sich aus dem "Aufgenommen von"-Feld der Bausteine
// ab (created_by). Keine DB-Änderung nötig – wir vergeben jeder Person
// deterministisch (immer gleich) ein Emoji und eine eigene Sprachausgabe-Stimme.

// Von OpenAI-TTS unterstützte Stimmen (ohne "onyx" – das bleibt Willi vorbehalten).
export const PERSON_VOICES = ["alloy", "echo", "fable", "nova", "shimmer"] as const;
export type PersonVoice = (typeof PERSON_VOICES)[number];

// Alle erlaubten TTS-Stimmen (inkl. Willi = onyx) – für Validierung in /api/tts.
export const ALL_TTS_VOICES = ["onyx", ...PERSON_VOICES] as const;

// Auswahl mit Klartext-Label für die Einstellungs-Seite (Dropdown + Hörprobe).
export const VOICE_OPTIONS: { id: string; label: string }[] = [
  { id: "onyx", label: "Onyx – männlich, tief" },
  { id: "echo", label: "Echo – männlich" },
  { id: "fable", label: "Fable – männlich, klar" },
  { id: "alloy", label: "Alloy – neutral" },
  { id: "nova", label: "Nova – weiblich" },
  { id: "shimmer", label: "Shimmer – weiblich, weich" },
];

export function voiceLabel(id: string): string {
  return VOICE_OPTIONS.find((v) => v.id === id)?.label ?? id;
}

const PERSON_EMOJIS = ["👷", "🧑‍🔧", "🎨", "🧑‍💼", "💼", "🖌️", "🔧", "🧰", "🧑‍🎨", "📋"];

/** Vereinheitlicht einen Namen (Whitespace zusammenfassen, trimmen). */
export function normalizePerson(name: string | null | undefined): string {
  return (name ?? "").replace(/\s+/g, " ").trim();
}

/** Vergleichs-Schlüssel (klein geschrieben) – für gruppieren & filtern. */
export function personKey(name: string | null | undefined): string {
  return normalizePerson(name).toLowerCase();
}

// Stabiler kleiner Hash (kein Date.now/Random) – gleicher Name → gleicher Wert.
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/** Immer gleiche Stimme für dieselbe Person. */
export function personVoice(name: string): PersonVoice {
  return PERSON_VOICES[hash(personKey(name)) % PERSON_VOICES.length];
}

/** Immer gleiches Emoji für dieselbe Person. */
export function personEmoji(name: string): string {
  return PERSON_EMOJIS[hash(personKey(name)) % PERSON_EMOJIS.length];
}

/** URL-sicherer Slug für /team/[slug]. */
export function personSlug(name: string): string {
  return encodeURIComponent(normalizePerson(name));
}
