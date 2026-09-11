import { createClient } from "@supabase/supabase-js";

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    envUrl &&
    envAnonKey &&
    !envUrl.includes("your-project-id") &&
    envUrl.startsWith("http") &&
    envAnonKey.length > 20
  );
};

// Fallback values prevent createClient from throwing an error during startup if .env is missing
const supabaseUrl = envUrl && envUrl.startsWith("http") ? envUrl : "https://placeholder-paimana.supabase.co";
const supabaseAnonKey = envAnonKey || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
