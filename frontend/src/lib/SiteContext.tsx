import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { SiteState } from './types'
import { siteReducer, type SiteAction } from './siteReducer'
import { createSeedState } from './seed'
import { ModeContext } from './ModeContext'
import { load, save, subscribe } from '../services/storage'

/** v2 added game/music polls, the LFG board and the music queue. */
const STORAGE_KEY = 'site.v2'

/**
 * Actions any visitor may perform. Everything else is moderator-only.
 * The UI only offers 'lfg/remove' on the viewer's own posts.
 */
export type ViewerAction = Extract<
  SiteAction,
  { type: 'chat/send' | 'poll/vote' | 'lfg/post' | 'lfg/join' | 'lfg/remove' | 'track/add' | 'track/like' }
>

type SiteContextValue = {
  state: SiteState
  dispatch: (action: ViewerAction) => void
  /** No-op outside moderator mode. */
  moderate: (action: SiteAction) => void
}

export const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(siteReducer, undefined, () => load(STORAGE_KEY, createSeedState))
  const isModerator = useContext(ModeContext)?.isModerator ?? false

  useEffect(() => {
    save(STORAGE_KEY, state)
  }, [state])
  useEffect(() => subscribe<SiteState>(STORAGE_KEY, next => rawDispatch({ type: 'site/hydrate', state: next })), [])

  const value = useMemo<SiteContextValue>(
    () => ({
      state,
      dispatch: rawDispatch,
      moderate: action => {
        if (isModerator) rawDispatch(action)
      },
    }),
    [state, isModerator],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}
