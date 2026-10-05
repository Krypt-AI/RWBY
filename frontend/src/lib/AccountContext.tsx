import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Account } from './types'
import { useNotice } from '../hooks/useNotice'
import { backend } from '../services/backend'

/** 'local': no accounts, the site runs in this browser. 'loading': checking for a saved session. */
export type AccountStatus = 'local' | 'loading' | 'signedOut' | 'signedIn'

type AccountContextValue = {
  /** True on the shared backend, where people sign in and see the same site. */
  isShared: boolean
  status: AccountStatus
  account: Account | null
  signIn: () => void
  signOut: () => void
  /** True when the visitor may take part. Otherwise asks them to sign in and returns false. */
  requireAccount: () => boolean
  /** The "sign in to join in" prompt, opened by requireAccount. */
  isPromptOpen: boolean
  openPrompt: () => void
  closePrompt: () => void
}

export const AccountContext = createContext<AccountContextValue | null>(null)

const sameAccount = (a: Account | null, b: Account | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.id === b.id &&
    a.name === b.name &&
    a.avatarUrl === b.avatarUrl &&
    a.isModerator === b.isModerator)

export function AccountProvider({ children }: { children: ReactNode }) {
  const service = backend.account
  const { report } = useNotice()
  const [account, setAccount] = useState<Account | null>(null)
  const [status, setStatus] = useState<AccountStatus>(service ? 'loading' : 'local')
  const [isPromptOpen, setPromptOpen] = useState(false)

  useEffect(() => {
    if (!service) return
    return service.watch(next => {
      // Token refreshes report the same account; keep the old object so nothing reloads.
      setAccount(current => (sameAccount(current, next) ? current : next))
      setStatus(next ? 'signedIn' : 'signedOut')
      if (next) setPromptOpen(false)
    })
  }, [service])

  // Pick up a new name or role (e.g. a fresh moderator) when the visitor comes back to the tab.
  useEffect(() => {
    if (!service) return
    const onVisible = () => {
      if (document.visibilityState === 'visible') void service.refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [service])

  const signIn = useCallback(() => {
    service?.signIn().catch(report)
  }, [service, report])

  const signOut = useCallback(() => {
    service?.signOut().catch(report)
  }, [service, report])

  const requireAccount = useCallback(() => {
    if (!service || account) return true
    setPromptOpen(true)
    return false
  }, [service, account])

  const openPrompt = useCallback(() => setPromptOpen(true), [])
  const closePrompt = useCallback(() => setPromptOpen(false), [])

  const value = useMemo<AccountContextValue>(
    () => ({
      isShared: Boolean(service),
      status,
      account,
      signIn,
      signOut,
      requireAccount,
      isPromptOpen,
      openPrompt,
      closePrompt,
    }),
    [service, status, account, signIn, signOut, requireAccount, isPromptOpen, openPrompt, closePrompt],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}
