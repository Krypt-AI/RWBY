import type { Announcement, Category, LfgPost, Music, Poll, Session, SiteState, Stream, Track } from './types'
import { createSeedState } from './seed'
import { createId } from '../utils/id'

const MAX_CHAT_MESSAGES = 200
const MAX_LFG_POSTS = 50
const MAX_TRACKS = 100

export type SiteAction =
  | { type: 'site/hydrate'; state: SiteState }
  | { type: 'site/reset' }
  | { type: 'announcement/update'; patch: Partial<Announcement> }
  | { type: 'stream/update'; patch: Partial<Stream> }
  | { type: 'schedule/add'; session: Omit<Session, 'id'> }
  | { type: 'schedule/remove'; id: string }
  | { type: 'chat/send'; author: string; text: string; fromModerator: boolean }
  | { type: 'chat/remove'; id: string }
  | { type: 'chat/togglePin'; id: string }
  | { type: 'chat/clear' }
  | { type: 'poll/vote'; category: Category; optionId: string; previousOptionId?: string }
  | { type: 'poll/update'; category: Category; patch: Partial<Pick<Poll, 'title' | 'isOpen'>> }
  | { type: 'poll/addOption'; category: Category; title: string; note: string }
  | { type: 'poll/removeOption'; category: Category; optionId: string }
  | { type: 'poll/resetVotes'; category: Category }
  | { type: 'lfg/post'; post: Omit<LfgPost, 'id' | 'joined' | 'at'> }
  | { type: 'lfg/join'; id: string; joining: boolean }
  | { type: 'lfg/remove'; id: string }
  | { type: 'lfg/clear' }
  | { type: 'music/update'; patch: Partial<Pick<Music, 'playlistUrl'>> }
  | { type: 'track/add'; track: Omit<Track, 'id' | 'likes' | 'at'> }
  | { type: 'track/like'; id: string; liking: boolean }
  | { type: 'track/remove'; id: string }

function step(value: number, up: boolean): number {
  return up ? value + 1 : Math.max(0, value - 1)
}

function updatePoll(state: SiteState, category: Category, update: (poll: Poll) => Poll): SiteState {
  return { ...state, polls: { ...state.polls, [category]: update(state.polls[category]) } }
}

export function siteReducer(state: SiteState, action: SiteAction): SiteState {
  switch (action.type) {
    case 'site/hydrate':
      return action.state
    case 'site/reset':
      return createSeedState()

    case 'announcement/update':
      return { ...state, announcement: { ...state.announcement, ...action.patch } }
    case 'stream/update':
      return { ...state, stream: { ...state.stream, ...action.patch } }

    case 'schedule/add': {
      const schedule = [...state.schedule, { ...action.session, id: createId() }]
      schedule.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      return { ...state, schedule }
    }
    case 'schedule/remove':
      return { ...state, schedule: state.schedule.filter(session => session.id !== action.id) }

    case 'chat/send': {
      const message = {
        id: createId(),
        author: action.author,
        text: action.text,
        at: new Date().toISOString(),
        fromModerator: action.fromModerator,
        pinned: false,
      }
      return { ...state, chat: [...state.chat, message].slice(-MAX_CHAT_MESSAGES) }
    }
    case 'chat/remove':
      return { ...state, chat: state.chat.filter(message => message.id !== action.id) }
    case 'chat/togglePin':
      return {
        ...state,
        chat: state.chat.map(message => ({
          ...message,
          // Only one pinned message at a time.
          pinned: message.id === action.id ? !message.pinned : false,
        })),
      }
    case 'chat/clear':
      return { ...state, chat: [] }

    case 'poll/vote':
      return updatePoll(state, action.category, poll => {
        if (!poll.isOpen) return poll
        return {
          ...poll,
          options: poll.options.map(option => {
            if (option.id === action.optionId) return { ...option, votes: option.votes + 1 }
            if (option.id === action.previousOptionId) return { ...option, votes: Math.max(0, option.votes - 1) }
            return option
          }),
        }
      })
    case 'poll/update':
      return updatePoll(state, action.category, poll => ({ ...poll, ...action.patch }))
    case 'poll/addOption':
      return updatePoll(state, action.category, poll => ({
        ...poll,
        options: [...poll.options, { id: createId(), title: action.title, note: action.note, votes: 0 }],
      }))
    case 'poll/removeOption':
      return updatePoll(state, action.category, poll => ({
        ...poll,
        options: poll.options.filter(option => option.id !== action.optionId),
      }))
    case 'poll/resetVotes':
      return updatePoll(state, action.category, poll => ({
        ...poll,
        round: poll.round + 1,
        options: poll.options.map(option => ({ ...option, votes: 0 })),
      }))

    case 'lfg/post': {
      const post = { ...action.post, id: createId(), joined: 0, at: new Date().toISOString() }
      return { ...state, lfg: [post, ...state.lfg].slice(0, MAX_LFG_POSTS) }
    }
    case 'lfg/join':
      return {
        ...state,
        lfg: state.lfg.map(post =>
          post.id === action.id ? { ...post, joined: Math.min(post.slots, step(post.joined, action.joining)) } : post,
        ),
      }
    case 'lfg/remove':
      return { ...state, lfg: state.lfg.filter(post => post.id !== action.id) }
    case 'lfg/clear':
      return { ...state, lfg: [] }

    case 'music/update':
      return { ...state, music: { ...state.music, ...action.patch } }
    case 'track/add': {
      const track = { ...action.track, id: createId(), likes: 0, at: new Date().toISOString() }
      return { ...state, music: { ...state.music, queue: [...state.music.queue, track].slice(-MAX_TRACKS) } }
    }
    case 'track/like':
      return {
        ...state,
        music: {
          ...state.music,
          queue: state.music.queue.map(track =>
            track.id === action.id ? { ...track, likes: step(track.likes, action.liking) } : track,
          ),
        },
      }
    case 'track/remove':
      return { ...state, music: { ...state.music, queue: state.music.queue.filter(track => track.id !== action.id) } }
  }
}
