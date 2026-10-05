import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Ballot, Category, ViewerState } from './types'
import { load, save } from '../services/storage'
import { createId } from '../utils/id'

const STORAGE_KEY = 'viewer.v1'

type ListKey = 'rsvps' | 'likedTracks' | 'joinedPosts'

type ViewerContextValue = ViewerState & {
  setName: (name: string) => void
  recordBallot: (category: Category, ballot: Ballot) => void
  toggleRsvp: (sessionId: string) => void
  toggleLikedTrack: (trackId: string) => void
  toggleJoinedPost: (postId: string) => void
}

export const ViewerContext = createContext<ViewerContextValue | null>(null)

function createViewer(): ViewerState {
  return {
    id: createId(),
    name: `Huntsman-${Math.floor(1000 + Math.random() * 9000)}`,
    ballots: {},
    rsvps: [],
    likedTracks: [],
    joinedPosts: [],
  }
}

/** Fills in fields added after a viewer was first saved. */
function loadViewer(): ViewerState {
  return { ...createViewer(), ...load<Partial<ViewerState>>(STORAGE_KEY, () => ({})) }
}

function toggleIn(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter(item => item !== id) : [...list, id]
}

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<ViewerState>(loadViewer)

  useEffect(() => {
    save(STORAGE_KEY, viewer)
  }, [viewer])

  const setName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 24)
    if (trimmed) setViewer(current => ({ ...current, name: trimmed }))
  }, [])

  const recordBallot = useCallback((category: Category, ballot: Ballot) => {
    setViewer(current => ({ ...current, ballots: { ...current.ballots, [category]: ballot } }))
  }, [])

  const toggle = useCallback((key: ListKey, id: string) => {
    setViewer(current => ({ ...current, [key]: toggleIn(current[key], id) }))
  }, [])

  const value = useMemo(
    () => ({
      ...viewer,
      setName,
      recordBallot,
      toggleRsvp: (sessionId: string) => toggle('rsvps', sessionId),
      toggleLikedTrack: (trackId: string) => toggle('likedTracks', trackId),
      toggleJoinedPost: (postId: string) => toggle('joinedPosts', postId),
    }),
    [viewer, setName, recordBallot, toggle],
  )

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
}
