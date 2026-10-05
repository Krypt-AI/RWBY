import { useMemo } from 'react'
import type { Track } from '../lib/types'
import { createId } from '../utils/id'
import { useSite } from './useSite'
import { useViewer } from './useViewer'

/** The community song queue, most-liked first, with one like per viewer. */
export function useTracks() {
  const { state, dispatch } = useSite()
  const viewer = useViewer()
  const { queue } = state.music

  const ranked = useMemo(
    () => [...queue].sort((a, b) => b.likes - a.likes || a.at.localeCompare(b.at)),
    [queue],
  )

  const isLiked = (track: Track) => viewer.likedTracks.includes(track.id)

  const toggleLike = (track: Track) => {
    if (dispatch({ type: 'track/like', id: track.id, liking: !isLiked(track) })) viewer.toggleLikedTrack(track.id)
  }

  /** Returns false when the visitor has to sign in first. */
  const add = (track: Pick<Track, 'title' | 'artist' | 'url'>) =>
    dispatch({ type: 'track/add', track: { ...track, id: createId(), addedBy: viewer.name } })

  return { tracks: ranked, isLiked, toggleLike, add }
}
