import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import type { SiteState } from './types'
import { siteReducer, type SiteAction } from './siteReducer'
import { ModeContext } from './ModeContext'
import { useAccount } from '../hooks/useAccount'
import { useNotice } from '../hooks/useNotice'
import { backend, type SiteStatus } from '../services/backend'

/**
 * Actions any signed-in visitor may perform. Everything else is moderator-only.
 * The UI only offers 'lfg/remove' on the viewer's own posts, and room edits to room members;
 * on the shared backend the server enforces both.
 */
type ViewerAction = Extract<
  SiteAction,
  {
    type:
      | 'chat/send'
      | 'poll/vote'
      | 'lfg/post'
      | 'lfg/join'
      | 'lfg/remove'
      | 'track/add'
      | 'track/like'
      | 'room/join'
      | 'room/leave'
      | 'room/setStart'
      | 'room/pickEnemy'
      | 'room/unpickEnemy'
      | 'room/clearPicks'
  }
>

type SiteContextValue = {
  state: SiteState
  /** 'ready' once the data has loaded. Always ready in the local demo. */
  status: SiteStatus
  /** Returns false when the visitor has to sign in first (they are asked to). */
  dispatch: (action: ViewerAction) => boolean
  /** No-op outside moderator mode. */
  moderate: (action: SiteAction) => void
}

export const SiteContext = createContext<SiteContextValue | null>(null)

/**
 * The community data. Every change applies right away (optimistically), then goes to the
 * backend, which confirms it or, if it refuses, reloads the data and shows why.
 */
export function SiteProvider({ children }: { children: ReactNode }) {
  const store = backend.site
  const [state, apply] = useReducer(siteReducer, undefined, store.initialState)
  const [status, setStatus] = useState<SiteStatus>(backend.kind === 'shared' ? 'loading' : 'ready')
  const isModerator = useContext(ModeContext)?.isModerator ?? false
  const { requireAccount } = useAccount()
  const { report } = useNotice()

  useEffect(() => store.connect({ update: update => apply({ type: 'site/update', update }), setStatus }), [store])
  useEffect(() => store.persist?.(state), [store, state])

  const value = useMemo<SiteContextValue>(() => {
    const run = (action: SiteAction) => {
      apply(action)
      store.send(action).catch(report)
    }
    return {
      state,
      status,
      dispatch: action => {
        if (!requireAccount()) return false
        run(action)
        return true
      },
      moderate: action => {
        if (isModerator) run(action)
      },
    }
  }, [store, state, status, isModerator, requireAccount, report])

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}
