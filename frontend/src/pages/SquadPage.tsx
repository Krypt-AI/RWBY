import { useState } from 'react'
import type { LfgPost } from '../lib/types'
import { GAMES } from '../data/games'
import { useLfg } from '../hooks/useLfg'
import { useSite } from '../hooks/useSite'
import { ChipGroup } from '../components/ChipGroup'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ModPanel, Panel } from '../components/Panel'
import { LfgCard } from '../components/squad/LfgCard'
import { LfgForm } from '../components/squad/LfgForm'
import squadArt from '../assets/images/squad-up-2560.webp'
import squadArtSmall from '../assets/images/squad-up-1280.webp'

type GameFilter = LfgPost['game'] | 'all'

const FILTERS: { value: GameFilter; label: string }[] = [
  { value: 'all', label: 'All games' },
  ...GAMES.map(game => ({ value: game.id, label: game.shortName })),
  { value: 'other', label: 'Other' },
]

export function SquadPage() {
  const { posts } = useLfg()
  const { moderate } = useSite()
  const [filter, setFilter] = useState<GameFilter>('all')
  const shown = filter === 'all' ? posts : posts.filter(post => post.game === filter)

  const clearBoard = () => {
    if (window.confirm('Remove every post from the Squad board?')) moderate({ type: 'lfg/clear' })
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Looking for group"
        title="Squad up"
        lead="Post what you’re queuing for and which roles you need. Friends tap Join to fill the stack."
        art={{
          src: squadArt,
          srcSet: `${squadArtSmall} 1280w, ${squadArt} 2560w`,
          fill: true,
          position: 'center 40%',
          effect: 'aura',
        }}
      />

      <div className="split-layout is-wide-main">
        <section className="squad-board" aria-labelledby="squad-board-title">
          <h2 id="squad-board-title" className="visually-hidden">
            Open squads
          </h2>
          <ChipGroup
            label="Filter by game"
            options={FILTERS}
            isSelected={value => value === filter}
            onSelect={value => setFilter(value as GameFilter)}
          />
          {shown.length === 0 ? (
            <EmptyState>No squads looking right now. Start one.</EmptyState>
          ) : (
            <ul className="lfg-list">
              {shown.map(post => (
                <LfgCard key={post.id} post={post} />
              ))}
            </ul>
          )}
        </section>

        <aside className="side-stack">
          <Panel eyebrow="New post" title="Find teammates">
            <LfgForm />
          </Panel>
          <ModPanel title="Board controls">
            <div className="mod-row">
              <p className="muted">{posts.length} posts on the board.</p>
              <button type="button" className="btn btn-danger" onClick={clearBoard} disabled={posts.length === 0}>
                Clear board
              </button>
            </div>
          </ModPanel>
        </aside>
      </div>
    </div>
  )
}
