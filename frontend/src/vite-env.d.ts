/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOD_PASSCODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
