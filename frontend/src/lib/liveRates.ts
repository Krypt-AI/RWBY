import type { LiveRate, LiveRates } from '../data/games/types'

type RateLeader = { name: string; value: number }

/** Every hero or agent ordered by one live rate, highest first. */
export function rankBy(rates: Map<string, LiveRates>, rate: LiveRate): RateLeader[] {
  return [...rates]
    .map(([name, values]) => ({ name, value: values[rate] }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
}
