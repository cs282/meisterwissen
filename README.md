# 🎨 Meisterwissen – Der digitale Malermeister

**KI-Wissensklon für das Malerhandwerk.** Entwickelt beim Hackathon für
**Schmid – Die Malerwerkstätte GmbH** (17 Mitarbeiter).

> Wenn der Meister in Rente geht, gehen 40 Jahre Erfahrung mit.
> Meisterwissen sorgt dafür, dass das Erfahrungswissen im Betrieb bleibt –
> erfasst per Sprache auf der Baustelle, geprüft vom Meister, abrufbar in Sekunden.

---

## 💡 Die Idee

Erfahrungswissen im Handwerk steckt in Köpfen, nicht in Ordnern. Meisterwissen
macht daraus eine lebendige, durchsuchbare Wissensbank – **ohne dass jemand tippen muss**:

1. **Reinsprechen** 🎙️ – auf der Baustelle kurz erklären, wie man etwas macht
2. **Willi fragt nach** 🤖 – der Interview-Bot „Werkstatt-Willi" stellt gezielte
   Rückfragen („Was machen Anfänger hier falsch? Was ist dein Trick?")
3. **Meister gibt frei** ✅ – jeder Baustein wird geprüft, bevor er gilt
4. **Jeder kann fragen** 💬 – der Fragebot antwortet **nur aus geprüftem
   Betriebswissen** und nennt die Quelle. Er erfindet nichts.

## ✨ Funktionen

| Funktion | Beschreibung |
|---|---|
| 🎙️ **Sprach-Erfassung** | Direkt im Browser aufnehmen oder Datei hochladen, Whisper transkribiert (Deutsch) |
| 🤖 **Interview-Bot Willi** | Energiegeladener Kollege, der Lücken findet – per Sprache oder Text, Tempo wählbar (1×/1,5×/2×) |
| 🧭 **Automatische Zuordnung** | KI ordnet jede Aufnahme dem passenden Punkt im Rahmenplan (Ausbildungsverordnung) und der passenden Person zu |
| 📚 **Bibliothek** | Strukturierte Wissensbausteine: Situation, Schritte, Material, Werkzeug, Experten-Tipps, typische Fehler, Diagnose-Hinweise |
| ✅ **Meister-Freigabe** | Statusfluss draft → interviewed → reviewed → published; nichts gilt ohne Prüfung |
| 💬 **Fragebot (RAG)** | Antworten ausschließlich aus erfasstem Wissen, mit Quellenangabe – anhörbar per Sprachausgabe |
| 🧑‍🤝‍🧑 **Team-Avatare** | Jede Person wird zum fragbaren Avatar – antwortet nur aus dem eigenen Wissen, im eigenen Stil, mit eigener Stimme |
| 🔊 **„Willi erklärt"** | Pro Rubrik eine kurze gesprochene Zusammenfassung des gesammelten Wissens |
| 📷 **Fotos & Merkblätter** | Baustellenbilder und technische Datenblätter (PDF) direkt am Baustein |
| 🛟 **Aufnahme-Rettung** | Jede Aufnahme wird gespeichert, bevor transkribiert wird – scheitert die KI, geht nichts verloren |
| 🏢 **Büro & Betrieb** | Auch Betriebsabläufe (Angebote, Löhne, Mahnwesen …) werden als Wissen gesichert |

## 🛠️ Technik

- **Next.js 15** (App Router, TypeScript), Tailwind CSS – mobile-first, Deutsch
- **Supabase** (Postgres + Storage + pgvector)
- **OpenAI Whisper** (Spracherkennung) & **TTS** (Stimmen der Avatare & Willis Energie-Stimme)
- **Anthropic Claude** (Interview, Strukturierung, RAG-Antworten, Auto-Zuordnung)
- Grundregel im gesamten System: **Die KI erfindet niemals Fachwissen.**

## 🚀 Selbst starten

```bash
# 1. Abhängigkeiten
npm install

# 2. Schlüssel hinterlegen (eigene Keys nötig)
cp .env.local.example .env.local
#    → NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#      SUPABASE_SERVICE_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY eintragen

# 3. Datenbank anlegen (im Supabase SQL-Editor ausführen)
#    supabase/migrations/0001_init.sql
#    supabase/migrations/0002_team.sql

# 4. Demo-Wissen einspielen (optional, empfohlen)
npm run seed            # Basis-Demo
npm run seed:team       # 5 Personen-Avatare mit Wissen
npm run seed:pitch      # Thema „Durchschlagende Flecken" (4 Bausteine)
npm run seed:beispiele  # 3 weitere fachlich geprüfte Beispiele

# 5. Los geht's
npm run dev             # → http://localhost:3000
```

> **Hinweis zu den Demo-Inhalten:** Die Seed-Bausteine sind generierte, aber
> fachlich geprüfte Demo-Inhalte (erkennbar an „geprüft von Josef Schmid").
> Im echten Betrieb kommt jedes Wissen von den Mitarbeitern selbst.

## 🎬 Demo in 60 Sekunden

1. Startseite → **„Frag die Wissensbank"** → *„Warum schlagen die gelben Flecken immer wieder durch?"*
2. → Antwort mit Ursache → Diagnose → Lösung, inklusive Quellen. Auf 🔊 tippen zum Anhören.
3. **Team & Avatare** → *Sabine (Büro & Löhne)* → *„Wie rechne ich die Löhne ab?"* → Antwort in Ich-Form, mit ihrer Stimme.

Ausführliche Abläufe: [docs/DEMO-Szenarien.md](docs/DEMO-Szenarien.md)

## 📁 Projektstruktur (Auszug)

```
app/            Seiten & API-Routen (App Router)
  api/          transcribe · interview · frage · tts · team · rubrik/audio …
components/     WissensChat · VoiceRecorder · PersonPicker · SpeedControl …
lib/            categories (Rahmenplan) · classify (Auto-Zuordnung) · tts · team …
scripts/        Seed-Skripte (idempotent)
supabase/       SQL-Migrationen
docs/           Demo-Szenarien · Pitch-Material
```

---

**Schmid – Die Malerwerkstätte** · Meisterwissen · Hackathon 2026
*Damit kein Handgriff verloren geht.* 🖌️
