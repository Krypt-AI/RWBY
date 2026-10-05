import { useEffect, useId, useRef } from 'react'
import { useAccount } from '../hooks/useAccount'
import { Icon } from './Icon'

/** Asks a visitor to sign in when they try to take part (vote, chat, join…) while signed out. */
export function SignInDialog() {
  const { isShared, isPromptOpen, closePrompt, signIn } = useAccount()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isPromptOpen && !dialog.open) dialog.showModal()
    if (!isPromptOpen && dialog.open) dialog.close()
  }, [isPromptOpen])

  if (!isShared) return null

  return (
    <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onClose={closePrompt}>
      <div className="dialog-body">
        <div className="dialog-head">
          <h2 id={titleId}>Join the squad</h2>
          <button type="button" className="icon-button" onClick={closePrompt} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <p className="muted">
          Sign in with Discord to chat, vote, post squads, add songs and take a seat in the game rooms. Anyone can
          keep reading without an account.
        </p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={closePrompt}>
            Not now
          </button>
          <button type="button" className="btn btn-primary" onClick={signIn} autoFocus>
            <Icon name="signIn" size={16} /> Continue with Discord
          </button>
        </div>
      </div>
    </dialog>
  )
}
