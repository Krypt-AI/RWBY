import { Navigate, NavLink, useParams } from 'react-router-dom'
import type { Category } from '../lib/types'
import { CATEGORIES, CATEGORY_META, DEFAULT_CATEGORY, SEASONAL_CATEGORY, isCategory } from '../lib/categories'
import { useSite } from '../hooks/useSite'
import { useActiveTabInView } from '../hooks/useActiveTabInView'
import { PageHeader } from '../components/PageHeader'
import { PollBoard } from '../components/PollBoard'
import { PollEditor } from '../components/PollEditor'
import { SeasonCard } from '../components/anime/SeasonCard'
import { SeasonControls } from '../components/anime/SeasonControls'
import teamBands from '../assets/images/RWBY2.jpg'

/**
 * RWBY2.jpg stacks four team bands (Ruby, Weiss, Blake, Yang) vertically; each category
 * shows one via background-position. Weiss gets music because she's the team's singer.
 */
const BAND_POSITION: Record<Category, string> = { anime: '0%', music: '33.333%', game: '66.667%', movie: '100%' }

export function VotesPage() {
  const { category } = useParams()
  const { polls } = useSite().state
  const tabsRef = useActiveTabInView<HTMLElement>(category)

  if (!isCategory(category)) return <Navigate to={`/votes/${DEFAULT_CATEGORY}`} replace />

  const meta = CATEGORY_META[category]
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
        <aside className="votes-side">
          <div
            className={`band-card accent-${meta.accent}`}
            style={{ backgroundImage: `url(${teamBands})`, backgroundPositionY: BAND_POSITION[category] }}
            role="img"
            aria-label={`${meta.label} emblem art`}
          />
          <p className="votes-blurb">{meta.blurb}</p>
          {isSeasonal && <SeasonCard />}
          {isSeasonal && <SeasonControls />}
          <PollEditor category={category} />
        </aside>
      </div>
    </div>
  )
}
