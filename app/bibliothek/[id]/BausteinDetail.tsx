"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { categoryLabel } from "@/lib/categories";
import { statusMeta } from "@/lib/status";
import CategoryPicker from "@/components/CategoryPicker";
import PhotoSection from "@/components/PhotoSection";
import TechnicalSection from "@/components/TechnicalSection";

type Step = { nr?: number; anweisung?: string; dauer_min?: number | null; warnung?: string | null };
type Material = { produkt?: string; hersteller?: string; verbrauch_pro_m2?: string; gebinde?: string };
type Tool = { werkzeug?: string; spezifikation?: string };

type Unit = {
  id: string;
  title: string | null;
  category: string | null;
  status: string;
  situation: string | null;
  steps: Step[] | null;
  materials: Material[] | null;
  tools: Tool[] | null;
  expert_tips: string[] | null;
  common_mistakes: string[] | null;
  diagnosis_hints: string[] | null;
  reviewed_by: string | null;
  created_by: string | null;
};

type Technical = { id: string; source: string; filename: string; url: string | null };
type Photo = { id: string; url: string | null };

export default function BausteinDetail({
  unit,
  openGaps,
  recordingType,
  recordingUrl,
  technical,
  photos,
}: {
  unit: Unit;
  openGaps: string[];
  recordingType: string | null;
  recordingUrl: string | null;
  technical: Technical[];
  photos: Photo[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  // Editierbare Felder
  const [title, setTitle] = useState(unit.title ?? "");
  const [category, setCategory] = useState(unit.category ?? "");
  const [situation, setSituation] = useState(unit.situation ?? "");
  const [steps, setSteps] = useState<Step[]>(unit.steps ?? []);
  const [materials, setMaterials] = useState<Material[]>(unit.materials ?? []);
  const [tools, setTools] = useState<Tool[]>(unit.tools ?? []);
  const [expertTips, setExpertTips] = useState((unit.expert_tips ?? []).join("\n"));
  const [mistakes, setMistakes] = useState((unit.common_mistakes ?? []).join("\n"));
  const [diagnosis, setDiagnosis] = useState((unit.diagnosis_hints ?? []).join("\n"));
  const [reviewer, setReviewer] = useState(unit.reviewed_by ?? "");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s = statusMeta(unit.status);
  const lines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);

  async function submit(action: "save" | "publish") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/knowledge/${unit.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewerName: reviewer,
          fields: {
            title,
            category,
            situation,
            steps,
            materials,
            tools,
            expert_tips: lines(expertTips),
            common_mistakes: lines(mistakes),
            diagnosis_hints: lines(diagnosis),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Speichern fehlgeschlagen.");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-5">
      {/* Kopf */}
      <header className="pt-2">
        <Link href="/bibliothek" className="text-sm text-neutral-500 underline">
          ← Bibliothek
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.badge}`}>
            {s.label}
          </span>
          {unit.reviewed_by && (
            <span className="text-xs text-neutral-500">
              geprüft von {unit.reviewed_by}
            </span>
          )}
        </div>
        {!editing ? (
          <>
            <h1 className="mt-2 text-2xl font-bold">{unit.title || "Ohne Titel"}</h1>
            <p className="mt-1 text-sm text-neutral-500">{categoryLabel(unit.category)}</p>
          </>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            <Field label="Titel">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
              />
            </Field>
            <Field label="Kategorie">
              <CategoryPicker value={category} onChange={setCategory} />
            </Field>
          </div>
        )}
      </header>

      {/* Mit Willi sprechen */}
      {!editing && (
        <Link
          href={`/gespraech/${unit.id}`}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-base font-semibold text-white active:bg-blue-800"
        >
          🎧 Mit Willi zu diesem Thema sprechen
        </Link>
      )}

      {/* Aufnahme-Player */}
      {recordingUrl && (
        <Section title="Original-Aufnahme">
          {recordingType === "video" ? (
            <video controls src={recordingUrl} className="w-full rounded-lg bg-black" />
          ) : (
            <audio controls src={recordingUrl} className="w-full" />
          )}
        </Section>
      )}

      {/* Baustellenbilder */}
      <PhotoSection unitId={unit.id} items={photos} />

      {/* Situation */}
      <Section title="Situation">
        {editing ? (
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
        ) : (
          <p className="text-sm leading-relaxed text-neutral-800">
            {unit.situation || "—"}
          </p>
        )}
      </Section>

      {/* Arbeitsschritte */}
      <Section title="Arbeitsschritte">
        {editing ? (
          <RowEditor<Step>
            rows={steps}
            setRows={setSteps}
            empty={{ nr: (steps.length || 0) + 1, anweisung: "", dauer_min: null, warnung: "" }}
            addLabel="Schritt hinzufügen"
            render={(row, update) => (
              <div className="flex flex-col gap-2">
                <input
                  placeholder="Anweisung"
                  value={row.anweisung ?? ""}
                  onChange={(e) => update({ anweisung: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    placeholder="Nr."
                    inputMode="numeric"
                    value={row.nr ?? ""}
                    onChange={(e) => update({ nr: Number(e.target.value) || undefined })}
                    className="w-16 rounded-lg border border-neutral-300 p-2 text-sm"
                  />
                  <input
                    placeholder="Dauer (min)"
                    inputMode="numeric"
                    value={row.dauer_min ?? ""}
                    onChange={(e) =>
                      update({ dauer_min: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    className="flex-1 rounded-lg border border-neutral-300 p-2 text-sm"
                  />
                </div>
                <input
                  placeholder="Warnung (optional)"
                  value={row.warnung ?? ""}
                  onChange={(e) => update({ warnung: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
                />
              </div>
            )}
          />
        ) : (steps.length ?? 0) === 0 ? (
          <p className="text-sm text-neutral-500">—</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {steps.map((st, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                  {st.nr ?? i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-neutral-800">{st.anweisung}</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-neutral-500">
                    {st.dauer_min != null && <span>⏱ {st.dauer_min} min</span>}
                  </div>
                  {st.warnung && (
                    <p className="mt-1 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
                      ⚠ {st.warnung}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* Material */}
      <Section title="Material">
        {editing ? (
          <RowEditor<Material>
            rows={materials}
            setRows={setMaterials}
            empty={{ produkt: "", hersteller: "", verbrauch_pro_m2: "", gebinde: "" }}
            addLabel="Material hinzufügen"
            render={(row, update) => (
              <div className="flex flex-col gap-2">
                <input placeholder="Produkt" value={row.produkt ?? ""} onChange={(e) => update({ produkt: e.target.value })} className="w-full rounded-lg border border-neutral-300 p-2 text-sm" />
                <input placeholder="Hersteller" value={row.hersteller ?? ""} onChange={(e) => update({ hersteller: e.target.value })} className="w-full rounded-lg border border-neutral-300 p-2 text-sm" />
                <div className="flex gap-2">
                  <input placeholder="Verbrauch pro m²" value={row.verbrauch_pro_m2 ?? ""} onChange={(e) => update({ verbrauch_pro_m2: e.target.value })} className="flex-1 rounded-lg border border-neutral-300 p-2 text-sm" />
                  <input placeholder="Gebinde" value={row.gebinde ?? ""} onChange={(e) => update({ gebinde: e.target.value })} className="w-28 rounded-lg border border-neutral-300 p-2 text-sm" />
                </div>
              </div>
            )}
          />
        ) : (materials.length ?? 0) === 0 ? (
          <p className="text-sm text-neutral-500">—</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs text-neutral-500">
                <tr>
                  <th className="p-2 font-medium">Produkt</th>
                  <th className="p-2 font-medium">Verbrauch/m²</th>
                  <th className="p-2 font-medium">Gebinde</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m, i) => (
                  <tr key={i} className="border-t border-neutral-100">
                    <td className="p-2">
                      <div className="font-medium text-neutral-800">{m.produkt}</div>
                      {m.hersteller && <div className="text-xs text-neutral-500">{m.hersteller}</div>}
                    </td>
                    <td className="p-2 text-neutral-700">{m.verbrauch_pro_m2 || "—"}</td>
                    <td className="p-2 text-neutral-700">{m.gebinde || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Werkzeug */}
      <Section title="Werkzeug">
        {editing ? (
          <RowEditor<Tool>
            rows={tools}
            setRows={setTools}
            empty={{ werkzeug: "", spezifikation: "" }}
            addLabel="Werkzeug hinzufügen"
            render={(row, update) => (
              <div className="flex gap-2">
                <input placeholder="Werkzeug" value={row.werkzeug ?? ""} onChange={(e) => update({ werkzeug: e.target.value })} className="flex-1 rounded-lg border border-neutral-300 p-2 text-sm" />
                <input placeholder="Spezifikation" value={row.spezifikation ?? ""} onChange={(e) => update({ spezifikation: e.target.value })} className="flex-1 rounded-lg border border-neutral-300 p-2 text-sm" />
              </div>
            )}
          />
        ) : (tools.length ?? 0) === 0 ? (
          <p className="text-sm text-neutral-500">—</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {tools.map((t, i) => (
              <li key={i} className="text-sm text-neutral-800">
                <span className="font-medium">{t.werkzeug}</span>
                {t.spezifikation && <span className="text-neutral-500"> · {t.spezifikation}</span>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Experten-Tipps */}
      <Section title="Experten-Tipps">
        {editing ? (
          <TextareaList value={expertTips} onChange={setExpertTips} />
        ) : (unit.expert_tips ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">—</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(unit.expert_tips ?? []).map((tip, i) => (
              <li key={i} className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
                💡 {tip}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Typische Fehler */}
      <Section title="Typische Fehler">
        {editing ? (
          <TextareaList value={mistakes} onChange={setMistakes} />
        ) : (unit.common_mistakes ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">—</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {(unit.common_mistakes ?? []).map((m, i) => (
              <li key={i} className="text-sm text-neutral-800">✗ {m}</li>
            ))}
          </ul>
        )}
      </Section>

      {/* Diagnose-Hinweise */}
      <Section title="Diagnose-Hinweise">
        {editing ? (
          <TextareaList value={diagnosis} onChange={setDiagnosis} />
        ) : (unit.diagnosis_hints ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">—</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {(unit.diagnosis_hints ?? []).map((d, i) => (
              <li key={i} className="text-sm text-neutral-800">🔍 {d}</li>
            ))}
          </ul>
        )}
      </Section>

      {/* Offene Lücken */}
      {openGaps.length > 0 && (
        <Section title="Offene Lücken">
          <ul className="flex flex-col gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
            {openGaps.map((g, i) => (
              <li key={i} className="text-sm text-amber-900">⚠ {g}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Technische Datenblätter */}
      <TechnicalSection unitId={unit.id} items={technical} />

      {/* Fehler */}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* Meister-Review-Aktionen */}
      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-neutral-200 bg-white py-3">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="rounded-xl bg-neutral-900 px-4 py-3.5 text-base font-semibold text-white"
          >
            Meister-Review starten
          </button>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Name des Prüfers</label>
              <input
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                placeholder="z. B. Josef Schmid"
                className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => submit("save")}
                disabled={busy}
                className="flex-1 rounded-xl border border-neutral-300 px-4 py-3.5 text-sm font-semibold text-neutral-800 disabled:opacity-50"
              >
                {busy ? "…" : "Speichern"}
              </button>
              <button
                onClick={() => submit("publish")}
                disabled={busy}
                className="flex-1 rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? "…" : "Freigeben"}
              </button>
            </div>
            <button
              onClick={() => setEditing(false)}
              disabled={busy}
              className="text-center text-sm text-neutral-500 underline"
            >
              Abbrechen
            </button>
          </>
        )}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Hilfskomponenten                                                    */
/* ------------------------------------------------------------------ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-500">{label}</label>
      {children}
    </div>
  );
}

function TextareaList({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
      />
      <p className="text-xs text-neutral-500">Ein Eintrag pro Zeile.</p>
    </>
  );
}

function RowEditor<T>({
  rows,
  setRows,
  empty,
  addLabel,
  render,
}: {
  rows: T[];
  setRows: (r: T[]) => void;
  empty: T;
  addLabel: string;
  render: (row: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 p-3">
          {render(row, (patch) => {
            const next = [...rows];
            next[i] = { ...row, ...patch };
            setRows(next);
          })}
          <button
            onClick={() => setRows(rows.filter((_, j) => j !== i))}
            className="mt-2 text-xs text-red-600 underline"
          >
            Entfernen
          </button>
        </div>
      ))}
      <button
        onClick={() => setRows([...rows, { ...empty }])}
        className="rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-600"
      >
        + {addLabel}
      </button>
    </div>
  );
}

