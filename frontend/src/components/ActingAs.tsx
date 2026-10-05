import type { ReactNode } from 'react'
import { useAccount } from '../hooks/useAccount'
import { useViewer } from '../hooks/useViewer'

type ActingAsProps = {
  /** "Posting", "Joining", "Chatting"… */
  verb: string
  /** Shown after the name, e.g. a "Change" button. Hidden while signed out. */
  children?: ReactNode
}

/** "Posting as Ruby", or a sign-in link for visitors who aren't signed in yet. */
export function ActingAs({ verb, children }: ActingAsProps) {
  const { name } = useViewer()
  const { status, openPrompt } = useAccount()

  // Say nothing until a saved session has had its chance to load.
  if (status === 'loading') return null

  if (status === 'signedOut') {
    return (
      <>
        <button type="button" className="link-button" onClick={openPrompt}>
          Sign in
        </button>{' '}
        to join in
      </>
    )
  }

  return (
    <>
      {verb} as <b>{name}</b>
      {children}
    </>
  )
}
