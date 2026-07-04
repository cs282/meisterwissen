import { createClient } from "@supabase/supabase-js";

/**
 * Supabase-Admin-Client (Service-Role-Key). NUR serverseitig verwenden –
 * umgeht Row Level Security. Wird u. a. für Whisper-/Claude-Pipelines und
 * das Schreiben von Wissensbausteinen benötigt.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
