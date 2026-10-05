import type { RoomPhase } from '../../lib/rooms'
import { formatCountdown, formatRelative, formatSessionDate } from '../../utils/format'

export type ClockCopy = {
  label: string
  value: string
  note: string
  /** One line for compact cards. */
  summary: string
  /** True while `value` is a running countdown. */
  ticking: boolean
}

/** What the room clock says in each phase. */
export function clockCopy(phase: RoomPhase, startsAt: string | null, now: number): ClockCopy {
  const untilStart = startsAt ? new Date(startsAt).getTime() - now : 0
  const countdown = formatCountdown(untilStart)

  switch (phase) {
    case 'upcoming':
      return {
        label: 'Starts in',
        value: countdown,
        note: formatSessionDate(startsAt!),
        summary: `Starts in ${countdown}`,
        ticking: true,
      }
    case 'starting':
      return {
        label: 'Starting in',
        value: countdown,
        note: 'Get in the lobby.',
        summary: `Starting in ${countdown}`,
        ticking: true,
      }
    case 'inGame':
      return {
        label: 'Status',
        value: 'In game',
        note: `Started ${formatRelative(startsAt!, now)}`,
        summary: 'In game now',
        ticking: false,
      }
    case 'ended':
      return {
        label: 'Start time',
        value: 'Not set',
        note: `Last session started ${formatRelative(startsAt!, now)}.`,
        summary: 'No start time yet',
        ticking: false,
      }
    case 'unscheduled':
      return {
        label: 'Start time',
        value: 'Not set',
        note: 'Nobody has picked a time yet.',
        summary: 'No start time yet',
        ticking: false,
      }
  }
}
