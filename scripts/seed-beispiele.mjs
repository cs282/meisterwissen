// Beispiel-Seed: 3 zusätzliche, fachlich geprüfte Demo-Bausteine (Innenanstrich).
//   1. Gipskarton spachteln (Q2/Q3) & fürs Streichen vorbereiten   – Toni
//   2. Schimmel im Bad fachgerecht behandeln (kleine Fläche)        – Markus
//   3. Raumklima & Temperatur: wann darf gestrichen werden?         – Toni
//
// Hinweis: GENERIERTE Demo-Inhalte, fachlich sorgfältig geprüft (Stand der Technik,
// z. B. UBA-Schimmelleitfaden: Kleinflächen bis ca. 0,5 m² selbst behandelbar).
// Status "published" mit reviewed_by als dokumentierter Meister-Freigabe der Demo.
//
// Ausführen:  npm run seed:beispiele   (idempotent, feste UUIDs)

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_KEY müssen gesetzt sein (.env.local).");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const uid = (tag, i) => `${tag}-0000-4000-8000-${String(i).padStart(12, "0")}`;
const S = (nr, anweisung, dauer_min = null, warnung = null) => ({ nr, anweisung, dauer_min, warnung });
const MEISTER = "Josef Schmid";

const UNITS = [
  {
    id: uid("be150001", 1), category: "G6", created_by: "Toni (Facharbeiter)",
    title: "Gipskarton spachteln (Q2/Q3) und fürs Streichen vorbereiten",
    situation:
      "Neue Gipskartonwände sollen gestrichen werden. Werden Fugen und Oberfläche nicht sauber vorbereitet, zeichnen sich später alle Fugen und Schraubenköpfe ab – besonders im Streiflicht.",
    steps: [
      S(1, "Fugen mit Fugenspachtel und Bewehrungsstreifen verspachteln, Schraubenköpfe mitspachteln (= Grundverspachtelung, Q1/Q2)."),
      S(2, "Nach dem Durchtrocknen Grate abstoßen und die Flächen fein nachspachteln."),
      S(3, "Für normale Wandflächen reicht Q2; bei Streiflicht (Flurwände, Decken mit Fensterlicht) breit überspachteln = Q3.", null, "Bei kritischem Licht zu niedrige Qualitätsstufe = sichtbare Fugen."),
      S(4, "Fein schleifen (Korn 120–150), dabei den Karton nicht anschleifen.", null, "Aufgerauter Karton faserig – zeichnet sich nach dem Streichen ab."),
      S(5, "Gründlich entstauben (Besen/Sauger)."),
      S(6, "Grundieren, damit Spachtelflächen und Karton gleichmäßig saugen (geeignete Grundierung nach Herstellerangabe, z. B. Tiefgrund).", null, "Ohne Grundierung: Fugen 'blitzen' durch unterschiedliche Saugfähigkeit durch."),
      S(7, "Erst nach dem Trocknen der Grundierung mit der Beschichtung starten."),
    ],
    materials: [
      { produkt: "Fugenspachtel für Gipskarton", hersteller: "z. B. Knauf/Rigips", verbrauch_pro_m2: "ca. 0,3–0,5 kg/m² (fugenabhängig)", gebinde: "Sack" },
      { produkt: "Bewehrungsstreifen (Glasfaser/Papier)", hersteller: "diverse", verbrauch_pro_m2: "nach Fugenlänge", gebinde: "Rolle" },
      { produkt: "Tiefgrund / Grundierung für Gipskarton", hersteller: "nach TM", verbrauch_pro_m2: "nach Herstellerangabe", gebinde: "10 l" },
    ],
    tools: [
      { werkzeug: "Flächenspachtel / Kartuschenpistole", spezifikation: "breites Blatt für Q3" },
      { werkzeug: "Schleifgitter / Handschleifer", spezifikation: "Korn 120–150" },
      { werkzeug: "Staublampe", spezifikation: "Streiflicht-Kontrolle vor dem Streichen" },
    ],
    expert_tips: [
      "Vor dem Streichen mit der Lampe im Streiflicht über die Fläche – jetzt nachspachteln ist billig, nachher teuer.",
      "Lieber zweimal dünn spachteln als einmal dick – trocknet gleichmäßiger und schleift sich leichter.",
    ],
    common_mistakes: [
      "Karton beim Schleifen aufgeraut → Fasern zeichnen sich im Anstrich ab.",
      "Nicht grundiert → Fugen und Spachtelstellen scheinen durch (unterschiedliche Saugfähigkeit).",
      "Q2 bei Streiflichtflächen → alle Fugen sichtbar.",
    ],
    diagnosis_hints: [
      "Fugen zeichnen sich nach dem Streichen ab = fehlende/falsche Grundierung oder zu niedrige Q-Stufe.",
      "Raue, faserige Stellen im Anstrich = Karton wurde angeschliffen.",
    ],
    transcript:
      "Bei Gipskarton spachtle ich erst die Fugen mit Streifen, dann fein drüber. Wo Streiflicht hinkommt, mach ich Q3. Wichtig: fein schleifen ohne den Karton anzurauen, gut entstauben und unbedingt grundieren, sonst blitzen die Fugen später durch.",
  },
  {
    id: uid("be150002", 2), category: "G6", created_by: "Markus (Bauleiter/GF)",
    title: "Schimmel im Bad fachgerecht behandeln (kleine Fläche)",
    situation:
      "In einer Duschecke zeigen sich schwarze Schimmelpunkte auf der Wand. Einfach überstreichen bringt nichts – der Befall kommt durch. Kleinflächen (bis ca. 0,5 m²) können fachgerecht selbst behandelt werden, größere Flächen sind ein Fall für die Ursachenklärung durch den Fachmann.",
    steps: [
      S(1, "Ursache klären: Lüftungsverhalten, Wärmebrücke, Wasserschaden? Ohne Ursachenbeseitigung kommt der Schimmel wieder.", null, "Bei Verdacht auf Leckage/Bauschaden: erst klären, dann beschichten."),
      S(2, "Befallsgröße prüfen: über ca. 0,5 m² oder tief im Putz → Fachbetrieb/Bauherr einschalten, nicht einfach behandeln.", null, "Großflächiger Befall ist keine Streicharbeit."),
      S(3, "Schutz anlegen: Handschuhe, FFP2-Maske, lüften; empfindliche Personen aus dem Raum."),
      S(4, "Befall mit 70–80%igem Alkohol (Brennspiritus) satt abwaschen, Tücher danach entsorgen.", null, "Alkohol: Fenster auf, keine offenen Flammen. Essig ist auf Wand ungeeignet."),
      S(5, "Fläche vollständig trocknen lassen und Behandlung bei Bedarf wiederholen."),
      S(6, "Erst dann beschichten – ideal mineralisch/alkalisch (z. B. Silikat- oder spezielle Anti-Schimmel-Farbe nach TM)."),
      S(7, "Kunde einweisen: Stoßlüften nach dem Duschen, Möbel von kalten Außenwänden abrücken."),
    ],
    materials: [
      { produkt: "Brennspiritus / Alkohol 70–80 %", hersteller: "diverse", verbrauch_pro_m2: "nach Befall", gebinde: "1 l" },
      { produkt: "Silikatfarbe / Anti-Schimmel-Innenfarbe", hersteller: "nach TM", verbrauch_pro_m2: "nach Herstellerangabe", gebinde: "12,5 l" },
    ],
    tools: [
      { werkzeug: "FFP2-Maske + Nitril-Handschuhe", spezifikation: "Pflicht bei Schimmelarbeiten" },
      { werkzeug: "Einweg-Tücher/Schwämme", spezifikation: "nach Gebrauch entsorgen" },
    ],
    expert_tips: [
      "Nur überstreichen ohne Behandlung und Ursache = der Befall ist in Wochen wieder da.",
      "Alkalische, mineralische Beschichtungen (Silikat) machen es neuem Schimmel schwer.",
      "Chlorhaltige 'Schimmelentferner' in Wohnräumen möglichst vermeiden – Geruchs-/Gesundheitsbelastung.",
    ],
    common_mistakes: [
      "Schimmel einfach mit Dispersion überstrichen → schlägt wieder durch.",
      "Große Flächen selbst behandelt statt Ursache klären zu lassen.",
      "Ohne Maske/Handschuhe gearbeitet.",
    ],
    diagnosis_hints: [
      "Punktueller Befall in Duschecke/Fensterlaibung = meist Kondensat (Lüftung/Wärmebrücke).",
      "Großflächiger oder wiederkehrender Befall = Ursache im Bauwerk → Fachmann.",
    ],
    transcript:
      "Bei so schwarzen Punkten in der Duschecke erst die Ursache anschauen – meistens Lüftung oder eine kalte Ecke. Kleine Flächen bis etwa einen halben Quadratmeter wasche ich mit hochprozentigem Alkohol ab, mit Maske und Handschuhen. Trocknen lassen, dann mineralisch beschichten. Und dem Kunden erklären, dass er stoßlüften muss – sonst ist das Zeug in vier Wochen wieder da.",
  },
  {
    id: uid("be150003", 3), category: "G7", created_by: "Toni (Facharbeiter)",
    title: "Raumklima & Temperatur: wann darf innen gestrichen werden?",
    situation:
      "Winterbaustelle oder frisch verputzter Neubau: Es soll gestrichen werden, aber Raum und Wand sind kalt oder die Luft ist feucht. Wer hier einfach loslegt, riskiert Trocknungsfehler, Ansätze und schlechte Haftung.",
    steps: [
      S(1, "Temperatur prüfen: Luft UND Untergrund dürfen die Mindest-Verarbeitungstemperatur laut TM nicht unterschreiten (bei den meisten Dispersionsfarben +5 °C, angenehm sind 15–20 °C)."),
      S(2, "Luftfeuchte prüfen: bei deutlich über ~70 % rel. Feuchte trocknet die Beschichtung schlecht – erst heizen/lüften."),
      S(3, "Frischen Putz ausreichend austrocknen lassen (Herstellerangaben/Feuchtemessung beachten), nicht auf klatschnassen Untergrund streichen."),
      S(4, "Gleichmäßig temperieren: Zugluft und punktuelles 'Totheizen' einzelner Wandbereiche vermeiden.", null, "Zugluft & Heizstrahler direkt auf die Fläche = Ansätze und Trocknungsränder."),
      S(5, "Zwischen den Anstrichen die Trocknungszeit laut TM einhalten – bei Kälte/Feuchte verlängert sie sich deutlich."),
    ],
    materials: [
      { produkt: "Dispersions-Innenfarbe", hersteller: "nach TM", verbrauch_pro_m2: "nach Herstellerangabe", gebinde: "12,5 l" },
    ],
    tools: [
      { werkzeug: "Thermo-/Hygrometer", spezifikation: "Luft & möglichst Oberflächentemperatur" },
      { werkzeug: "Bautrockner/Heizung + Lüftung", spezifikation: "gleichmäßig temperieren, nicht punktuell" },
    ],
    expert_tips: [
      "Nicht nur die Luft messen – die kalte Wand ist das Problem: Untergrundtemperatur zählt.",
      "Lieber einen Tag heizen und lüften als zwei Tage Reklamation.",
    ],
    common_mistakes: [
      "Bei zu kaltem Untergrund gestrichen → schlechte Filmbildung, Haftungsprobleme.",
      "Zweite Schicht zu früh → Anlösen/Abriss der ersten Schicht.",
      "Mit Heizstrahler direkt auf die Fläche 'schnellgetrocknet' → Ansätze und Ränder.",
    ],
    diagnosis_hints: [
      "Glanz-/Trocknungsränder nach Winterbaustelle = zu kalt/zu feucht verarbeitet oder Zugluft.",
      "Farbe kreidet/haftet schlecht auf einzelnen Flächen = Untergrund war zu kalt (Kondensat).",
    ],
    transcript:
      "Im Winter messe ich immer erst: Die Wand und die Luft müssen laut Merkblatt warm genug sein, bei den meisten Farben mindestens fünf Grad, besser deutlich mehr. Wenn die Luft zu feucht ist, erst heizen und lüften. Und zwischen den Schichten die Trocknungszeit einhalten – bei Kälte dauert das länger.",
  },
];

function fill(u) {
  return {
    id: u.id, category: u.category, title: u.title, status: "published",
    situation: u.situation ?? null,
    steps: u.steps ?? [], materials: u.materials ?? [], tools: u.tools ?? [],
    expert_tips: u.expert_tips ?? [], common_mistakes: u.common_mistakes ?? [],
    diagnosis_hints: u.diagnosis_hints ?? [], cross_refs: [],
    created_by: u.created_by, reviewed_by: MEISTER,
  };
}

async function cleanup(id) {
  await supabase.from("technical_data").delete().eq("knowledge_unit_id", id);
  await supabase.from("interviews").delete().eq("knowledge_unit_id", id);
  await supabase.from("recordings").delete().eq("knowledge_unit_id", id);
  await supabase.from("knowledge_units").delete().eq("id", id);
}

async function main() {
  console.log(`🌱 Beispiel-Seed: ${UNITS.length} fachlich geprüfte Bausteine …`);
  for (const u of UNITS) {
    await cleanup(u.id);
    let err = (await supabase.from("knowledge_units").insert(fill(u))).error;
    if (err) throw new Error(`${u.title} (unit): ${err.message}`);
    err = (
      await supabase.from("recordings").insert({
        knowledge_unit_id: u.id, type: "audio", file_url: null,
        transcript: u.transcript, duration_sec: 45, recorded_by: u.created_by,
      })
    ).error;
    if (err) throw new Error(`${u.title} (recording): ${err.message}`);
    console.log(`   • ${u.category} · ${u.created_by} → ${u.title}`);
  }
  console.log("✅ Fertig – 3 neue Beispiel-Bausteine (published, Meister-Freigabe dokumentiert).");
}

main().catch((e) => {
  console.error("❌ Beispiel-Seed fehlgeschlagen:", e.message);
  process.exit(1);
});
