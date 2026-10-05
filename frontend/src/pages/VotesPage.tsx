import { Navigate, NavLink, useParams } from 'react-router-dom'
import type { Accent } from '../lib/types'
import { CATEGORIES, CATEGORY_META, DEFAULT_CATEGORY, isCategory } from '../lib/categories'
import { useSite } from '../hooks/useSite'
import { useActiveTabInView } from '../hooks/useActiveTabInView'
import { PageHeader } from '../components/PageHeader'
import { PollBoard } from '../components/PollBoard'
import { PollEditor } from '../components/PollEditor'
import teamBands from '../assets/images/RWBY2.jpg'

/**
 * RWBY2.jpg stacks four team bands (Ruby, Weiss, Blake, Yang) vertically.
 * Each category shows its matching band via background-position; accents
 * without a band (Nora) skip the art.
 */
const BAND_POSITION: Partial<Record<Accent, string>> = { ruby: '0%', weiss: '33.333%', blake: '66.667%', yang: '100%' }

export function VotesPage() {
  const { category } = useParams()
  const { polls } = useSite().state
  const tabsRef = useActiveTabInView<HTMLElement>(category)

  if (!isCategory(category)) return <Navigate to={`/votes/${DEFAULT_CATEGORY}`} replace />

  const meta = CATEGORY_META[category]
  const bandPosition = BAND_POSITION[meta.accent]

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
          {bandPosition && (
            <div
              className={`band-card accent-${meta.accent}`}
              style={{ backgroundImage: `url(${teamBands})`, backgroundPositionY: bandPosition }}
              role="img"
              aria-label={`${meta.label} emblem art`}
            />
          )}
          <p className="votes-blurb">{meta.blurb}</p>
          <PollEditor category={category} />
        </aside>
      </div>
    </div>
  )
}
