// Erkennung & Extraktion des strukturierten Wissensbausteins aus Willis Antwort.
// Isomorph nutzbar (Client zeigt den Speichern-Button, Server parst final).

export type BausteinStep = {
  nr?: number;
  anweisung?: string;
  dauer_min?: number | null;
  warnung?: string | null;
};

export type BausteinMaterial = {
  produkt?: string;
  hersteller?: string;
  verbrauch_pro_m2?: string;
  gebinde?: string;
};

export type BausteinTool = {
  werkzeug?: string;
  spezifikation?: string;
};

export type Baustein = {
  situation?: string;
  steps?: BausteinStep[];
  materials?: BausteinMaterial[];
  tools?: BausteinTool[];
  expert_tips?: string[];
  common_mistakes?: string[];
  diagnosis_hints?: string[];
  open_gaps?: string[];
};

/** Extrahiert den LETZTEN json-Codeblock aus einem Text und parst ihn. */
export function extractBaustein(text: string): Baustein | null {
  const matches = [...text.matchAll(/```json\s*([\s\S]*?)```/g)];
  if (matches.length === 0) return null;
  const raw = matches[matches.length - 1][1].trim();
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Baustein;
    return null;
  } catch {
    return null;
  }
}

/** True, sobald ein gültiger json-Baustein-Block erkannt wird. */
export function hasBaustein(text: string): boolean {
  return extractBaustein(text) !== null;
}
