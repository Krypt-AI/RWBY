import type { GameRoom, RoomMember, SiteState, ViewerState } from '../../lib/types'
import { createSeedState } from '../../lib/seed'
import { createId } from '../../utils/id'
import { load, save, subscribe } from '../storage'
import type { SiteStore, ViewerStore } from './types'

/**
 * v2 added game/music polls, the LFG board and the music queue.
 * v3 added game rooms and swapped the anime and manga polls for the seasonal anime poll.
 */
const SITE_KEY = 'site.v3'
const VIEWER_KEY = 'viewer.v1'

/** Drops the sample squad posts that earlier starter content saved, keeping the ones visitors wrote. */
function withoutSampleSquads(state: SiteState): SiteState {
  return { ...state, lfg: state.lfg.filter(post => post.authorId !== 'seed') }
}

/** A room saved before rooms had a chosen lineup and members a role and favourites. */
type SavedRoom = Omit<GameRoom, 'lineup' | 'members'> & {
  lineup?: string | null
  members: (Omit<RoomMember, 'role' | 'picks'> & Partial<Pick<RoomMember, 'role' | 'picks'>>)[]
}

/** Fills in what older saved rooms lack: no chosen lineup, and every member fills with no favourites. */
function withCurrentRooms(state: SiteState): SiteState {
  const upgrade = (room: SavedRoom): GameRoom => ({
    ...room,
    lineup: room.lineup ?? null,
    members: room.members.map(member => ({ ...member, role: member.role ?? null, picks: member.picks ?? [] })),
  })
  const rooms = Object.fromEntries(
    Object.entries(state.rooms).map(([game, room]) => [game, upgrade(room)]),
  ) as SiteState['rooms']
  return { ...state, rooms }
}

/** The whole site in this browser's storage, synced between its open tabs. */
export const localSiteStore: SiteStore = {
  initialState: () => withCurrentRooms(withoutSampleSquads(load(SITE_KEY, createSeedState))),
  connect(sync) {
    sync.setStatus('ready')
    return subscribe<SiteState>(SITE_KEY, next => sync.update(() => next))
  },
  persist: state => save(SITE_KEY, state),
  send: () => Promise.resolve(),
}

function createViewer(): ViewerState {
  return {
    id: createId(),
    name: `Huntsman-${Math.floor(1000 + Math.random() * 9000)}`,
    ballots: {},
    rsvps: [],
    likedTracks: [],
    joinedPosts: [],
  }
}

/** A random per-browser identity. Changes are saved by persist(), so the setters have nothing to send. */
export const localViewerStore: ViewerStore = {
  // Fills in fields added after a viewer was first saved.
  initialViewer: () => ({ ...createViewer(), ...load<Partial<ViewerState>>(VIEWER_KEY, () => ({})) }),
  connect: () => () => {},
  persist: viewer => save(VIEWER_KEY, viewer),
  setName: () => Promise.resolve(),
  setRsvp: () => Promise.resolve(),
}
