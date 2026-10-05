import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAccount } from '../hooks/useAccount'
import { useMode } from '../hooks/useMode'

/** Sends regular users home if they open a moderator-only route. */
export function RequireModerator({ children }: { children: ReactNode }) {
  const { isModerator } = useMode()
  // Wait for a saved session to load before deciding, so moderators can reload /control.
  if (useAccount().status === 'loading') return null
  return isModerator ? <>{children}</> : <Navigate to="/" replace />
}
