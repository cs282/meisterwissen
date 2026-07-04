-- Meisterwissen – Baustein 1: Grundschema
-- KI-Wissensklon Malerhandwerk (Modul Innenanstrich)
-- Schmid – Die Malerwerkstätte GmbH

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
-- pgvector für RAG-Embeddings, pgcrypto für gen_random_uuid()
create extension if not exists vector;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tabelle: knowledge_units
-- Strukturierte Wissensbausteine (das zentrale Erfahrungswissen).
-- Statusflow: draft -> interviewed -> reviewed -> published
-- ---------------------------------------------------------------------------
create table if not exists knowledge_units (
  id              uuid primary key default gen_random_uuid(),
  category        text,                       -- Taxonomie-Code, z. B. "A1", "B6", "E2"
  title           text,
  status          text not null default 'draft',
  situation       text,                       -- Ausgangslage / Untergrund-Situation
  steps           jsonb,                      -- geordnete Arbeitsschritte
  materials       jsonb,                      -- Materialien inkl. Produktdaten
  tools           jsonb,                      -- Werkzeuge / Geräte
  expert_tips     text[],                     -- Meister-Tipps
  common_mistakes text[],                     -- typische Fehler
  diagnosis_hints text[],                     -- Diagnose-Hinweise (v. a. Kategorie E)
  cross_refs      uuid[],                     -- Querverweise auf andere knowledge_units
  embedding       vector(1536),               -- RAG-Embedding
  created_by      text,
  reviewed_by     text,                       -- Meister-Freigabe
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tabelle: recordings
-- Baustellen-Aufnahmen (Audio/Video) inkl. Transkript.
-- ---------------------------------------------------------------------------
create table if not exists recordings (
  id                uuid primary key default gen_random_uuid(),
  knowledge_unit_id uuid references knowledge_units(id),
  type              text,                     -- z. B. "audio", "video"
  file_url          text,                     -- Pfad im Storage-Bucket "recordings"
  transcript        text,                     -- Whisper-Transkript (deutsch)
  duration_sec      int,
  clip_start_sec    int,
  clip_end_sec      int,
  recorded_by       text,
  recorded_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tabelle: interviews
-- Interview-Bot "Werkstatt-Willi": Gesprächsverlauf + extrahierte Felder.
-- ---------------------------------------------------------------------------
create table if not exists interviews (
  id                uuid primary key default gen_random_uuid(),
  knowledge_unit_id uuid references knowledge_units(id),
  transcript        jsonb,                    -- Dialogverlauf
  extracted_fields  jsonb,                    -- vom Bot strukturierte Felder
  open_gaps         text[],                   -- offene Wissenslücken / Rückfragen
  completed_at      timestamptz
);

-- ---------------------------------------------------------------------------
-- Tabelle: technical_data
-- Technische Datenblätter / Herstellerangaben zu Materialien.
-- ---------------------------------------------------------------------------
create table if not exists technical_data (
  id                uuid primary key default gen_random_uuid(),
  knowledge_unit_id uuid references knowledge_units(id),
  source            text,                     -- Quelle, z. B. "Brillux TDS"
  data              jsonb,                    -- strukturierte technische Daten
  file_url          text                      -- Original-Datenblatt im Storage
);

-- ---------------------------------------------------------------------------
-- Storage: Bucket "recordings" für Baustellen-Aufnahmen
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;
