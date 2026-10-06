import { useId } from 'react'
import type { DraftHero } from '../../data/games/types'
import { HeroSearch } from './HeroSearch'
import { PickSlots } from './PickSlots'

/** What a player who may change the picks can do. */
type DraftEdits = {
  onPick: (hero: string) => void
  onRemove: (hero: string) => void
  onClear: () => void
}

type DraftPicksPanelProps = {
  title: string
  side: 'enemy' | 'ally'
  /** Every hero the search can add. */
  heroes: DraftHero[]
  picks: DraftHero[]
  limit: number
  /** Heroes already in either draft, shown but disabled in the search. */
  taken: Set<string>
  /** Field label for the search, e.g. "Add an enemy pick". */
  searchLabel: string
  /** Search placeholder once every slot is filled. */
  fullText: string
  /** Without edits the panel is read-only and shows `readOnlyNote` instead of the search. */
  edits?: DraftEdits
  readOnlyNote?: string
}

/** One team's picks in a draft, filled in pick order, with a hero search to add the next one. */
export function DraftPicksPanel(props: DraftPicksPanelProps) {
  const { title, side, heroes, picks, limit, taken, searchLabel, fullText, edits, readOnlyNote } = props
  const titleId = useId()

  return (
    <section className="panel draft-picks" aria-labelledby={titleId}>
      <div className="panel-head">
        <h2 className="panel-title" id={titleId}>
          {title}
        </h2>
        {edits && picks.length > 0 && (
          <button type="button" className="btn btn-ghost btn-small" onClick={edits.onClear}>
            Clear picks
          </button>
        )}
      </div>

      <PickSlots
        label={title}
        side={side}
        count={limit}
        picks={picks}
        placeholder={index => `Pick ${index + 1}`}
        onRemove={edits?.onRemove}
      />

      {edits ? (
        <HeroSearch
          label={searchLabel}
          noun="heroes"
          options={heroes}
          taken={taken}
          fullText={picks.length >= limit ? fullText : undefined}
          onPick={edits.onPick}
        />
      ) : (
        readOnlyNote && <p className="room-note">{readOnlyNote}</p>
      )}
    </section>
  )
}
