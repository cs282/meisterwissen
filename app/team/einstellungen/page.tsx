import Link from "next/link";
import TeamSettings from "@/components/TeamSettings";

export const dynamic = "force-dynamic";

export default function TeamSettingsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-5">
      <header className="pt-2">
        <Link href="/team" className="text-sm text-neutral-500 underline">
          ← Team &amp; Avatare
        </Link>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">Personen einrichten</h1>
        <p className="mt-1 text-base text-neutral-600">
          Lege pro Person die <b>Stimme</b>, <b>Rolle</b> und das <b>Fachgebiet</b> fest.
          Das Fachgebiet nutzt die KI, um beim Aufnehmen die richtige Person vorzuschlagen.
        </p>
      </header>

      <TeamSettings />
    </main>
  );
}
