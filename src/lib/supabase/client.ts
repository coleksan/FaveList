import { createBrowserClient } from "@supabase/ssr";

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) return url;
  // Allow build-time prerendering to pass without real values
  if (typeof window === "undefined") return "https://placeholder.supabase.co";
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL. Set it in your Vercel environment variables."
  );
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (key) return key;
  if (typeof window === "undefined") return "placeholder-key";
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it in your Vercel environment variables."
  );
}

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
