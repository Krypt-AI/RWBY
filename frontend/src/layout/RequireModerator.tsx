import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useMode } from '../hooks/useMode'

/** Sends regular users home if they open a moderator-only route. */
export function RequireModerator({ children }: { children: ReactNode }) {
  const { isModerator } = useMode()
  return isModerator ? <>{children}</> : <Navigate to="/" replace />
}
