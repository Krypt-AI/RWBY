import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useMode } from '../hooks/useMode'
import { useSite } from '../hooks/useSite'
import { Icon } from '../components/Icon'
import { ModeSwitch } from '../components/ModeSwitch'
import { StatusPill } from '../components/StatusPill'
import { EmblemStripe, Wordmark } from '../components/Wordmark'
import { AnnouncementBanner } from '../components/Announcement'
import { NAV_ITEMS } from './navigation'

export function AppLayout() {
  const { isModerator } = useMode()
  const { stream } = useSite().state
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
            Viewing as <b>{isModerator ? 'Moderator' : 'User'}</b>
          </p>
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
            <ModeSwitch compact />
          </div>
        </header>

        <AnnouncementBanner />

        <main id="main" className="content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

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
