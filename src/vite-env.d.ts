/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Public varsity calculator catalogue year (e.g. "2027"). Defaults to 2026 if unset. */
  readonly VITE_VARSITY_CATALOGUE_YEAR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
