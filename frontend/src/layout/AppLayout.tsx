import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { AccountStatus } from '../lib/AccountContext'
import { useAccount } from '../hooks/useAccount'
import { useMode } from '../hooks/useMode'
import { useSite } from '../hooks/useSite'
import { AccountButton } from '../components/AccountButton'
import { Icon } from '../components/Icon'
import { ModeSwitch } from '../components/ModeSwitch'
import { Notice } from '../components/Notice'
import { SignInDialog } from '../components/SignInDialog'
import { SiteStatusMessage } from '../components/SiteStatusMessage'
import { StatusPill } from '../components/StatusPill'
import { EmblemStripe, Wordmark } from '../components/Wordmark'
import { AnnouncementBanner } from '../components/Announcement'
import { NAV_ITEMS } from './navigation'

/** The role under "Viewing as" in the sidebar. */
function viewingAs(isModerator: boolean, status: AccountStatus): string {
  if (isModerator) return 'Moderator'
  if (status === 'local') return 'User'
  return status === 'signedIn' ? 'Member' : 'Guest'
}

export function AppLayout() {
  const { isModerator } = useMode()
  const { status: accountStatus } = useAccount()
  const { state, status } = useSite()
  const { stream } = state
  const { pathname } = useLocation()
  const items = NAV_ITEMS.filter(item => !item.moderatorOnly || isModerator)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className={`shell ${isModerator ? 'is-moderator' : ''}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <aside className="sidebar">
        <NavLink to="/" className="sidebar-brand" aria-label="RWBY Afterlight home">
          <Wordmark />
        </NavLink>
        <EmblemStripe className="sidebar-stripe" />

        <nav aria-label="Main">
          <ul className="nav-list">
            {items.map(item => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'} className="nav-link">
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.to === '/live' && stream.isLive && (
                    <>
                      <i className="nav-live-dot" aria-hidden="true" />
                      <span className="visually-hidden">(live now)</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-foot">
          <p className="mode-label">
            Viewing as <b>{viewingAs(isModerator, accountStatus)}</b>
          </p>
          <AccountButton />
          <ModeSwitch />
        </div>
      </aside>

      <div className="frame">
        <header className="topbar">
          <NavLink to="/" className="topbar-brand" aria-label="RWBY Afterlight home">
            <Wordmark compact />
          </NavLink>
          <div className="topbar-status">
            <StatusPill tone={stream.isLive ? 'live' : 'offline'} label={stream.isLive ? 'Live now' : 'Off air'} />
            {isModerator && (
              <span className="mod-badge">
                <Icon name="shield" size={13} /> Moderator mode
              </span>
            )}
          </div>
          <div className="topbar-mode">
            <AccountButton compact />
            <ModeSwitch compact />
          </div>
        </header>

        <AnnouncementBanner />

        <main id="main" className="content" tabIndex={-1}>
          {status === 'ready' ? <Outlet /> : <SiteStatusMessage status={status} />}
        </main>
      </div>

      <Notice />
      <SignInDialog />

      <nav className="tabbar" aria-label="Main">
        {items.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="tab-link">
            <Icon name={item.icon} size={20} />
            <span>{item.shortLabel ?? item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
