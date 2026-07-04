// Seed-Script "Team": legt 5 Personen (Avatare) mit betriebstypischem Demo-Wissen an.
//   Christian (Chef) · Markus (Bauleiter/GF) · Sabine (Büro & Löhne) ·
//   Toni (Facharbeiter) · Luis (Lehrling)
//
// WICHTIG: Das ist GENERIERTES Demo-Wissen, kein echtes erfasstes Meisterwissen.
// Alle Bausteine bekommen Status "interviewed" (durchgelaufen, NICHT veröffentlicht) –
// der Meister gibt später frei, was wirklich stimmt.
//
// Ausführen:  npm run seed:team   (lädt .env.local automatisch)
// Idempotent: löscht die Team-Demo-Bausteine (feste UUIDs) vor dem Neuanlegen.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_KEY müssen gesetzt sein (.env.local).");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

// Feste UUID pro Baustein (tag = 8 Hexzeichen), damit erneutes Seeden sauber ersetzt.
const uid = (tag, i) => `${tag}-0000-4000-8000-${String(i).padStart(12, "0")}`;
const S = (nr, anweisung, dauer_min = null, warnung = null) => ({ nr, anweisung, dauer_min, warnung });

// ---------------------------------------------------------------------------
// Wissensbausteine (12 Stück), je Person mehrere – Handwerk & Büro gemischt.
// ---------------------------------------------------------------------------
const UNITS = [
  // ===== Christian (Chef) – Unternehmer ==================================
  {
    id: uid("c1000001", 1), category: "BO1", created_by: "Christian (Chef)",
    title: "Angebot für einen Innenanstrich kalkulieren",
    situation: "Ein Kunde will ein Angebot für einen Innenanstrich. Ich muss so kalkulieren, dass wir Geld verdienen und trotzdem konkurrenzfähig bleiben.",
    steps: [
      S(1, "Aufmaß nehmen: Wandflächen in m² (Länge × Höhe), Türen/Fenster abziehen, Decken separat rechnen."),
      S(2, "Untergrund bewerten: saugend, Altanstrich tragfähig, Risse? Das bestimmt Vorarbeit und Material.", null, "Untergrund entscheidet über den Gewinn."),
      S(3, "Zeit schätzen: Erfahrungswert pro m² (grundieren/spachteln/2× streichen) mal Stundensatz."),
      S(4, "Material aufschlagen: Farbe nach Verbrauch + Kleinmaterial (Krepp, Folie, Grundierung)."),
      S(5, "Zuschläge: Anfahrt, Möbel rücken, Gerüst, Risiko-/Gewinnaufschlag."),
      S(6, "Angebot schriftlich mit klaren Positionen und Zahlungsziel."),
    ],
    expert_tips: [
      "Lieber ehrlich kalkulieren als billig anbieten und draufzahlen.",
      "Vorarbeit (Spachteln/Grundieren) immer separat ausweisen – sonst Streit bei Mehraufwand.",
    ],
    common_mistakes: [
      "Untergrund unterschätzt → Vorarbeit frisst den Gewinn.",
      "Pauschal statt nach Aufmaß → verkalkuliert.",
    ],
    transcript: "Also wenn ein Kunde ein Angebot will, mach ich zuerst ein sauberes Aufmaß, schau mir den Untergrund an, und dann rechne ich Zeit mal Stundensatz plus Material und Zuschläge. Die Vorarbeit weise ich immer extra aus.",
  },
  {
    id: uid("c1000002", 2), category: "BO5", created_by: "Christian (Chef)",
    title: "Erstgespräch mit einem neuen Kunden",
    situation: "Ein neuer Kunde ruft an oder wir sind beim Ortstermin. Aus dem ersten Eindruck entscheidet sich oft der Auftrag.",
    steps: [
      S(1, "Zuhören: Was will der Kunde wirklich – Farbe, Termin, Budget?"),
      S(2, "Räume anschauen, Untergrund checken, Fotos machen."),
      S(3, "Ehrlich beraten: was geht, was nicht, was kostet extra."),
      S(4, "Klaren nächsten Schritt vereinbaren: Angebot bis Datum X."),
    ],
    expert_tips: [
      "Pünktlich und sauber auftreten – der erste Eindruck verkauft.",
      "Nie etwas versprechen, das die Baustelle nicht halten kann.",
    ],
    common_mistakes: ["Zu viel reden, zu wenig zuhören.", "Kein klarer nächster Schritt → Kunde springt ab."],
    transcript: "Beim Erstgespräch ist Zuhören das Wichtigste. Ich schau mir die Räume an, mach Fotos, berate ehrlich und vereinbare immer einen klaren nächsten Schritt, sonst springt der Kunde ab.",
  },

  // ===== Markus (Bauleiter/GF) ==========================================
  {
    id: uid("ba000001", 3), category: "BO2", created_by: "Markus (Bauleiter/GF)",
    title: "Baustelle planen und Team einteilen",
    situation: "Der Auftrag ist da, jetzt muss die Baustelle organisiert und das richtige Team eingeteilt werden.",
    steps: [
      S(1, "Auftrag lesen: Umfang, Termin, Besonderheiten."),
      S(2, "Team zusammenstellen: Facharbeiter + Lehrling passend zum Aufwand."),
      S(3, "Material & Geräte disponieren – mit dem Büro die Bestellung abstimmen."),
      S(4, "Zeitfenster mit dem Kunden abstimmen (Zutritt, Möbel, Strom)."),
      S(5, "Tagesziele festlegen und morgens kurz an die Truppe durchgeben."),
    ],
    expert_tips: [
      "Lehrling immer mit einem erfahrenen Facharbeiter zusammen einteilen.",
      "Puffer einplanen – Trocknungszeiten kann man nicht drücken.",
    ],
    common_mistakes: ["Material erst am Baustellentag bestellt.", "Zu eng getaktet, Trocknung ignoriert."],
    transcript: "Wenn ein Auftrag reinkommt, stelle ich das Team zusammen, den Lehrling immer zu einem erfahrenen Mann. Material stimme ich mit dem Büro ab und plane Puffer für die Trocknung ein.",
  },
  {
    id: uid("ba000002", 4), category: "G9", created_by: "Markus (Bauleiter/GF)",
    title: "Qualitätskontrolle und Abnahme mit dem Kunden",
    situation: "Die Arbeit ist fertig, vor der Übergabe muss die Qualität stimmen und der Kunde sauber abnehmen.",
    steps: [
      S(1, "Eigenkontrolle bei Tageslicht und Streiflicht: Ansätze, Wolken, Fehlstellen?", null, "Streiflicht mit Lampe zeigt jeden Ansatz."),
      S(2, "Kanten, Übergänge, Steckdosen und Schalter prüfen."),
      S(3, "Baustelle sauber räumen, Folie und Krepp entfernen."),
      S(4, "Mit dem Kunden gemeinsam abgehen, offene Punkte notieren."),
      S(5, "Abnahme dokumentieren (Foto/Protokoll), Rechnung anstoßen."),
    ],
    expert_tips: [
      "Vor dem Kunden selbst mit der Lampe prüfen – dann gibt's keine Überraschung.",
      "Kleine Mängel sofort nachbessern, nicht diskutieren.",
    ],
    common_mistakes: ["Nur bei Deckenlicht kontrolliert → Ansätze übersehen.", "Ohne Protokoll abgenommen → Streit bei Reklamation."],
    diagnosis_hints: ["Sichtbare Ansätze im Streiflicht = ungleichmäßig oder mit Pausen gestrichen."],
    transcript: "Vor der Abnahme gehe ich mit der Lampe im Streiflicht über alle Flächen, prüfe Kanten und Steckdosen, räume sauber und nehme dann mit dem Kunden gemeinsam ab – immer mit Protokoll.",
  },

  // ===== Sabine (Büro & Löhne) – Büromaus ===============================
  {
    id: uid("b0000001", 5), category: "BO6", created_by: "Sabine (Büro & Löhne)",
    title: "Löhne und Stunden abrechnen",
    situation: "Am Monatsende müssen die Stunden aller Mitarbeiter erfasst und die Löhne korrekt abgerechnet werden.",
    steps: [
      S(1, "Stundenzettel aller Mitarbeiter einsammeln und prüfen."),
      S(2, "Stunden nach Baustelle zuordnen (für die Nachkalkulation)."),
      S(3, "Zuschläge, Auslöse und Fahrgeld erfassen."),
      S(4, "An Lohnbüro/Steuerberater weitergeben oder im Programm erfassen."),
      S(5, "Lohnabrechnungen verteilen, Überweisung fristgerecht."),
    ],
    expert_tips: [
      "Stundenzettel wöchentlich einsammeln – am Monatsende fehlt sonst die Hälfte.",
      "Baustellen-Stunden sauber trennen, sonst stimmt die Nachkalkulation nicht.",
    ],
    common_mistakes: ["Zettel zu spät → Lohn verspätet.", "Auslöse und Zuschläge vergessen."],
    transcript: "Ich sammle die Stundenzettel am besten wöchentlich ein, ordne die Stunden den Baustellen zu, erfasse Zuschläge und Auslöse und gebe alles fristgerecht ans Lohnbüro weiter.",
  },
  {
    id: uid("b0000002", 6), category: "BO3", created_by: "Sabine (Büro & Löhne)",
    title: "Rechnung schreiben und Mahnwesen",
    situation: "Ein Auftrag ist abgenommen, jetzt muss die Rechnung raus und – wenn nötig – nachgefasst werden.",
    steps: [
      S(1, "Rechnung nach Angebot/Aufmaß erstellen, Positionen klar aufführen."),
      S(2, "Zahlungsziel 14 Tage und Bankdaten angeben."),
      S(3, "Nach Fälligkeit prüfen, ob bezahlt wurde."),
      S(4, "Freundliche Zahlungserinnerung nach ca. 7 Tagen Überzug."),
      S(5, "1. und 2. Mahnung mit Frist, dann den Chef informieren."),
    ],
    expert_tips: [
      "Zuerst freundlich erinnern – die meisten haben es nur vergessen.",
      "Rechnung sofort nach der Abnahme schreiben, nicht sammeln.",
    ],
    common_mistakes: ["Rechnung wochenlang liegen gelassen.", "Gleich hart mahnen → Kunde verärgert."],
    transcript: "Die Rechnung schreibe ich sofort nach der Abnahme mit klaren Positionen und 14 Tagen Zahlungsziel. Wenn nicht bezahlt wird, erinnere ich erst freundlich, dann kommen die Mahnungen mit Frist.",
  },
  {
    id: uid("b0000003", 7), category: "BO4", created_by: "Sabine (Büro & Löhne)",
    title: "Material bestellen und Lieferanten",
    situation: "Für die Baustellen muss rechtzeitig das richtige Material da sein, ohne das Lager zu überfüllen.",
    steps: [
      S(1, "Bedarf vom Bauleiter holen (Farbe, Grundierung, Kleinmaterial)."),
      S(2, "Bestände prüfen: was ist noch da?"),
      S(3, "Beim Stammlieferanten bestellen, Liefertermin bestätigen lassen."),
      S(4, "Wareneingang prüfen: Menge, Gebinde, Farbton.", null, "Falscher Farbton ist teuer – doppelt prüfen."),
      S(5, "Lieferschein der Rechnung und Baustelle zuordnen."),
    ],
    expert_tips: [
      "Farbton und Gebindegröße doppelt prüfen – ein falscher Ton kostet richtig Geld.",
      "Ein Stammlieferant gibt bessere Preise und springt bei Engpässen ein.",
    ],
    common_mistakes: ["Zu knapp bestellt → Baustelle steht.", "Falschen Farbton nicht geprüft."],
    transcript: "Ich hole den Bedarf beim Bauleiter, prüfe die Bestände und bestelle beim Stammlieferanten. Beim Wareneingang kontrolliere ich immer Menge, Gebinde und vor allem den Farbton.",
  },

  // ===== Toni (Facharbeiter) ============================================
  {
    id: uid("a0000001", 8), category: "G6", created_by: "Toni (Facharbeiter)",
    title: "Untergrund prüfen vor dem Streichen",
    situation: "Bevor ich streiche, muss ich wissen, was für ein Untergrund das ist – sonst hält der Anstrich nicht.",
    steps: [
      S(1, "Wischtest: kreidet die Fläche ab (weißer Abrieb an der Hand)?"),
      S(2, "Kratz-/Klebebandprobe: hält der Altanstrich noch?"),
      S(3, "Saugtest mit Wasser: perlt es ab (gesperrt) oder saugt es stark (grundieren)?"),
      S(4, "Auf Flecken prüfen: Nikotin, Wasser, Rost → müssen isoliert werden."),
      S(5, "Ergebnis entscheidet die Grundierung: Tiefgrund, Haftgrund oder Sperrgrund."),
    ],
    expert_tips: [
      "Kreidet die Wand, muss Tiefgrund drauf, sonst blättert später alles ab.",
      "Erst prüfen, dann Material wählen – nicht umgekehrt.",
    ],
    common_mistakes: ["Ohne Saugtest grundiert → falsche Grundierung.", "Nicht tragfähigen Altanstrich überstrichen → Abplatzungen."],
    diagnosis_hints: [
      "Abrieb an der Hand = Kalk-/Leimfarbe, kreidet → Tiefgrund nötig.",
      "Wasser perlt ab = Untergrund gesperrt, kein Tiefgrund nötig.",
    ],
    transcript: "Bevor ich streiche, mach ich immer den Wischtest und den Saugtest mit Wasser. Kreidet die Wand oder saugt stark, kommt Tiefgrund drauf. Flecken wie Nikotin muss ich isolieren.",
  },
  {
    id: uid("a0000002", 9), category: "G7", created_by: "Toni (Facharbeiter)",
    title: "Nikotinwand isolieren und überstreichen",
    situation: "Die Wand ist vom Rauchen vergilbt. Einfach Dispersion drüber schlägt nach ein paar Tagen wieder durch.",
    steps: [
      S(1, "Wand nebelfeucht reinigen (ggf. mit Reiniger), gut trocknen lassen."),
      S(2, "Isolier-/Sperrgrund (Aufbrennsperre) satt auftragen.", null, "Zu dünn = der Fleck schlägt wieder durch."),
      S(3, "Trocknungszeit nach Herstellerangabe einhalten."),
      S(4, "Erste Deckschicht Dispersion auftragen."),
      S(5, "Zweite Deckschicht deckend auftragen."),
    ],
    materials: [
      { produkt: "Isoliergrund / Aufbrennsperre", hersteller: "diverse", verbrauch_pro_m2: "nach Herstellerangabe", gebinde: "z. B. 2,5 l" },
      { produkt: "Dispersion matt", hersteller: "Brillux / Caparol", verbrauch_pro_m2: "ca. 150 ml/m² je Anstrich", gebinde: "12,5 l" },
    ],
    expert_tips: [
      "Ohne Sperrgrund kommt der gelbe Schleier nach zwei Tagen wieder durch.",
      "Lieber einmal richtig isolieren als dreimal überstreichen.",
    ],
    common_mistakes: ["Direkt Dispersion ohne Sperre → Flecken schlagen durch.", "Sperrgrund zu dünn aufgetragen."],
    diagnosis_hints: ["Gelbe Ränder nach dem Trocknen = Sperrgrund fehlte oder war zu dünn."],
    transcript: "Bei einer Nikotinwand reinige ich erst, dann kommt satt ein Sperrgrund als Aufbrennsperre drauf. Ohne die schlägt das Gelb wieder durch. Danach zwei Schichten Dispersion.",
  },
  {
    id: uid("a0000003", 10), category: "G7", created_by: "Toni (Facharbeiter)",
    title: "Große Wand ohne Ansätze streichen (nass-in-nass)",
    situation: "Eine große, zusammenhängende Wandfläche soll ohne sichtbare Ansätze und Wolken gestrichen werden.",
    steps: [
      S(1, "Genug Farbe für die ganze Fläche anrühren und bereitstellen."),
      S(2, "Nass-in-nass arbeiten: immer in die noch feuchte Kante hineinrollen."),
      S(3, "Fläche zügig in einem Rutsch fertigstellen, nicht unterbrechen.", null, "Pause mitten in der Fläche gibt einen sichtbaren Ansatz."),
      S(4, "Gleichmäßig rollen, die Rolle nicht zu trocken ausrollen."),
      S(5, "Bei Tageslicht und Streiflicht kontrollieren."),
    ],
    expert_tips: [
      "Nie eine schon angetrocknete Kante wieder anrollen – das gibt Ansätze.",
      "Zu zweit arbeiten: einer schneidet vor, einer rollt nach.",
    ],
    common_mistakes: ["Pause mitten in der Fläche → sichtbarer Ansatz.", "Rolle zu trocken → Wolkenbildung."],
    diagnosis_hints: [
      "Streifen/dunkle Kanten = Ansätze durch angetrocknete Übergänge.",
      "Wolken = ungleichmäßiger Auftrag oder zu wenig Farbe auf der Rolle.",
    ],
    transcript: "Bei einer großen Wand arbeite ich nass-in-nass, immer in die feuchte Kante rein und die Fläche in einem Rutsch fertig. Sonst gibt es Ansätze. Am Ende kontrolliere ich im Streiflicht.",
  },

  // ===== Luis (Lehrling) ================================================
  {
    id: uid("e1000001", 11), category: "G3", created_by: "Luis (Lehrling)",
    title: "Raum abdecken und Arbeitsplatz vorbereiten",
    situation: "Bevor gestrichen wird, muss der Raum sauber abgedeckt und vorbereitet werden – das ist als Lehrling mein Job.",
    steps: [
      S(1, "Möbel raustragen oder in die Raummitte rücken und mit Folie abdecken."),
      S(2, "Boden mit Malervlies/Folie auslegen und an den Kanten festkleben."),
      S(3, "Steckdosen, Schalter, Sockelleisten und Rahmen abkleben."),
      S(4, "Lampen abhängen oder abdecken."),
      S(5, "Material und Werkzeug bereitstellen."),
    ],
    expert_tips: [
      "Malervlies statt nur Folie – es rutscht nicht und saugt Tropfen auf.",
      "Sauber abkleben spart am Ende viel Zeit beim Putzen.",
    ],
    common_mistakes: ["Nur dünne Folie am Boden → rutschig und reißt.", "Krepp schlecht angedrückt → Farbe läuft drunter."],
    transcript: "Als Lehrling decke ich zuerst alles ab: Möbel in die Mitte und unter Folie, Boden mit Vlies auslegen und Steckdosen und Leisten sauber abkleben. Vlies ist besser als Folie, das rutscht nicht.",
  },
  {
    id: uid("e1000002", 12), category: "G4", created_by: "Luis (Lehrling)",
    title: "Werkzeug richtig reinigen und pflegen",
    situation: "Nach der Arbeit müssen Rolle, Pinsel und Eimer richtig gereinigt werden, damit sie lange halten.",
    steps: [
      S(1, "Überschüssige Farbe abstreifen (Abstreifgitter/Zeitung)."),
      S(2, "Bei Dispersion: mit Wasser gründlich ausspülen, bis es klar läuft."),
      S(3, "Pinsel in Form streichen und hängend oder liegend trocknen."),
      S(4, "Rollenbezug ausdrücken und zum Trocknen aufstellen."),
      S(5, "Eimer und Wanne auswaschen, alles ordentlich wegräumen."),
    ],
    expert_tips: [
      "Rolle über Nacht luftdicht in Folie einwickeln – dann muss man nicht jeden Tag auswaschen.",
      "Einen guten Pinsel pflegen, der hält dann viele Jahre.",
    ],
    common_mistakes: ["Farbe im Pinsel antrocknen lassen → Pinsel hinüber.", "Rolle nicht ausgedrückt → verklebt und haart später."],
    transcript: "Nach der Arbeit streife ich die Farbe ab und spüle Rolle und Pinsel mit Wasser aus, bis es klar läuft. Wenn wir am nächsten Tag weitermachen, wickle ich die Rolle über Nacht in Folie ein.",
  },
];

// Personen-Einstellungen (Stimme, Rolle, Fachgebiet) – Standardwerte, im
// Einstellungs-Screen jederzeit änderbar.
const MEMBERS = [
  {
    name: "Christian (Chef)", role: "Unternehmer / Inhaber", voice: "fable", emoji: "🧑‍💼",
    expertise: "Angebote, Kalkulation, Preise, Erstgespräche und Kundengewinnung, Firmenstrategie, Reklamationen auf Chef-Ebene, Führung.",
  },
  {
    name: "Markus (Bauleiter/GF)", role: "Bauleiter & Geschäftsführer", voice: "echo", emoji: "📋",
    expertise: "Baustellenplanung, Terminplanung, Team einteilen, Personaleinsatz, Materialdisposition, Qualitätskontrolle und Abnahme, Arbeitssicherheit.",
  },
  {
    name: "Sabine (Büro & Löhne)", role: "Büro / Lohnbuchhaltung", voice: "nova", emoji: "💼",
    expertise: "Löhne, Stunden, Lohnabrechnung, Rechnungen, Mahnwesen, Buchhaltung, Materialbestellung, Lieferanten, Büroorganisation, Personalpapiere.",
  },
  {
    name: "Toni (Facharbeiter)", role: "Facharbeiter / Geselle", voice: "alloy", emoji: "👷",
    expertise: "Untergrund prüfen, Grundierung, Isoliergrund, Streichtechnik, Dispersion, nass-in-nass, Abkleben, handwerkliche Ausführung auf der Baustelle.",
  },
  {
    name: "Luis (Lehrling)", role: "Auszubildender / Lehrling", voice: "onyx", emoji: "🎨",
    expertise: "Abdecken, Arbeitsplatz vorbereiten, Werkzeug reinigen und pflegen, Grundlagen, einfache Vorarbeiten und Zuarbeit.",
  },
];

// ---------------------------------------------------------------------------
function fill(u) {
  return {
    id: u.id,
    category: u.category,
    title: u.title,
    status: "interviewed", // durchgelaufen, NICHT veröffentlicht
    situation: u.situation ?? null,
    steps: u.steps ?? [],
    materials: u.materials ?? [],
    tools: u.tools ?? [],
    expert_tips: u.expert_tips ?? [],
    common_mistakes: u.common_mistakes ?? [],
    diagnosis_hints: u.diagnosis_hints ?? [],
    cross_refs: [],
    created_by: u.created_by,
    reviewed_by: null,
  };
}

async function cleanup(id) {
  await supabase.from("technical_data").delete().eq("knowledge_unit_id", id);
  await supabase.from("interviews").delete().eq("knowledge_unit_id", id);
  await supabase.from("recordings").delete().eq("knowledge_unit_id", id);
  await supabase.from("knowledge_units").delete().eq("id", id);
}

async function main() {
  console.log(`🌱 Team-Seed startet – ${UNITS.length} Bausteine für 5 Personen …`);

  for (const u of UNITS) {
    await cleanup(u.id);

    let err = (await supabase.from("knowledge_units").insert(fill(u))).error;
    if (err) throw new Error(`${u.title} (unit): ${err.message}`);

    err = (
      await supabase.from("recordings").insert({
        knowledge_unit_id: u.id,
        type: "audio",
        file_url: null,
        transcript: u.transcript,
        duration_sec: 40,
        recorded_by: u.created_by,
      })
    ).error;
    if (err) throw new Error(`${u.title} (recording): ${err.message}`);

    console.log(`   • ${u.created_by} → ${u.category}: ${u.title}`);
  }

  // --- Personen-Einstellungen (Stimme/Rolle/Fachgebiet) --------------------
  const { error: mErr } = await supabase
    .from("team_members")
    .upsert(MEMBERS.map((m) => ({ ...m, active: true })), { onConflict: "name" });
  if (mErr) {
    if (/team_members/i.test(mErr.message)) {
      console.warn("⚠  Tabelle team_members fehlt noch – bitte Migration 0002_team.sql in Supabase ausführen, dann erneut seeden.");
    } else {
      console.warn(`⚠  Personen-Einstellungen: ${mErr.message}`);
    }
  } else {
    console.log(`⚙  ${MEMBERS.length} Personen eingerichtet (Stimme, Rolle, Fachgebiet).`);
  }

  const people = [...new Set(UNITS.map((u) => u.created_by))];
  console.log(`✅ Fertig. ${people.length} Avatare:`);
  people.forEach((p) => console.log(`   – ${p} (${UNITS.filter((u) => u.created_by === p).length} Bausteine)`));
  console.log('ℹ️  Status "interviewed" (nicht veröffentlicht) – Meister gibt frei, was stimmt.');
}

main().catch((e) => {
  console.error("❌ Team-Seed fehlgeschlagen:", e.message);
  process.exit(1);
});
