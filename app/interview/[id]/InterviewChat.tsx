"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hasBaustein } from "@/lib/baustein";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function InterviewChat({
  id,
  title,
  categoryText,
  status,
}: {
  id: string;
  title: string;
  categoryText: string;
  status: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState("");
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedInfo, setSavedInfo] = useState<string | null>(null);
  const lastSavedRef = useRef<string>("");
  const startedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Willi-Antwort streamen. `history` ist der sichtbare Dialog inkl. neuer User-Nachricht.
  async function stream(history: ChatMessage[]) {
    setBusy(true);
    setError(null);
    setStreaming("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, messages: history }),
      });

      if (!res.ok || !res.body) {
        let msg = "Willi antwortet gerade nicht.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          /* Stream-Antwort ohne JSON */
        }
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }

      const finalMsgs: ChatMessage[] = [...history, { role: "assistant", content: acc }];
      setMessages(finalMsgs);
      setStreaming("");
      autoSaveIfReady(finalMsgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setBusy(false);
    }
  }

  // Interview automatisch starten (Willis Zusammenfassung + erste Frage)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    stream([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    stream(history);
  }

  // Sobald Willi einen fertigen Baustein ausgibt: automatisch in die Wissensbank speichern.
  async function autoSaveIfReady(msgs: ChatMessage[]) {
    const last = [...msgs].reverse().find((m) => m.role === "assistant");
    if (!last || !hasBaustein(last.content)) return;
    if (last.content === lastSavedRef.current) return; // schon gespeichert
    lastSavedRef.current = last.content;
    try {
      const res = await fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, messages: msgs }),
      });
      const data = await res.json();
      setSavedInfo(
        res.ok
          ? "✅ Baustein automatisch in der Wissensbank gespeichert."
          : `⚠️ Konnte nicht automatisch speichern: ${data?.error ?? "unbekannt"}`,
      );
    } catch {
      setSavedInfo("⚠️ Konnte nicht automatisch speichern (Verbindung).");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-4">
      {/* Kopf */}
      <header className="border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            Status: {status}
          </span>
        </div>
        <h1 className="mt-2 text-lg font-bold">Interview mit Willi</h1>
        <p className="text-sm text-neutral-500">{title}</p>
        <p className="text-xs text-neutral-500">{categoryText}</p>
      </header>

      {/* Verlauf */}
      <div className="flex flex-1 flex-col gap-3 py-4">
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.content} />
        ))}
        {busy && streaming && <Bubble role="assistant" text={streaming} />}
        {busy && !streaming && (
          <div className="mr-auto rounded-2xl bg-neutral-100 px-4 py-2 text-sm text-neutral-500">
            Willi denkt nach…
          </div>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Automatisch gespeichert */}
      {savedInfo && (
        <div className="mb-3 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-800">{savedInfo}</p>
          <button
            onClick={() => router.push("/bibliothek")}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            📚 In der Bibliothek ansehen
          </button>
        </div>
      )}

      {/* Eingabe */}
      <form onSubmit={handleSend} className="sticky bottom-0 flex gap-2 bg-white pb-2 pt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? "Bitte warten…" : "Antwort an Willi…"}
          disabled={busy}
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm disabled:bg-neutral-50"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="btn-ink px-5 py-3 text-sm disabled:opacity-40"
        >
          Senden
        </button>
      </form>
    </main>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <div
      className={`${
        isUser
          ? "ml-auto bg-neutral-900 text-white"
          : "mr-auto bg-neutral-100 text-neutral-900"
      } max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed`}
    >
      {text}
    </div>
  );
}
