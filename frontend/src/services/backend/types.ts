import type { Account, SiteState, ViewerState } from '../../lib/types'
import type { SiteAction, SiteUpdate } from '../../lib/siteReducer'

/** 'unreachable': the first load failed and is being retried. */
export type SiteStatus = 'loading' | 'ready' | 'unreachable'

export type SiteSync = {
  update: (update: SiteUpdate) => void
  setStatus: (status: SiteStatus) => void
}

/** Where the community data (SiteState) is loaded from and sent to. */
export interface SiteStore {
  initialState(): SiteState
  /** Loads the data and keeps it current. Returns a cleanup. */
  connect(sync: SiteSync): () => void
  /** Saves the whole state after every change. Only the local store needs it. */
  persist?(state: SiteState): void
  /**
   * Sends one action, which the caller has already applied optimistically.
   * Rejects with a readable message; the store then reloads, undoing the optimistic change.
   */
  send(action: SiteAction): Promise<void>
}

export type ViewerUpdate = (viewer: ViewerState) => ViewerState

/** Where the visitor's own choices (ballots, RSVPs, likes, joins) and name live. */
export interface ViewerStore {
  initialViewer(): ViewerState
  /** Loads the viewer for this account (null: signed out or local) and keeps it current. */
  connect(account: Account | null, update: (update: ViewerUpdate) => void): () => void
  persist?(viewer: ViewerState): void
  setName(name: string): Promise<void>
  setRsvp(sessionId: string, going: boolean): Promise<void>
}

/** Sign-in for the shared backend. */
export interface AccountService {
  /** Reports the signed-in account (or null), now and after every change. Returns a cleanup. */
  watch(onChange: (account: Account | null) => void): () => void
  /** Reloads the account, e.g. after a rename or a role change. */
  refresh(): Promise<void>
  signIn(): Promise<void>
  signOut(): Promise<void>
}

export type Backend =
  | { kind: 'local'; site: SiteStore; viewer: ViewerStore; account: null }
  | { kind: 'shared'; site: SiteStore; viewer: ViewerStore; account: AccountService }
