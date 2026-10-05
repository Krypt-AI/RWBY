import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import type { DraftHero } from '../../data/games/types'
import { HeroPortrait } from '../games/HeroPortrait'

/** Lowercase letters and digits only, so "xborg" finds X.Borg and "yisun" finds Yi Sun-shin. */
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

type HeroSearchProps = {
  heroes: DraftHero[]
  /** Already picked, shown but disabled. */
  takenIds: Set<number>
  /** All enemy picks are in. */
  isFull: boolean
  onPick: (hero: string) => void
}

/** Searchable hero grid, like the in-game draft screen. Enter adds the first open match. */
export function HeroSearch({ heroes, takenIds, isFull, onPick }: HeroSearchProps) {
  const [query, setQuery] = useState('')
  const hintId = useId()
  const sorted = useMemo(() => [...heroes].sort((a, b) => a.name.localeCompare(b.name)), [heroes])
  const needle = normalize(query)
  const matches = needle ? sorted.filter(hero => normalize(hero.name).includes(needle)) : sorted
  const firstOpen = matches.find(hero => !takenIds.has(hero.id))

  const pick = (hero: DraftHero) => {
    onPick(hero.name)
    setQuery('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !firstOpen) return
    event.preventDefault()
    pick(firstOpen)
  }

  return (
    <div className="hero-search">
      <label className="field">
        <span>Add an enemy pick</span>
        <input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isFull ? 'All five picks are in' : 'Search heroes'}
          disabled={isFull}
          autoComplete="off"
          aria-describedby={hintId}
        />
      </label>
      <p id={hintId} className="hero-search-hint">
        {firstOpen && needle ? (
          <>
            Enter adds <b>{firstOpen.name}</b>
          </>
        ) : (
          `${heroes.length} heroes`
        )}
      </p>

      {matches.length === 0 ? (
        <p className="empty-state">No hero matches “{query}”.</p>
      ) : (
        <ul className="hero-grid" aria-label="Heroes">
          {matches.map(hero => {
            const taken = takenIds.has(hero.id)
            return (
              <li key={hero.id}>
                <button
                  type="button"
                  className="hero-option"
                  onClick={() => pick(hero)}
                  disabled={taken || isFull}
                  aria-label={taken ? `${hero.name}, already picked` : `Add ${hero.name}`}
                >
                  <HeroPortrait name={hero.name} src={hero.portrait} />
                  <span>{hero.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
