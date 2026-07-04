"use client";

import { useEffect, useState } from "react";

type Person = { name: string; emoji: string; role: string };

const LS_KEY = "mw_person"; // zuletzt gewählte Person (pro Gerät merken)
export const AUTO = "AUTO";

/**
 * Wer nimmt gerade auf? Person antippen (wird gemerkt) ODER "Automatisch":
 * dann schlägt die KI nach dem Sprechen anhand des Inhalts die Person vor.
 */
export default function PersonPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [people, setPeople] = useState<Person[]>([]);
  const [freeMode, setFreeMode] = useState(false);
  const [free, setFree] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/team")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setPeople(d.people ?? []);
        // Zuletzt gewählte Person vorbelegen, falls noch nichts gesetzt.
        const last = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null;
        if (last && (d.people ?? []).some((p: Person) => p.name === last)) onChange(last);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(name: string) {
    setFreeMode(false);
    onChange(name);
    if (name !== AUTO && typeof window !== "undefined") window.localStorage.setItem(LS_KEY, name);
  }

  const isKnown = value === AUTO || people.some((p) => p.name === value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Chip active={value === AUTO} onClick={() => pick(AUTO)} disabled={disabled}>
          🤖 Automatisch
        </Chip>
        {people.map((p) => (
          <Chip key={p.name} active={value === p.name} onClick={() => pick(p.name)} disabled={disabled}>
            {p.emoji} {p.name}
          </Chip>
        ))}
        <Chip
          active={freeMode || (!isKnown && value !== AUTO)}
          onClick={() => {
            setFreeMode(true);
            setFree(!isKnown && value !== AUTO ? value : "");
          }}
          disabled={disabled}
        >
          ➕ Andere
        </Chip>
      </div>

      {freeMode && (
        <input
          value={free}
          onChange={(e) => {
            setFree(e.target.value);
            onChange(e.target.value.trim());
            if (e.target.value.trim() && typeof window !== "undefined")
              window.localStorage.setItem(LS_KEY, e.target.value.trim());
          }}
          placeholder="Name der Person…"
          disabled={disabled}
          className="min-h-[44px] rounded-lg border border-neutral-300 px-3 text-base"
        />
      )}

      <p className="text-xs text-neutral-500">
        {value === AUTO
          ? "Die KI schlägt nach dem Sprechen anhand des Inhalts die passende Person vor – du kannst sie im Baustein ändern."
          : `Wird ${value || "…"} zugeordnet.`}
      </p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium disabled:opacity-50 ${
        active ? "bg-neutral-900 text-white" : "border border-neutral-300 bg-white text-neutral-800 active:bg-neutral-100"
      }`}
    >
      {children}
    </button>
  );
}
