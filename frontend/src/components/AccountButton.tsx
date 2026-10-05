import { useId, useRef, type FormEvent, type RefObject } from 'react'
import type { Account } from '../lib/types'
import { useAccount } from '../hooks/useAccount'
import { useViewer } from '../hooks/useViewer'
import { initials } from '../utils/format'
import { Icon } from './Icon'

/** The member's Discord avatar, or their initials when Discord has none. */
export function AccountAvatar({ account }: { account: Account }) {
  return account.avatarUrl ? (
    <img className="avatar" src={account.avatarUrl} alt="" referrerPolicy="no-referrer" />
  ) : (
    <span className="avatar" aria-hidden="true">
      {initials(account.name)}
    </span>
  )
}

/**
 * "Sign in" for visitors, or the member's name and avatar, which opens their account
 * (display name and sign-out). Renders nothing in the local demo, which has no accounts.
 */
export function AccountButton({ compact = false }: { compact?: boolean }) {
  const { status, account, signIn } = useAccount()
  const dialogRef = useRef<HTMLDialogElement>(null)

  if (status === 'local') return null

  if (!account) {
    return (
      <button
        type="button"
        className={`account-button ${compact ? 'is-compact' : ''}`}
        onClick={signIn}
        disabled={status === 'loading'}
      >
        <Icon name="signIn" size={16} />
        <span>Sign in</span>
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        className={`account-button is-signed-in ${compact ? 'is-compact' : ''}`}
        onClick={() => dialogRef.current?.showModal()}
        aria-label={`Account: ${account.name}`}
      >
        <AccountAvatar account={account} />
        <span>{account.name}</span>
      </button>
      <AccountDialog dialogRef={dialogRef} account={account} />
    </>
  )
}

type AccountDialogProps = {
  dialogRef: RefObject<HTMLDialogElement>
  account: Account
}

function AccountDialog({ dialogRef, account }: AccountDialogProps) {
  const { signOut } = useAccount()
  const { setName } = useViewer()
  const titleId = useId()
  const close = () => dialogRef.current?.close()

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setName(new FormData(event.currentTarget).get('name')?.toString() ?? '')
    close()
  }

  return (
    <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId}>
      <form onSubmit={save}>
        <div className="dialog-head">
          <h2 id={titleId}>Your account</h2>
          <button type="button" className="icon-button" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="account-summary">
          <AccountAvatar account={account} />
          <p>
            <b>{account.name}</b>
            <small>{account.isModerator ? 'Moderator' : 'Member'} · signed in with Discord</small>
          </p>
        </div>
        <label className="field">
          <span>Display name</span>
          {/* Keyed so the field resets to the current name each time it opens. */}
          <input key={account.name} name="name" defaultValue={account.name} maxLength={24} required />
          <small className="muted">Shown on your chat messages, squad posts, songs and room seat.</small>
        </label>
        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              close()
              signOut()
            }}
          >
            <Icon name="signOut" size={16} /> Sign out
          </button>
          <button type="submit" className="btn btn-primary">
            Save name
          </button>
        </div>
      </form>
    </dialog>
  )
}
