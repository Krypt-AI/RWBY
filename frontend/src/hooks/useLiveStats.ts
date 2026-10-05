import { useEffect, useState } from 'react'
import type { GameId } from '../lib/types'
import { LIVE_FEEDS, type LiveSnapshot } from '../services/liveStats'

/** How often an open page checks the feed again. */
const REFRESH_MS = 10 * 60_000

/**
 * 'none': the game has no feed. 'stale': a refresh failed, so older numbers are showing.
 * 'error': the feed never answered, so the page falls back to the patch snapshot.
 */
export type LiveStatus = 'none' | 'loading' | 'live' | 'stale' | 'error'

type Request = { rank: string; fresh: boolean }

/** Live rates for one game, refreshed while the page is open. */
export function useLiveStats(gameId: GameId) {
  const feed = LIVE_FEEDS[gameId]
  const [request, setRequest] = useState<Request>({ rank: feed?.ranks[0]?.value ?? '', fresh: false })
  const [snapshot, setSnapshot] = useState<LiveSnapshot>()
  const [status, setStatus] = useState<LiveStatus>(feed ? 'loading' : 'none')
  const [isRefreshing, setIsRefreshing] = useState(Boolean(feed))

  useEffect(() => {
    if (!feed) return
    let active = true

    const load = (fresh: boolean) => {
      setIsRefreshing(true)
      feed
        .snapshot(request.rank, fresh)
        .then(
          next => {
            if (!active) return
            setSnapshot(next)
            setStatus('live')
          },
          () => active && setStatus(current => (current === 'live' || current === 'stale' ? 'stale' : 'error')),
        )
        .finally(() => active && setIsRefreshing(false))
    }

    load(request.fresh)
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load(true)
    }, REFRESH_MS)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [feed, request])

  return {
    feed,
    status,
    rates: snapshot?.rates,
    fetchedAt: snapshot?.fetchedAt,
    isRefreshing,
    rank: request.rank,
    rankLabel: feed?.ranks.find(rank => rank.value === request.rank)?.label ?? '',
    setRank: (rank: string) => setRequest({ rank, fresh: false }),
    refresh: () => setRequest(current => ({ ...current, fresh: true })),
  }
}

export type LiveStats = ReturnType<typeof useLiveStats>
