import { useMemo } from 'react'
import type { Category } from '../lib/types'
import { useSite } from './useSite'
import { useViewer } from './useViewer'

/** A poll plus the current viewer's ballot and a way to cast or change it. */
export function usePoll(category: Category) {
  const { state, dispatch } = useSite()
  const { ballots, recordBallot } = useViewer()
  const poll = state.polls[category]

  const ballot = ballots[category]
  // A ballot is only valid for the current round and while its option exists.
  const votedFor =
    ballot && ballot.round === poll.round && poll.options.some(option => option.id === ballot.optionId)
      ? ballot.optionId
      : undefined

  const totalVotes = useMemo(() => poll.options.reduce((sum, option) => sum + option.votes, 0), [poll.options])

  const leader = useMemo(
    () =>
      totalVotes === 0
        ? undefined
        : poll.options.reduce((best, option) => (option.votes > best.votes ? option : best)),
    [poll.options, totalVotes],
  )

  const vote = (optionId: string) => {
    if (!poll.isOpen || optionId === votedFor) return
    if (dispatch({ type: 'poll/vote', category, optionId, previousOptionId: votedFor })) {
      recordBallot(category, { round: poll.round, optionId })
    }
  }

  return { poll, votedFor, totalVotes, leader, vote }
}
