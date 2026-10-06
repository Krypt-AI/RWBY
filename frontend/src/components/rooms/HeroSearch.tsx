import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { HeroPortrait } from '../games/HeroPortrait'

/** Lowercase letters and digits only, so "xborg" finds X.Borg and "yisun" finds Yi Sun-shin. */
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

type SearchOption = { name: string; portrait?: string }

const byName = (a: SearchOption, b: SearchOption) => a.name.localeCompare(b.name)

type HeroSearchProps = {
  /** Field label, e.g. "Add an enemy pick". */
  label: string
  /** What the options are called, e.g. "heroes". */
  noun: string
  /** Everything the search can find. */
  options: SearchOption[]
  /** What the grid shows while the search box is empty. Defaults to every option. */
  browse?: SearchOption[]
  /** Already picked, shown but disabled. */
  taken: Set<string>
  /** Placeholder once no more picks fit, e.g. "All five picks are in". Disables the search. */
  fullText?: string
  onPick: (name: string) => void
}

/** Searchable hero grid, like the in-game draft screen. Enter adds the first open match. */
export function HeroSearch({ label, noun, options, browse, taken, fullText, onPick }: HeroSearchProps) {
  const [query, setQuery] = useState('')
  const hintId = useId()
  const sorted = useMemo(() => [...options].sort(byName), [options])
  const browsing = useMemo(() => (browse ? [...browse].sort(byName) : sorted), [browse, sorted])
  const needle = normalize(query)
  const matches = needle ? sorted.filter(option => normalize(option.name).includes(needle)) : browsing
  const firstOpen = matches.find(option => !taken.has(option.name))
  const isFull = fullText !== undefined

  const pick = (name: string) => {
    onPick(name)
    setQuery('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !firstOpen) return
    event.preventDefault()
    pick(firstOpen.name)
  }

  return (
    <div className="hero-search">
      <label className="field">
        <span>{label}</span>
        <input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={fullText ?? `Search ${noun}`}
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
          `${matches.length} ${noun}`
        )}
      </p>

      {matches.length === 0 ? (
        <p className="empty-state">No match for “{query}”.</p>
      ) : (
        <ul className="hero-grid" aria-label={noun}>
          {matches.map(option => {
            const isTaken = taken.has(option.name)
            return (
              <li key={option.name}>
                <button
                  type="button"
                  className="hero-option"
                  onClick={() => pick(option.name)}
                  disabled={isTaken || isFull}
                  aria-label={isTaken ? `${option.name}, already picked` : `Add ${option.name}`}
                >
                  <HeroPortrait name={option.name} src={option.portrait} />
                  <span>{option.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
