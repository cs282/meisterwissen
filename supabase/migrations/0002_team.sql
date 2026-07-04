-- Meisterwissen – Baustein: Team & Avatare
-- Einstellungen pro Person: Stimme, Rolle, Fachgebiet (für KI-Zuordnung), Emoji.
-- Verknüpft über den Namen mit knowledge_units.created_by / recordings.recorded_by.

create table if not exists team_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,      -- = created_by der Bausteine
  role        text default '',           -- Anzeige, z. B. "Bauleiter & Geschäftsführer"
  expertise   text default '',           -- Freitext: Themen der Person (für KI-Vorschlag)
  voice       text default 'onyx',       -- OpenAI-TTS-Stimme
  emoji       text default '👤',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
