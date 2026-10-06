import type { IconName } from '../components/Icon'

type NavItem = {
  to: string
  label: string
  /** Label for the mobile tab bar, when the full label is too long. */
  shortLabel?: string
  icon: IconName
  /** Hidden from regular users. */
  moderatorOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/squad', label: 'Squad', icon: 'users' },
  { to: '/games', label: 'Games', icon: 'gamepad' },
  { to: '/music', label: 'Music', icon: 'music' },
  { to: '/live', label: 'Live', icon: 'live' },
  { to: '/votes', label: 'Votes', icon: 'vote' },
  { to: '/control', label: 'Control room', shortLabel: 'Control', icon: 'shield', moderatorOnly: true },
]
