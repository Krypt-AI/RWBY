import { useId, useRef, useState, type FormEvent } from 'react'
import { useMode } from '../hooks/useMode'
import { Icon } from './Icon'

/**
 * Toggles between user and moderator mode. Locally it asks for the demo passcode; on the
 * shared backend it only shows for moderator accounts and switches straight away.
 */
export function ModeSwitch({ compact = false }: { compact?: boolean }) {
  const { isModerator, canModerate, needsPasscode, enterModerator, exitModerator } = useMode()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const errorId = useId()
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')

  if (!canModerate) return null

  const open = () => {
    setPasscode('')
    setError('')
    dialogRef.current?.showModal()
  }
  const close = () => dialogRef.current?.close()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (enterModerator(passcode)) close()
    else setError('That passcode is not right. Try again.')
  }

  const enter = needsPasscode ? open : () => enterModerator()

  return (
    <>
      <button
        type="button"
        className={`mode-switch ${isModerator ? 'is-moderator' : ''} ${compact ? 'is-compact' : ''}`}
        onClick={isModerator ? exitModerator : enter}
      >
        <Icon name={isModerator ? 'unlock' : 'lock'} size={16} />
        <span>{isModerator ? 'Exit moderator' : needsPasscode ? 'Moderator login' : 'Moderator mode'}</span>
      </button>

      {needsPasscode && (
        <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId}>
          <form onSubmit={submit}>
            <div className="dialog-head">
              <h2 id={titleId}>Moderator access</h2>
              <button type="button" className="icon-button" onClick={close} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>
            <p className="muted">Moderators can run the stream, open and close votes, and edit the schedule.</p>
            <label className="field">
              <span>Passcode</span>
              <input
                type="password"
                value={passcode}
                onChange={event => setPasscode(event.target.value)}
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                autoFocus
                required
              />
            </label>
            {error && (
              <p id={errorId} className="field-error" role="alert">
                {error}
              </p>
            )}
            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={close}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Enter moderator mode
              </button>
            </div>
          </form>
        </dialog>
      )}
    </>
  )
}
