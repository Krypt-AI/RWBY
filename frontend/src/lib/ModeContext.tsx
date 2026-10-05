import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Mode } from './types'
import { useAccount } from '../hooks/useAccount'
import { load, save } from '../services/storage'

/**
 * Local demo only. Anything shipped to the browser is readable, so this keeps casual
 * visitors out of the controls but is NOT security. On the shared backend, moderator
 * access comes from the account's role and the server checks it on every change.
 */
const PASSCODE = import.meta.env.VITE_MOD_PASSCODE || 'beacon'

type ModeContextValue = {
  mode: Mode
  isModerator: boolean
  /** Whether this visitor can switch to moderator mode at all. */
  canModerate: boolean
  /** Local demo: switching needs the passcode. Shared backend: the account role is enough. */
  needsPasscode: boolean
  /** Returns false when the passcode is wrong or the account isn't a moderator. */
  enterModerator: (passcode?: string) => boolean
  exitModerator: () => void
}

export const ModeContext = createContext<ModeContextValue | null>(null)

export function ModeProvider({ children }: { children: ReactNode }) {
  const { isShared, account } = useAccount()
  // Session storage: each tab picks its own mode, so a moderator tab and a
  // user tab can sit side by side and watch changes sync between them.
  const [chosen, setChosen] = useState<Mode>(() => load<Mode>('mode', () => 'user', 'session'))
  const canModerate = isShared ? Boolean(account?.isModerator) : true

  const changeMode = useCallback((next: Mode) => {
    setChosen(next)
    save('mode', next, 'session')
  }, [])

  const value = useMemo<ModeContextValue>(() => {
    const isModerator = chosen === 'moderator' && canModerate
    return {
      mode: isModerator ? 'moderator' : 'user',
      isModerator,
      canModerate,
      needsPasscode: !isShared,
      enterModerator: (passcode = '') => {
        const allowed = isShared ? canModerate : passcode.trim() === PASSCODE
        if (allowed) changeMode('moderator')
        return allowed
      },
      exitModerator: () => changeMode('user'),
    }
  }, [chosen, canModerate, isShared, changeMode])

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}
