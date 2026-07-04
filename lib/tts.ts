// Gemeinsame Sprachausgabe (OpenAI TTS).
// Willi spricht energiegeladen & zügig: dafür nutzen wir das steuerbare Modell
// gpt-4o-mini-tts mit Regieanweisung (Tonlage/Tempo). Schlägt das fehl,
// fällt alles automatisch auf das bewährte tts-1 zurück (etwas schnelleres Tempo).

const WILLI_STYLE =
  "Du bist ein deutscher Handwerker-Kollege voller Energie und Begeisterung. " +
  "Sprich SEHR SCHNELL – deutlich schneller als normale Sprecher, zackig, ohne Pausen " +
  "zwischen den Sätzen – mit deutlich angehobener, lebendiger Stimmlage, wie jemand, " +
  "der sich richtig freut und andere ansteckt. Betone kräftig, variiere die Tonhöhe " +
  "stark, klinge begeistert und motivierend, wie ein Sportkommentator unter Kollegen " +
  "auf der Baustelle. Niemals ruhig, getragen oder monoton. Deutsch, locker, mitreißend.";

// Willis Stimme im steuerbaren Modell: "ash" ist heller & energischer als onyx.
const WILLI_VOICE = "ash";

export type SynthesizeOptions = {
  /** Energiegeladener Willi-Stil (Regieanweisung + höheres Tempo). */
  energetic?: boolean;
};

/** Erzeugt MP3-Audio zu einem Text. Wirft bei komplettem Fehlschlag. */
export async function synthesizeSpeech(
  text: string,
  voice: string,
  apiKey: string,
  opts: SynthesizeOptions = {},
): Promise<Buffer> {
  const input = text.slice(0, 4000);
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // 1) Steuerbares Modell mit Regieanweisung (Stimmlage/Tempo).
  // Für Willi nutzen wir dabei die hellere, energischere Stimme "ash".
  if (opts.energetic) {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: WILLI_VOICE,
        input,
        instructions: WILLI_STYLE,
        response_format: "mp3",
      }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    // fällt unten auf tts-1 zurück (z. B. wenn das Modell nicht verfügbar ist)
  }

  // 2) Bewährtes tts-1 (kennt "ash" nicht -> übergebene Stimme); Willi deutlich schneller.
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "tts-1",
      voice,
      input,
      speed: opts.energetic ? 1.3 : 1.0,
      response_format: "mp3",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`TTS: ${t.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
