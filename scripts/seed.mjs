// Seed-Script für die Demo. Legt zwei Wissensbausteine an:
//   1. D4 "Scharfe Kante bei abgesetzter Wandfläche" – Status published (Zielbild)
//   2. B5 "Nikotinwand isolieren"                    – Status draft (nur Transkript)
//
// Ausführen:  npm run seed   (lädt .env.local automatisch)
// Idempotent: löscht die beiden Demo-Bausteine (feste UUIDs) vor dem Neuanlegen.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_KEY müssen gesetzt sein (.env.local).",
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const D4_ID = "d4d4d4d4-0000-4000-8000-000000000001";
const B5_ID = "b5b5b5b5-0000-4000-8000-000000000002";

// --- 1-Sekunden-WAV (leiser Ton) für einen funktionierenden Player -----------
function makeWav() {
  const sr = 16000;
  const n = sr;
  const dataLen = n * 2;
  const buf = Buffer.alloc(44 + dataLen);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataLen, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataLen, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.sin(i / 8) * 400), 44 + i * 2);
  return buf;
}

// --- Inhalte ----------------------------------------------------------------
const D4_TRANSCRIPT =
  "...also ich kleb das Band sauber ab, dann geh ich mit Acryl ganz dünn über die Kante, das " +
  "versiegelt das Band, und dann erst kommt die Farbe drüber – so läuft nix drunter und die Kante " +
  "wird messerscharf...";

const B5_TRANSCRIPT =
  "...die Wand ist total vergilbt vom Rauchen, überall so ein gelb-brauner Schleier. Wenn ich da " +
  "einfach Dispersion drüberrolle, schlägt das nach zwei Tagen wieder durch. Da muss ein " +
  "Isoliergrund drauf, sonst kannst du das vergessen...";

const d4Unit = {
  id: D4_ID,
  category: "G7",
  title: "Scharfe Kante bei abgesetzter Wandfläche",
  status: "published",
  situation:
    "Zwei aneinandergrenzende Wandflächen sollen farblich sauber voneinander abgesetzt werden. " +
    "Ziel ist eine messerscharfe, gerade Trennkante ohne Unterläufer.",
  steps: [
    {
      nr: 1,
      anweisung:
        "Klebeband exakt entlang der geplanten Trennlinie aufkleben und die Kante mit dem Fingernagel/Spachtel fest andrücken.",
      dauer_min: 10,
      warnung: "Nicht angedrücktes Band ist die Hauptursache für Unterläufer.",
    },
    {
      nr: 2,
      anweisung:
        "Übermalbares Maler-Acryl hauchdünn über die Bandkante ziehen und glatt abziehen – das versiegelt die Bandkante.",
      dauer_min: 15,
      warnung: "Nur ein hauchdünner Film, keine Wulst.",
    },
    {
      nr: 3,
      anweisung: "Acryl kurz anziehen lassen (Fingerprobe), damit es beim Streichen nicht verschmiert.",
      dauer_min: 10,
      warnung: null,
    },
    {
      nr: 4,
      anweisung:
        "Erste Schicht der Absetzfarbe über die Kante auftragen – was jetzt unterläuft, ist die eigene Farbe und bleibt unsichtbar.",
      dauer_min: 25,
      warnung: null,
    },
    {
      nr: 5,
      anweisung: "Nach Zwischentrocknung zweite Schicht deckend auftragen.",
      dauer_min: 25,
      warnung: "Herstellerangabe zur Überarbeitungszeit beachten.",
    },
    {
      nr: 6,
      anweisung:
        "Klebeband im noch leicht feuchten Zustand in flachem 45°-Winkel gleichmäßig abziehen.",
      dauer_min: 5,
      warnung: "Vollständig durchgetrocknet reißt der Farbfilm an der Kante aus.",
    },
  ],
  materials: [
    {
      produkt: "Indeko-plus",
      hersteller: "Caparol",
      verbrauch_pro_m2: "ca. 150 ml/m² je Anstrich",
      gebinde: "12,5 l",
    },
    {
      produkt: "Maler-Acryl (übermalbar)",
      hersteller: "diverse",
      verbrauch_pro_m2: "sehr gering (nur Kantenversiegelung)",
      gebinde: "Kartusche 310 ml",
    },
    {
      produkt: "Feinkrepp / Goldband",
      hersteller: "diverse",
      verbrauch_pro_m2: "nach Kantenlänge",
      gebinde: "Rolle 50 m",
    },
  ],
  tools: [
    { werkzeug: "Abklebeband", spezifikation: "Feinkrepp, scharfkantig, UV-stabil" },
    { werkzeug: "Japanspachtel / Finger", spezifikation: "zum Andrücken & Acryl abziehen" },
    { werkzeug: "Flächenstreicher / Rolle", spezifikation: "Florhöhe 12 mm für Indeko-plus" },
  ],
  expert_tips: [
    "Acryl nur hauchdünn – es soll die Bandkante versiegeln, nicht auftragen.",
    "Alternativ/zusätzlich die Kante erst mit der Grund- bzw. Ausgangsfarbe überstreichen: Unterläufer sind dann farbgleich und unsichtbar.",
    "Band immer solange die Farbe noch leicht feucht ist und im flachen Winkel abziehen – dann reißt die Kante nicht aus.",
  ],
  common_mistakes: [
    "Zu viel Acryl aufgetragen → sichtbare Wulst statt scharfer Kante.",
    "Band erst nach vollständiger Durchtrocknung abgezogen → Farbfilm reißt aus.",
    "Band nicht richtig angedrückt → Farbe läuft unter die Kante.",
  ],
  diagnosis_hints: [
    "Ausgefranste Kante = Band zu spät oder zu steil abgezogen.",
    "Farbe unterlaufen = Bandkante war nicht versiegelt oder Band nicht angedrückt.",
  ],
  cross_refs: [],
  created_by: "Demo (Seed)",
  reviewed_by: "Josef Schmid",
};

const b5Unit = {
  id: B5_ID,
  category: "G6",
  title: "Nikotinwand isolieren",
  status: "draft",
  situation: null,
  steps: [],
  materials: [],
  tools: [],
  expert_tips: [],
  common_mistakes: [],
  diagnosis_hints: [],
  cross_refs: [],
  created_by: "Demo (Seed)",
  reviewed_by: null,
};

async function cleanup(id) {
  await supabase.from("technical_data").delete().eq("knowledge_unit_id", id);
  await supabase.from("interviews").delete().eq("knowledge_unit_id", id);
  await supabase.from("recordings").delete().eq("knowledge_unit_id", id);
  await supabase.from("knowledge_units").delete().eq("id", id);
}

async function main() {
  console.log("🌱 Seed startet …");

  await cleanup(D4_ID);
  await cleanup(B5_ID);

  // --- D4 (published) -------------------------------------------------------
  let err = (await supabase.from("knowledge_units").insert(d4Unit)).error;
  if (err) throw new Error(`D4 knowledge_unit: ${err.message}`);

  // Audio-Datei hochladen (Player funktioniert dann in der Demo)
  let d4FileUrl = null;
  const path = `${D4_ID}/demo-aufnahme.wav`;
  const up = await supabase.storage.from("recordings").upload(path, makeWav(), {
    contentType: "audio/wav",
    upsert: true,
  });
  if (up.error) console.warn(`⚠ Audio-Upload übersprungen: ${up.error.message}`);
  else d4FileUrl = path;

  err = (
    await supabase.from("recordings").insert({
      knowledge_unit_id: D4_ID,
      type: "audio",
      file_url: d4FileUrl,
      transcript: D4_TRANSCRIPT,
      duration_sec: 47,
      recorded_by: "Demo (Seed)",
    })
  ).error;
  if (err) throw new Error(`D4 recording: ${err.message}`);

  err = (
    await supabase.from("interviews").insert({
      knowledge_unit_id: D4_ID,
      transcript: [
        { role: "assistant", content: "Okay, du hast gezeigt, wie du die Kante mit Acryl versiegelst." },
        { role: "user", content: "Genau, dünn Acryl über die Bandkante, dann erst Farbe." },
      ],
      extracted_fields: {
        situation: d4Unit.situation,
        steps: d4Unit.steps,
        materials: d4Unit.materials,
        tools: d4Unit.tools,
        expert_tips: d4Unit.expert_tips,
        common_mistakes: d4Unit.common_mistakes,
        diagnosis_hints: d4Unit.diagnosis_hints,
        open_gaps: [],
      },
      open_gaps: [],
      completed_at: new Date().toISOString(),
    })
  ).error;
  if (err) throw new Error(`D4 interview: ${err.message}`);

  // --- B5 (draft, nur Transkript) ------------------------------------------
  err = (await supabase.from("knowledge_units").insert(b5Unit)).error;
  if (err) throw new Error(`B5 knowledge_unit: ${err.message}`);

  err = (
    await supabase.from("recordings").insert({
      knowledge_unit_id: B5_ID,
      type: "audio",
      file_url: null,
      transcript: B5_TRANSCRIPT,
      duration_sec: 31,
      recorded_by: "Demo (Seed)",
    })
  ).error;
  if (err) throw new Error(`B5 recording: ${err.message}`);

  console.log("✅ Seed fertig:");
  console.log("   • D4 (published): Scharfe Kante bei abgesetzter Wandfläche");
  console.log("   • B5 (draft):     Nikotinwand isolieren");
}

main().catch((e) => {
  console.error("❌ Seed fehlgeschlagen:", e.message);
  process.exit(1);
});
