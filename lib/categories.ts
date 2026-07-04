// Taxonomie = Ausbildungsberufsbild der Verordnung über die Berufsausbildung
// zum Maler und Lackierer / zur Malerin und Lackiererin (2021), § 4.
// EINZIGE Quelle der Wahrheit: Ober-Rubriken (Berufsbildpositionen) + Freie Eingabe.

export type Category = { code: string; label: string };
export type CategoryGroup = {
  key: string;
  label: string; // vollständige Überschrift
  short: string; // kurze Fassung für Filter-Chips / Kacheln
  items: Category[];
};

// Sonderwert für die Freie Eingabe im Dropdown.
export const FREE_VALUE = "FREI";

// Ober-Rubriken laut Verordnung – NUR hier definiert.
export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    key: "GRUND",
    label: "Grundlagen (fachrichtungsübergreifend)",
    short: "Grundlagen",
    items: [
      { code: "G1", label: "Kundenorientierte Arbeitsprozesse gestalten" },
      { code: "G2", label: "Arbeitsaufgaben planen, vorbereiten, organisieren" },
      { code: "G3", label: "Arbeitsplätze einrichten, sichern, räumen" },
      { code: "G4", label: "Werkzeuge, Geräte, Maschinen & Anlagen bedienen & instand halten" },
      { code: "G5", label: "Werk- & Hilfsstoffe be-/verarbeiten, Bauteile bearbeiten" },
      { code: "G6", label: "Untergründe prüfen, bewerten & vorbereiten" },
      { code: "G7", label: "Oberflächen herstellen, beschichten, bekleiden, gestalten & instand halten" },
      { code: "G8", label: "Putz-, Dämm- & Trockenbauarbeiten" },
      { code: "G9", label: "Qualitätssicherung & Übergabe an Kunden" },
    ],
  },
  {
    key: "GEST",
    label: "Fachrichtung: Gestaltung & Instandhaltung",
    short: "Gestaltung & Instandhaltung",
    items: [
      { code: "GI1", label: "Kundenorientierte Arbeitsprozesse & Planung" },
      { code: "GI2", label: "Konzepte für Raum- & Fassadengestaltung entwerfen & umsetzen" },
      { code: "GI3", label: "Oberflächen gestalten (Muster, Werkzeugstrukturen, Beschichtungsstoffe)" },
      { code: "GI4", label: "Wand-, Decken- & Bodenbeläge verlegen; Decken & Wände bekleiden" },
      { code: "GI5", label: "Beschriftungen & Kommunikationsmittel herstellen" },
      { code: "GI6", label: "Holz-, Bauten- & Brandschutz" },
      { code: "GI7", label: "Energieeffizienzmaßnahmen an Decken, Wänden & Böden" },
      { code: "GI8", label: "Qualitätssicherung & Übergabe" },
    ],
  },
  {
    key: "ENER",
    label: "Fachrichtung: Energieeffizienz- & Gestaltungstechnik",
    short: "Energieeffizienz",
    items: [
      { code: "EG1", label: "Kundenorientierte Arbeitsprozesse & Planung" },
      { code: "EG2", label: "Untergründe für Energieeffizienzmaßnahmen (innen & außen) prüfen & vorbereiten" },
      { code: "EG3", label: "Wärmedämm-Verbundsysteme (WDVS) an Außenflächen" },
      { code: "EG4", label: "Wärmedämmputze an Außenflächen" },
      { code: "EG5", label: "System- & Fertigelemente montieren (außen)" },
      { code: "EG6", label: "Energieeffizienzmaßnahmen an Innenflächen" },
      { code: "EG7", label: "Oberflächen von Fassaden & Räumen gestalten" },
      { code: "EG8", label: "Qualitätssicherung & Übergabe" },
    ],
  },
  {
    key: "KIRCH",
    label: "Fachrichtung: Kirchenmalerei & Denkmalpflege",
    short: "Kirchenmalerei",
    items: [
      { code: "KD1", label: "Kundenorientierte Arbeitsprozesse & Planung" },
      { code: "KD2", label: "Werk- & Beschichtungsstoffe nach historischen Rezepturen" },
      { code: "KD3", label: "Historische & gestalterische Arbeitstechniken" },
      { code: "KD4", label: "Instandsetzung im Rahmen der Denkmalpflege" },
      { code: "KD5", label: "Reproduktion & Rekonstruktion historischer Objekte" },
      { code: "KD6", label: "Qualitätssicherung & Übergabe" },
    ],
  },
  {
    key: "BAUT",
    label: "Fachrichtung: Bauten- & Korrosionsschutz",
    short: "Bauten & Korrosion",
    items: [
      { code: "BK1", label: "Kundenorientierte Arbeitsprozesse & Planung" },
      { code: "BK2", label: "Baustellen einrichten; Werkzeuge/Geräte/Maschinen bedienen & instand halten" },
      { code: "BK3", label: "Instandhaltung an/in Bauwerken & Anlagen" },
      { code: "BK4", label: "Korrosionsschutz an Metallen" },
      { code: "BK5", label: "Schutz & Instandsetzung von Beton-Bauwerken/-teilen" },
      { code: "BK6", label: "Sicherheitskennzeichnungen & Straßenmarkierungen" },
      { code: "BK7", label: "Qualitätssicherung & Übergabe" },
    ],
  },
  {
    key: "AUSB",
    label: "Fachrichtung: Ausbautechnik & Oberflächengestaltung",
    short: "Ausbautechnik",
    items: [
      { code: "AO1", label: "Kundenorientierte Arbeitsprozesse & Planung" },
      { code: "AO2", label: "Ausbau- & Montagearbeiten" },
      { code: "AO3", label: "Systemelemente & Fertigteile montieren & gestalten (inkl. Unterkonstruktionen)" },
      { code: "AO4", label: "Dämm- & Isolierstoffe verarbeiten" },
      { code: "AO5", label: "Untergründe & Oberflächen vorbereiten & herstellen (v. a. Putz)" },
      { code: "AO6", label: "Raum- & Fassadengestaltung" },
      { code: "AO7", label: "Qualitätssicherung & Übergabe" },
    ],
  },
  {
    key: "INTEG",
    label: "Übergreifend: Betrieb, Sicherheit, Umwelt, Digitales",
    short: "Betrieb & Sicherheit",
    items: [
      { code: "IN1", label: "Organisation, Berufsbildung, Arbeits- & Tarifrecht" },
      { code: "IN2", label: "Sicherheit & Gesundheit bei der Arbeit" },
      { code: "IN3", label: "Umweltschutz & Nachhaltigkeit" },
      { code: "IN4", label: "Digitalisierte Arbeitswelt" },
    ],
  },
  {
    // Nicht aus der Ausbildungsverordnung, sondern betriebseigenes Ablauf-Wissen:
    // Büro & Organisation (Angebote, Rechnungen, Bestellung, Kunden, Personal …).
    key: "BUERO",
    label: "Büro & Betriebsabläufe",
    short: "Büro & Betrieb",
    items: [
      { code: "BO1", label: "Angebote & Kalkulation" },
      { code: "BO2", label: "Auftragsabwicklung & Terminplanung" },
      { code: "BO3", label: "Rechnungen, Mahnwesen & Buchhaltung" },
      { code: "BO4", label: "Materialbestellung & Lieferanten" },
      { code: "BO5", label: "Kundenkommunikation & Telefon" },
      { code: "BO6", label: "Personal, Ausbildung & Team" },
      { code: "BO7", label: "Reklamationen & Gewährleistung" },
    ],
  },
];

// Bucket für freie/unbekannte Kategorien (Ausbruch aus dem Raster).
export const FREE_GROUP = { key: "SONST", label: "Freie Eingabe / Sonstiges", short: "Frei / Sonstiges" };

export const ALL_CATEGORIES: Category[] = CATEGORY_GROUPS.flatMap((g) => g.items);
export const CATEGORY_CODES: string[] = ALL_CATEGORIES.map((c) => c.code);

// code -> Gruppe (für Gruppierung & Filter), abgeleitet – nicht doppelt gepflegt.
const CODE_TO_GROUP: Record<string, string> = {};
for (const g of CATEGORY_GROUPS) for (const it of g.items) CODE_TO_GROUP[it.code] = g.key;

/** Gruppen-Key für einen Kategorie-Code; freie/unbekannte -> "SONST". */
export function groupKeyOf(code: string | null | undefined): string {
  return (code && CODE_TO_GROUP[code]) || FREE_GROUP.key;
}

/** Alle Gruppen inkl. Sonstiges-Bucket am Ende – für Anzeige & Filter. */
export const DISPLAY_GROUPS = [
  ...CATEGORY_GROUPS.map((g) => ({ key: g.key, label: g.label, short: g.short })),
  FREE_GROUP,
];

export function isGroupKey(key: string | null | undefined): boolean {
  return !!key && DISPLAY_GROUPS.some((g) => g.key === key.toUpperCase());
}

export function groupLabelForKey(key: string): string {
  return DISPLAY_GROUPS.find((g) => g.key === key)?.label ?? key;
}

/** Ist der Wert eine gültige Kategorie (Standard-Code ODER nicht-leere Freie Eingabe)? */
export function isValidCategory(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 120;
}

/** "G7 – Oberflächen …" für Standard-Codes; bei Freier Eingabe der Text selbst. */
export function categoryLabel(code: string | null | undefined): string {
  if (!code) return "—";
  const found = ALL_CATEGORIES.find((c) => c.code === code);
  return found ? `${found.code} – ${found.label}` : code;
}
