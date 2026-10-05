import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Mode } from './types'
import { load, save } from '../services/storage'

/**
 * Demo-only gate. Anything shipped to the browser is readable, so this keeps
 * casual visitors out of the controls but is NOT security. Real moderator
 * access needs server-side auth (e.g. Supabase roles + row-level security).
 */
const PASSCODE = import.meta.env.VITE_MOD_PASSCODE || 'beacon'

type ModeContextValue = {
  mode: Mode
  isModerator: boolean
  /** Returns false when the passcode is wrong. */
  enterModerator: (passcode: string) => boolean
  exitModerator: () => void
}

export const ModeContext = createContext<ModeContextValue | null>(null)

export function ModeProvider({ children }: { children: ReactNode }) {
  // Session storage: each tab picks its own mode, so a moderator tab and a
  // user tab can sit side by side and watch changes sync between them.
  const [mode, setMode] = useState<Mode>(() => load<Mode>('mode', () => 'user', 'session'))

  const changeMode = useCallback((next: Mode) => {
    setMode(next)
    save('mode', next, 'session')
  }, [])

  const value = useMemo<ModeContextValue>(
    () => ({
      mode,
      isModerator: mode === 'moderator',
      enterModerator: passcode => {
        if (passcode.trim() !== PASSCODE) return false
        changeMode('moderator')
        return true
      },
      exitModerator: () => changeMode('user'),
    }),
    [mode, changeMode],
  )

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}
