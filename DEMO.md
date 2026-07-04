# Meisterwissen – Demo-Anleitung

KI-Wissensklon für das Malerhandwerk (Modul Innenanstrich) · Schmid – Die Malerwerkstätte GmbH

---

## Vorbereitung (einmalig)

1. **`.env.local` anlegen** (aus `.env.local.example` kopieren) und ausfüllen:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
   - `ANTHROPIC_API_KEY` (für Werkstatt-Willi)
   - `OPENAI_API_KEY` (für Whisper-Transkription)
2. **Migration einspielen** in Supabase (SQL-Editor):
   `supabase/migrations/0001_init.sql` – legt die 4 Tabellen, pgvector und den Storage-Bucket `recordings` an.
3. **Demo-Bausteine seeden:**
   ```bash
   npm install
   npm run seed
   ```
   Legt an:
   - **D4 „Scharfe Kante bei abgesetzter Wandfläche"** – Status *Veröffentlicht* (das Zielbild)
   - **B5 „Nikotinwand isolieren"** – Status *Entwurf* (nur Transkript, noch kein Interview)
4. **App starten:**
   ```bash
   npm run dev
   ```
   → http://localhost:3000 (mobil ansehen / schmales Fenster – die App ist mobile-first)

---

## Demo-Ablauf (3 Stationen)

### 1. Aufnehmen mit Live-Audio → Route `/aufnehmen`
- Zeigen: Formular auf Deutsch, Datei-Upload (Video **oder** Audio), Kategorie-Dropdown A1–E5 mit Klartext-Labels, Titel, Name.
- Eine echte Sprachaufnahme (z. B. Handy-Memo) hochladen, Kategorie wählen (z. B. **A6** oder **D4**), absenden.
- Im Hintergrund: Datei landet im Storage, **Whisper** transkribiert (deutsch, mit Fachbegriff-Prompt), es entsteht ein `knowledge_unit` mit Status *Entwurf*.
- Ergebnis: Transkript-Sichtkontrolle mit großem Button **„Interview mit Willi starten"**.

### 2. Interview mit Willi live führen → Route `/interview/[id]`
- Zeigen: **Werkstatt-Willi** (Claude, streamend) fasst das Transkript in 2–3 Sätzen zusammen und stellt **eine** gezielte Rückfrage.
- Live 3–4 Fragen beantworten. Willi bohrt nach Erfahrungswissen: *„Woran erkennst du…?", „Was machen Anfänger falsch?", „Dein persönlicher Trick?"*
- Nach einigen Fragen gibt Willi den strukturierten Wissensbaustein als JSON aus → der Button **„Baustein speichern"** erscheint automatisch.
- Speichern → Status springt auf *Interviewt*, Weiterleitung in die Bibliothek.
- **Kernaussage für die Jury:** Willi erfindet nichts – alles Fachwissen kommt vom Interviewten.

### 3. Bibliothek + Zielbild → Route `/bibliothek`
- Zeigen: alle Bausteine, gruppiert nach Hauptkategorie **A–E** (Untergründe · Farbsysteme & Grundierungen · Werkzeuge & Technik · Ausführungstechniken · Fehlerbilder), mit Status-Badges (grau/blau/gelb/grün).
- **Kontrast zeigen:**
  - **B5 „Nikotinwand isolieren"** (*Entwurf*, grau) – nur Transkript, leer → so sieht Rohmaterial aus.
  - **D4 „Scharfe Kante bei abgesetzter Wandfläche"** (*Veröffentlicht*, grün) – **das Zielbild**.
- D4 öffnen → fertiger Baustein: Situation, nummerierte Arbeitsschritte mit Dauer & Warnungen, Material-Tabelle (**Caparol Indeko-plus**, Verbrauch/m²), Werkzeuge, gelb hervorgehobene **Experten-Tipps**, typische Fehler, Diagnose-Hinweise, Original-Aufnahme als Audio-Player.
- **Meister-Review demonstrieren:** „Meister-Review starten" → Felder editierbar, Prüfername eintragen, **„Freigeben"** setzt `reviewed_by` + Status *Veröffentlicht*.
- Optional: **technisches Datenblatt (PDF)** hochladen mit Quellenangabe (z. B. *„Caparol TI Indeko-plus"*) → erscheint als verlinktes Datenblatt.

---

## Roter Faden für die Jury

**Rohaufnahme von der Baustelle → Willi macht daraus ein Interview → strukturierter, geprüfter Wissensbaustein → später per RAG abrufbar.**
Der Weg vom *Entwurf* (B5) zum *veröffentlichten* Zielbild (D4) macht den Mehrwert in einem Blick sichtbar: aus flüchtigem Erfahrungswissen wird dauerhaftes, freigegebenes Betriebswissen.

> Status-Regel: **kein „Veröffentlicht" ohne Meister-Freigabe** (`reviewed_by` wird beim Freigeben gesetzt).
