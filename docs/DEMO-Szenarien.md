# 🎬 Demo-Szenarien – Meisterwissen

Drei geprüfte End-to-End-Abläufe für Pitch & Schulung. Alle Szenarien wurden
real durchgetestet (Stand: Juli 2026). Voraussetzung: Seeds eingespielt
(`npm run seed:team`, `npm run seed:pitch`, `npm run seed:beispiele`).

> Hinweis: Die Demo-Inhalte sind generiert, aber fachlich geprüft. In der
> Bibliothek erkennbar an `geprüft von Josef Schmid` (Demo-Freigabe).

---

## Szenario 1 · „Der Lehrling fragt" (Fragebot, 60 Sekunden)

**Story:** Luis steht allein beim Kunden. Die frisch gestrichene Wand zeigt
wieder gelbe Flecken. Früher: Anruf, niemand geht ran. Heute:

1. Startseite öffnen → Karte **„Frag die Wissensbank"**.
2. Eintippen (oder Chip antippen): **„Warum schlagen die gelben Flecken immer wieder durch?"**
3. → Antwort in Sekunden: Diagnose (Nikotin/Wasser/Rost unterscheiden),
   Isoliergrund als Lösung, typische Fehler – **mit Quellenangabe** der Bausteine.
4. Optional **🔊 anhören** drücken – die Antwort wird vorgelesen (Baustelle, dreckige Hände).

**Erwartetes Ergebnis:** fachlich korrekte Antwort NUR aus den 4 Flecken-Bausteinen,
am Ende „(Quelle: …)". Bei Themen ohne erfasstes Wissen sagt der Bot ehrlich,
dass noch nichts erfasst ist – er erfindet nichts.

---

## Szenario 2 · „Wissen rein in 2 Minuten" (Aufnehmen → Willi → Bibliothek)

**Story:** Toni hat auf der Baustelle einen Trick benutzt – der soll in die Wissensbank.

1. **Aufnehmen** öffnen → **🎙️ Direkt aufnehmen** → 30–60 Sekunden frei sprechen, z. B.:
   *„Ich erkläre, wie ich eine Zimmertür einkleide, damit beim Spritzen nichts danebengeht…"*
2. Rubrik: **„🤖 Willi ordnet automatisch zu"** stehen lassen. Person: **Toni** antippen
   (oder „Automatisch" – dann schlägt die KI die Person nach Inhalt vor).
3. Titel eingeben → **Aufnahme hochladen** → Transkript erscheint zur Sichtkontrolle.
4. **🎧 Interview mit Willi starten** → Willi fasst zusammen und stellt gezielte
   Rückfragen (eine pro Nachricht). Antworten – oder „das reicht" sagen:
   Willi benennt offene Lücken und gibt den fertigen Baustein aus.
5. → **„✅ Baustein automatisch in der Wissensbank gespeichert"** → in der
   Bibliothek liegt er in der richtigen Rubrik, Status „Interviewt".
6. (Meister) Baustein öffnen → **Meister-Review starten** → prüfen → **Freigeben**.

**Erwartetes Ergebnis:** Vom gesprochenen Wort zum strukturierten, auffindbaren
Wissensbaustein ohne Tippen. Fällt die Transkription aus (kein Netz), bleibt die
Aufnahme gespeichert → Knopf „🔄 Transkription erneut versuchen".

---

## Szenario 3 · „Frag die Person" (Team-Avatare mit Stimme)

**Story:** Die Büro-Vertretung weiß nicht, wie Sabine die Löhne abrechnet – Sabine ist im Urlaub.

1. Startseite → **„Team & Avatare"** → **Sabine (Büro & Löhne)** → „fragen →".
2. Frage stellen: **„Wie rechne ich die Löhne ab?"**
3. → Sabine-Avatar antwortet in **Ich-Form**, NUR aus Sabines Bausteinen
   („Ich sammle die Stundenzettel wöchentlich ein…").
4. **🔊 anhören** → Antwort kommt in Sabines eingestellter Stimme (nova, weiblich).
5. Kontrast zeigen: dieselbe Frage bei **Luis (Lehrling)** → er antwortet ehrlich,
   dass er dazu nichts aufgenommen hat.

**Erwartetes Ergebnis:** Personen-Wissen bleibt personenbezogen abrufbar – wie ein
Anruf bei der Kollegin, nur immer erreichbar. Stimmen/Rollen/Fachgebiete verwaltet
der Meister unter **Team → Personen & Stimmen einrichten** (mit Hörprobe).

---

## Backup für den Pitch

- **Screen-Recording** dieser drei Abläufe vorab aufnehmen (falls WLAN/API im
  Pitch streikt, Video zeigen statt live).
- Demo-Frage für die Bühne: **„Warum schlagen die gelben Flecken immer wieder durch?"**
  – liefert die visuell stärkste Antwort (Ursache → Diagnose → Lösung + Quellen).
