import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Browser Supabase client for Google OAuth (anon key only — safe to expose). */
export const supabase: SupabaseClient | null =
  typeof url === 'string' &&
  url.length > 0 &&
  typeof anon === 'string' &&
  anon.length > 0
    ? createClient(url, anon, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export function isOAuthConfigured(): boolean {
  return supabase !== null
}
