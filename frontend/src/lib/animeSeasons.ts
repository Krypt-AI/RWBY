import type { AnimeSeason, SeasonName } from './types'

/** Anime seasons follow the calendar quarters: winter starts in January, fall in October. */
const SEASON_ORDER: SeasonName[] = ['winter', 'spring', 'summer', 'fall']

/** A broadcast season runs about 13 weeks (one cour). */
export const WEEKS_PER_SEASON = 13

const WEEK_MS = 7 * 86_400_000

export function seasonOf(date: Date): AnimeSeason {
  return { year: date.getFullYear(), name: SEASON_ORDER[Math.floor(date.getMonth() / 3)]! }
}

export function sameSeason(a: AnimeSeason, b: AnimeSeason): boolean {
  return a.year === b.year && a.name === b.name
}

/** "Fall 2026" */
export function seasonLabel({ year, name }: AnimeSeason): string {
  return `${name[0]!.toUpperCase()}${name.slice(1)} ${year}`
}

export const seasonalPollTitle = (season: AnimeSeason) => `Anime of the season · ${seasonLabel(season)}`

function seasonStart({ year, name }: AnimeSeason): Date {
  return new Date(year, SEASON_ORDER.indexOf(name) * 3, 1)
}

/** Week of the season `date` falls in, from 1 to WEEKS_PER_SEASON. */
export function seasonWeek(season: AnimeSeason, date: Date): number {
  const week = Math.floor((date.getTime() - seasonStart(season).getTime()) / WEEK_MS) + 1
  return Math.min(WEEKS_PER_SEASON, Math.max(1, week))
}
