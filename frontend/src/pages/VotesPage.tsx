import type { CSSProperties } from 'react'
import { Navigate, NavLink, useParams } from 'react-router-dom'
import type { TeamMember } from '../lib/types'
import { CATEGORIES, CATEGORY_META, DEFAULT_CATEGORY, SEASONAL_CATEGORY, isCategory } from '../lib/categories'
import { useSite } from '../hooks/useSite'
import { useActiveTabInView } from '../hooks/useActiveTabInView'
import { ArtEffect, type ArtEffectKind } from '../components/ArtEffect'
import { PageHeader } from '../components/PageHeader'
import { PollBoard } from '../components/PollBoard'
import { PollEditor } from '../components/PollEditor'
import { SeasonCard } from '../components/anime/SeasonCard'
import { SeasonControls } from '../components/anime/SeasonControls'
import teamArt from '../assets/images/RWBY teams.jpg'

interface LineupMember {
  name: string
  /** Where she stands in RWBY teams.jpg: the x of her centre, in the picture's 576 pixels. */
  x: number
  /** Her element, drifting through her light. */
  effect: ArtEffectKind
}

/**
 * The art beside each poll: Team RWBY in a line, with the category's member (its accent, see
 * lib/categories.ts) lit and the rest of the team cast in her colour (see .lineup-card).
 */
const LINEUP: Record<TeamMember, LineupMember> = {
  ruby: { name: 'Ruby', x: 135, effect: 'petals' },
  weiss: { name: 'Weiss', x: 248, effect: 'snow' },
  blake: { name: 'Blake', x: 358, effect: 'slivers' },
  yang: { name: 'Yang', x: 475, effect: 'embers' },
}

export function VotesPage() {
  const { category } = useParams()
  const { polls } = useSite().state
  const tabsRef = useActiveTabInView<HTMLElement>(category)

  if (!isCategory(category)) return <Navigate to={`/votes/${DEFAULT_CATEGORY}`} replace />

  const meta = CATEGORY_META[category]
  const member = LINEUP[meta.accent]
  const isSeasonal = category === SEASONAL_CATEGORY

  return (
    <div className="page">
      <PageHeader
        eyebrow="Community votes"
        title="Choose what’s next"
        lead="One vote per poll. Moderators close each poll before the session starts."
      />

      <nav ref={tabsRef} className="category-tabs" aria-label="Vote categories">
        {CATEGORIES.map(value => (
          <NavLink key={value} to={`/votes/${value}`} className={`category-tab accent-${CATEGORY_META[value].accent}`}>
            <span>{CATEGORY_META[value].plural}</span>
            <small>{polls[value].isOpen ? 'Open' : 'Closed'}</small>
          </NavLink>
        ))}
      </nav>

      <div className="votes-layout">
        <PollBoard category={category} />
        <aside className={`votes-side accent-${meta.accent}`}>
          <div
            className="lineup-card"
            style={{ '--art': `url("${teamArt}")`, '--focus-x': member.x } as CSSProperties}
            role="img"
            aria-label={`${member.name} with Team RWBY`}
          >
            <ArtEffect key={member.effect} kind={member.effect} className="lineup-effect" />
          </div>
          <p className="votes-blurb">{meta.blurb}</p>
          {isSeasonal && <SeasonCard />}
          {isSeasonal && <SeasonControls />}
          <PollEditor category={category} />
        </aside>
      </div>
    </div>
  )
}
