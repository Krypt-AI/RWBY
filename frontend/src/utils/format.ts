const sessionFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

export const formatSessionDate = (iso: string) => sessionFormat.format(new Date(iso))

export const formatTime = (iso: string) => timeFormat.format(new Date(iso))

export function percent(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100)
}

export function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]!.toUpperCase())
    .join('')
}

const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

/** "5 minutes ago", "yesterday"... Anything under a minute is "just now". */
export function formatRelative(iso: string, now = Date.now()): string {
  const elapsed = new Date(iso).getTime() - now
  for (const [unit, ms] of RELATIVE_STEPS) {
    if (Math.abs(elapsed) >= ms) return relativeFormat.format(Math.round(elapsed / ms), unit)
  }
  return 'just now'
}

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

/** Formats a plain YYYY-MM-DD date without shifting it across time zones. */
export const formatDate = (isoDate: string) => dateFormat.format(new Date(`${isoDate}T12:00:00`))
