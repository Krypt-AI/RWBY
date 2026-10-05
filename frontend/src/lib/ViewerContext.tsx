import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Ballot, Category, ViewerState } from './types'
import { useAccount } from '../hooks/useAccount'
import { useNotice } from '../hooks/useNotice'
import { backend } from '../services/backend'

type ListKey = 'rsvps' | 'likedTracks' | 'joinedPosts'

type ViewerContextValue = ViewerState & {
  setName: (name: string) => void
  recordBallot: (category: Category, ballot: Ballot) => void
  toggleRsvp: (sessionId: string) => void
  toggleLikedTrack: (trackId: string) => void
  toggleJoinedPost: (postId: string) => void
}

export const ViewerContext = createContext<ViewerContextValue | null>(null)

function toggleIn(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter(item => item !== id) : [...list, id]
}

/**
 * The current visitor and their own choices. Ballots, likes and joins are sent with their
 * site action (see SiteContext); these setters only keep the viewer's copy in step.
 * Names and RSVPs have no site action, so they go to the backend from here.
 */
export function ViewerProvider({ children }: { children: ReactNode }) {
  const store = backend.viewer
  const { account, requireAccount } = useAccount()
  const { report } = useNotice()
  const [viewer, setViewer] = useState<ViewerState>(store.initialViewer)

  useEffect(() => store.connect(account, setViewer), [store, account])
  useEffect(() => store.persist?.(viewer), [store, viewer])

  const setName = useCallback(
    (name: string) => {
      const trimmed = name.trim().slice(0, 24)
      if (!trimmed || !requireAccount()) return
      setViewer(current => ({ ...current, name: trimmed }))
      store.setName(trimmed).catch(report)
    },
    [store, requireAccount, report],
  )

  const recordBallot = useCallback((category: Category, ballot: Ballot) => {
    setViewer(current => ({ ...current, ballots: { ...current.ballots, [category]: ballot } }))
  }, [])

  const toggle = useCallback((key: ListKey, id: string) => {
    setViewer(current => ({ ...current, [key]: toggleIn(current[key], id) }))
  }, [])

  const toggleRsvp = useCallback(
    (sessionId: string) => {
      if (!requireAccount()) return
      toggle('rsvps', sessionId)
      store.setRsvp(sessionId, !viewer.rsvps.includes(sessionId)).catch(report)
    },
    [store, requireAccount, toggle, viewer.rsvps, report],
  )

  const value = useMemo(
    () => ({
      ...viewer,
      setName,
      recordBallot,
      toggleRsvp,
      toggleLikedTrack: (trackId: string) => toggle('likedTracks', trackId),
      toggleJoinedPost: (postId: string) => toggle('joinedPosts', postId),
    }),
    [viewer, setName, recordBallot, toggleRsvp, toggle],
  )

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
}
