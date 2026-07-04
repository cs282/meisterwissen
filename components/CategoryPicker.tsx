"use client";

import { useState } from "react";
import { CATEGORY_GROUPS, CATEGORY_CODES, FREE_VALUE } from "@/lib/categories";

/**
 * Kategorie-Auswahl aus der Ausbildungsverordnung + Option „Freie Eingabe".
 * `value` ist entweder ein Standard-Code (z. B. "G7") oder ein frei getippter Text.
 */
export default function CategoryPicker({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  const startsFree = value !== "" && !CATEGORY_CODES.includes(value);
  const [free, setFree] = useState(startsFree);

  const selectValue = free ? FREE_VALUE : value;

  function handleSelect(v: string) {
    if (v === FREE_VALUE) {
      setFree(true);
      onChange("");
    } else {
      setFree(false);
      onChange(v);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        id={id}
        value={selectValue}
        onChange={(e) => handleSelect(e.target.value)}
        className="min-h-[48px] rounded-lg border border-neutral-300 bg-white p-3 text-base"
        required
      >
        <option value="" disabled>
          Bitte Rubrik wählen…
        </option>
        {CATEGORY_GROUPS.map((g) => (
          <optgroup key={g.key} label={g.label}>
            {g.items.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} – {c.label}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={FREE_VALUE}>✏️ Freie Eingabe – eigenes Thema</option>
      </select>

      {free && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Eigenes Thema / eigene Rubrik eingeben…"
          aria-label="Freie Kategorie"
          className="min-h-[48px] rounded-lg border border-neutral-300 p-3 text-base"
          required
        />
      )}
    </div>
  );
}
