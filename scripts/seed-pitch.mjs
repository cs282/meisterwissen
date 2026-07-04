// Pitch-Demo: EIN Thema tief ausgebaut – "Durchschlagende Flecken" (Nikotin/Wasser/Rost).
// 4 veröffentlichte Bausteine (Meister-freigegeben) für eine starke Live-Demo:
// "Problem: gelbe Flecken schlagen durch → KI-Meisterwissen gibt Ursache→Diagnose→Lösung".
//
// GENERIERTES Demo-Wissen (realistisch, aber fiktiv), bewusst als "published" für den Pitch.
// Ausführen:  npm run seed:pitch
// Idempotent: feste UUIDs, wird vor dem Anlegen ersetzt.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_KEY müssen gesetzt sein (.env.local).");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const uid = (tag, i) => `${tag}-0000-4000-8000-${String(i).padStart(12, "0")}`;
const S = (nr, anweisung, warnung = null) => ({ nr, anweisung, dauer_min: null, warnung });
const MEISTER = "Josef Schmid";

const UNITS = [
  {
    id: uid("f1ec0001", 1), category: "G6", created_by: "Toni (Facharbeiter)",
    title: "Fleck-Diagnose: Nikotin, Wasser oder Rost?",
    situation: "Auf der Wand zeigen sich gelb-braune Ränder oder Schleier. Bevor gestrichen wird, muss klar sein, WAS durchschlägt – sonst kommt der Fleck wieder.",
    steps: [
      S(1, "Farbe & Form ansehen: flächiger gelb-brauner Schleier = meist Nikotin/Teer; scharf umrandeter Ring = Wasser; punktuelle orange-braune Fahnen = Rost aus Metall/Nägeln."),
      S(2, "Geruchsprobe: riecht die Wand kalt-rauchig, ist es Nikotin."),
      S(3, "Feuchte prüfen: fühlt sich der Wasserfleck klamm an oder ist der Rand dunkel, ist evtl. noch AKTIVE Feuchte da → erst Ursache klären.", "Nie einen feuchten Fleck sperren."),
      S(4, "Wischtest mit feuchtem Tuch: färbt es stark gelb ab, sind wasserlösliche Nikotin-/Teerbestandteile im Spiel."),
      S(5, "Ergebnis bestimmt die Sperre – siehe Baustein „Sperrgrund-Wahl“."),
    ],
    expert_tips: [
      "Erst diagnostizieren, dann sperren – wer blind Dispersion drüberrollt, hat den Fleck in zwei Tagen wieder.",
      "Ein feuchter Wasserfleck wird niemals gesperrt, solange er nass ist.",
    ],
    common_mistakes: [
      "Nikotinschleier mit normaler Wandfarbe überstrichen → schlägt durch.",
      "Aktiven Wasserschaden übermalt → Fleck kommt wieder, dazu Schimmelgefahr.",
    ],
    diagnosis_hints: [
      "Flächiger gelber Schleier + Rauchgeruch = Nikotin/Teer.",
      "Ringförmiger Fleck mit dunklem Rand = Wasser; dunkler Rand = evtl. noch feucht.",
      "Punktuelle orange-braune Fahnen = Rost aus Metall/Nägeln.",
    ],
    transcript: "Wenn so ein gelber Fleck durchkommt, schau ich zuerst: flächiger Schleier mit Rauchgeruch ist Nikotin, ein Ring mit dunklem Rand ist Wasser, und so orange Fahnen sind Rost. Und einen feuchten Fleck sperre ich nie, der muss erst trocken sein.",
  },
  {
    id: uid("f1ec0002", 2), category: "G6", created_by: "Markus (Bauleiter/GF)",
    title: "Wasserfleck: erst die Ursache, dann sperren",
    situation: "Ein ringförmiger brauner Wasserfleck an Decke oder Wand. Häufigster Fehler: sofort überstreichen. Zuerst muss die Ursache raus und die Fläche trocken sein.",
    steps: [
      S(1, "Ursache klären: Rohrbruch, undichtes Dach, Kondensat, Bad darüber? Im Zweifel Fachmann/Kunde hinzuziehen."),
      S(2, "Schaden beheben lassen – niemals über eine aktive Leckage streichen.", "Sonst Dauerbaustelle."),
      S(3, "Fläche vollständig trocknen lassen (Messgerät oder klar heller, trockener Rand)."),
      S(4, "Lose/abblätternde Stellen abkratzen, Untergrund festigen."),
      S(5, "Isoliergrund (Absperrgrund) satt auftragen, Trockenzeit einhalten."),
      S(6, "Deckend in zwei Schichten überstreichen."),
    ],
    expert_tips: [
      "Ohne trockene Fläche hält keine Sperre – Geduld spart den zweiten Einsatz.",
      "Bei Deckenflecken immer nach oben denken: Dach, Bad, Leitung.",
    ],
    common_mistakes: [
      "Über nassen Fleck gestrichen → Fleck & Schimmel kommen wieder.",
      "Ursache nicht behoben → wiederkehrender Schaden.",
    ],
    diagnosis_hints: [
      "Fleck wird bei Regen größer/dunkler = aktive undichte Stelle.",
      "Weißliche Ausblühungen = Salze durch Feuchtewanderung.",
    ],
    transcript: "Bei einem Wasserfleck ist das Wichtigste: erst die Ursache finden und beheben lassen. Ich streiche nie über eine aktive Leckage. Wenn alles trocken ist, kommt Sperrgrund drauf und dann zwei Deckschichten.",
  },
  {
    id: uid("f1ec0003", 3), category: "G7", created_by: "Toni (Facharbeiter)",
    title: "Isoliergrund richtig auftragen",
    situation: "Der Fleck ist diagnostiziert und die Fläche trocken. Jetzt wird abgesperrt, damit nichts mehr durchschlägt.",
    steps: [
      S(1, "Fläche nebelfeucht reinigen, trocknen lassen."),
      S(2, "Isoliergrund (Absperrgrund) gut aufrühren."),
      S(3, "Satt und gleichmäßig auftragen – lieber die ganze Wand als nur den Fleck.", "Nur den Fleck sperren = sichtbarer Rand/Kasten."),
      S(4, "Herstellerangabe zur Trockenzeit strikt einhalten."),
      S(5, "Bei starkem Nikotin/Teer eine zweite Sperrschicht."),
      S(6, "Erst danach Dispersion in zwei Deckschichten."),
    ],
    materials: [
      { produkt: "Isoliergrund / Absperrgrund", hersteller: "diverse", verbrauch_pro_m2: "nach Herstellerangabe", gebinde: "2,5 l" },
      { produkt: "Dispersion matt", hersteller: "Brillux / Caparol", verbrauch_pro_m2: "ca. 150 ml/m² je Anstrich", gebinde: "12,5 l" },
    ],
    expert_tips: [
      "Immer die ganze Fläche sperren, nicht nur den Fleck – sonst zeichnet sich der Rand ab.",
      "Lösemittelbasierte Sperren riechen stark – gut lüften, Maske tragen.",
    ],
    common_mistakes: [
      "Nur den Fleck gesperrt → Rand sichtbar.",
      "Zu dünn aufgetragen → schlägt teilweise durch.",
      "Trockenzeit nicht eingehalten → Sperre wirkt nicht.",
    ],
    diagnosis_hints: [
      "Gelber Rand nach dem Trocknen = Sperre zu dünn oder fehlt.",
      "Sichtbarer Kasten um den Fleck = nur partiell gesperrt.",
    ],
    transcript: "Den Isoliergrund trage ich immer satt und über die ganze Fläche auf, nicht nur auf den Fleck, sonst sieht man den Rand. Trockenzeit genau einhalten, bei starkem Nikotin zweimal, dann erst die Dispersion.",
  },
  {
    id: uid("f1ec0004", 4), category: "G6", created_by: "Toni (Facharbeiter)",
    title: "Sperrgrund-Wahl: wasserbasierter Isoliergrund oder Schellack?",
    situation: "Es gibt verschiedene Sperren – welche passt wann? Die falsche Wahl heißt: Fleck schlägt durch oder unnötiger Aufwand.",
    steps: [
      S(1, "Nikotin/Teer auf großer Fläche → wasserbasierter Isoliergrund (geruchsarm, gut für große Flächen)."),
      S(2, "Hartnäckige, punktuelle Wasser-/Nikotinflecken → lösemittel-/schellackbasierte Sperre (sehr sicher, schnell trocken)."),
      S(3, "Rostfahnen → Metall entrosten & grundieren, spezieller Rostsperrgrund."),
      S(4, "Immer: Fläche muss trocken und tragfähig sein.", "Sonst wirkt keine Sperre."),
    ],
    expert_tips: [
      "Schellack-/Spezialsperren sperren fast alles, sind aber teurer und riechen – für Problemfälle top.",
      "Im Zweifel eine Musterfläche machen und über Nacht beobachten.",
    ],
    common_mistakes: [
      "Wasserbasierte Sperre auf frischen, klammen Fleck → wirkt nicht.",
      "Rost nur überstrichen statt behandelt → Fahne kommt wieder.",
    ],
    diagnosis_hints: [
      "Kommt der Fleck trotz Sperre wieder = falsche Sperrenart oder Restfeuchte.",
    ],
    transcript: "Für Nikotin auf großen Flächen nehm ich einen wasserbasierten Isoliergrund, bei hartnäckigen Punktflecken lieber Schellack, der sperrt fast alles. Rost muss ich vorher behandeln, nur überstreichen bringt nichts.",
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
  console.log(`🎤 Pitch-Seed: Thema „Durchschlagende Flecken“ – ${UNITS.length} Bausteine (published) …`);
  for (const u of UNITS) {
    await cleanup(u.id);
    let err = (await supabase.from("knowledge_units").insert(fill(u))).error;
    if (err) throw new Error(`${u.title} (unit): ${err.message}`);
    err = (
      await supabase.from("recordings").insert({
        knowledge_unit_id: u.id, type: "audio", file_url: null,
        transcript: u.transcript, duration_sec: 42, recorded_by: u.created_by,
      })
    ).error;
    if (err) throw new Error(`${u.title} (recording): ${err.message}`);
    console.log(`   • ${u.category} · ${u.created_by} → ${u.title}`);
  }
  console.log("✅ Fertig – 1 Thema, 4 freigegebene Bausteine für die Live-Demo.");
  console.log('   Demo-Frage: „Warum schlagen die gelben Flecken immer wieder durch?“');
}

main().catch((e) => {
  console.error("❌ Pitch-Seed fehlgeschlagen:", e.message);
  process.exit(1);
});
