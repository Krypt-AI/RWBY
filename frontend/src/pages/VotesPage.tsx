import type { CSSProperties } from 'react'
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
import blakeArt from '../assets/images/Blake.jpg'
import teamBands from '../assets/images/RWBY2.jpg'

interface CategoryArt {
  image: string
  /** Picks the band of RWBY2.jpg, or frames a full picture vertically. */
  positionY: string
  /** A full picture, cropped to the card, rather than one band of RWBY2.jpg. */
  isPicture?: boolean
  label: string
}

/**
 * The art beside each poll. RWBY2.jpg stacks four team bands (Ruby, Weiss, Blake, Yang)
 * vertically, and anime, music and movies each show one. Weiss gets music because she's the
 * team's singer. Games show Blake's own art, framed on her hood and the "B".
 */
const CATEGORY_ART: Record<Category, CategoryArt> = {
  anime: { image: teamBands, positionY: '0%', label: 'Ruby emblem art' },
  music: { image: teamBands, positionY: '33.333%', label: 'Weiss emblem art' },
  game: { image: blakeArt, positionY: '8%', isPicture: true, label: 'Blake art' },
  movie: { image: teamBands, positionY: '100%', label: 'Yang emblem art' },
}

export function VotesPage() {
  const { category } = useParams()
  const { polls } = useSite().state
  const tabsRef = useActiveTabInView<HTMLElement>(category)

  if (!isCategory(category)) return <Navigate to={`/votes/${DEFAULT_CATEGORY}`} replace />

  const meta = CATEGORY_META[category]
  const art = CATEGORY_ART[category]
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
            className={`band-card accent-${meta.accent}${art.isPicture ? ' is-picture' : ''}`}
            style={{ '--art': `url(${art.image})`, '--art-y': art.positionY } as CSSProperties}
            role="img"
            aria-label={art.label}
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
