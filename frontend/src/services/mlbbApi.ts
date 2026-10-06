import type { LiveRates, MatchupStat } from '../data/games/types'

/**
 * Client for Rone Arena (https://arena.rone.dev), a free community API that mirrors the
 * statistics in Moonton's in-game MLBB academy. It needs no key and refreshes daily, but
 * it's unofficial, so every caller has to cope with it failing.
 */
const API_BASE = 'https://arena.rone.dev/api'
const TIMEOUT_MS = 10_000

/** A week of games: steadier than one day, fresher than a month. */
const DAYS = 7

export type MlbbRank = 'all' | 'epic' | 'legend' | 'mythic' | 'honor' | 'glory'

type HeroRates = LiveRates & { name: string }

type Envelope<T> = { code: number; message: string; data: { records: { data: T }[] } }

type RankRecord = {
  main_hero: { data: { name: string } }
  main_hero_win_rate: number
  main_hero_appearance_rate: number
  main_hero_ban_rate: number
}

type SubHero = { heroid: number; increase_win_rate: number }

type CounterRecord = { sub_hero: SubHero[]; sub_hero_last?: SubHero[] }

const percent = (share: number) => share * 100

async function getRecords<T>(path: string, params: Record<string, string | number>): Promise<T[]> {
  const url = new URL(API_BASE + path)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value))

  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!response.ok) throw new Error(`Rone Arena answered ${response.status}`)
  const body = (await response.json()) as Envelope<T>
  if (body.code !== 0) throw new Error(`Rone Arena: ${body.message}`)
  return body.data.records.map(record => record.data)
}

/** Win, pick and ban rates for every hero over the last week. */
export async function fetchHeroRates(rank: MlbbRank): Promise<HeroRates[]> {
  const records = await getRecords<RankRecord>('/heroes/rank', {
    days: DAYS,
    rank,
    size: 200,
    index: 1,
    sort_field: 'win_rate',
    sort_order: 'desc',
  })
  return records.map(record => ({
    name: record.main_hero.data.name,
    winRate: percent(record.main_hero_win_rate),
    pickRate: percent(record.main_hero_appearance_rate),
    banRate: percent(record.main_hero_ban_rate),
  }))
}

/** The five best and five worst picks against one hero over the last week. */
export async function fetchMatchups(heroId: number, rank: MlbbRank): Promise<MatchupStat[]> {
  const [record] = await getRecords<CounterRecord>(`/heroes/${heroId}/counters`, { days: DAYS, rank, size: 1, index: 1 })
  if (!record) return []
  return [...record.sub_hero, ...(record.sub_hero_last ?? [])].map(sub => ({
    heroId: sub.heroid,
    delta: percent(sub.increase_win_rate),
  }))
}
