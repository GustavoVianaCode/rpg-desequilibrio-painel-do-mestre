import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Cria o client com a Service Role Key para ignorar RLS e gerenciar banco pelo backend
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
