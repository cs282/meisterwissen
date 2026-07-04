// Statusflow: draft -> interviewed -> reviewed -> published
// Jeder Status wird über Symbol UND Text UND Farbe unterschieden (nicht nur Farbe).

export type StatusMeta = { label: string; badge: string; icon: string };

export const STATUS_META: Record<string, StatusMeta> = {
  draft: { label: "Entwurf", icon: "✏️", badge: "bg-neutral-200 text-neutral-800" },
  interviewed: { label: "Interviewt", icon: "💬", badge: "bg-blue-100 text-blue-900" },
  reviewed: { label: "Geprüft", icon: "🔍", badge: "bg-amber-100 text-amber-900" },
  published: { label: "Veröffentlicht", icon: "✓", badge: "bg-emerald-100 text-emerald-900" },
};

export function statusMeta(status: string | null | undefined): StatusMeta {
  return (
    (status && STATUS_META[status]) || {
      label: status || "—",
      icon: "•",
      badge: "bg-neutral-200 text-neutral-800",
    }
  );
}
