import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { categoryLabel } from "@/lib/categories";
import InterviewChat from "./InterviewChat";

export const dynamic = "force-dynamic";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: ku } = await supabase
    .from("knowledge_units")
    .select("id, title, category, status")
    .eq("id", id)
    .single();

  if (!ku) notFound();

  return (
    <InterviewChat
      id={ku.id}
      title={ku.title ?? "Ohne Titel"}
      categoryText={categoryLabel(ku.category)}
      status={ku.status}
    />
  );
}
