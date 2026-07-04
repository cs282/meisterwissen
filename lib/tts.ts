// Gemeinsame Sprachausgabe (OpenAI TTS).
// Willi spricht energiegeladen & zügig: dafür nutzen wir das steuerbare Modell
// gpt-4o-mini-tts mit Regieanweisung (Tonlage/Tempo). Schlägt das fehl,
// fällt alles automatisch auf das bewährte tts-1 zurück (etwas schnelleres Tempo).

const WILLI_STYLE =
  "Sprich Deutsch, als energiegeladener, herzlicher Handwerker-Kollege: zügiges Tempo, " +
  "lebendige, motivierende Betonung, freundlich und direkt – nie monoton, nie förmlich. " +
  "Kurz und mitreißend, wie auf der Baustelle unter Kollegen.";

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
  if (opts.energetic) {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input,
        instructions: WILLI_STYLE,
        response_format: "mp3",
      }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    // fällt unten auf tts-1 zurück (z. B. wenn das Modell nicht verfügbar ist)
  }

  // 2) Bewährtes tts-1; bei Willi mit leicht erhöhtem Tempo.
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "tts-1",
      voice,
      input,
      speed: opts.energetic ? 1.15 : 1.0,
      response_format: "mp3",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`TTS: ${t.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
