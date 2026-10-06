import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import scytheArt from '../assets/images/Ruby_scythe.jpg'

export function NotFoundPage() {
  return (
    <div className="page not-found">
      <div className="not-found-art scythe-glint" style={{ '--art': `url("${scytheArt}")` } as CSSProperties}>
        <img src={scytheArt} alt="" />
      </div>
      <PageHeader
        eyebrow="404"
        title="Lost in the Emerald Forest"
        lead="This page doesn’t exist. Head back to the main hall."
        actions={
          <Link to="/" className="btn btn-primary">
            Back home
          </Link>
        }
      />
    </div>
  )
}
