/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Local demo only: the moderator passcode. */
  readonly VITE_MOD_PASSCODE?: string
  /** Shared backend: set both to run on Supabase instead of this browser's storage. */
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
