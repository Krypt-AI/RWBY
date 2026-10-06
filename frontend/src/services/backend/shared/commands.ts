import type { SiteAction } from '../../../lib/siteReducer'
import { SLICES, type Slice } from './siteQueries'

/** One API call (a function in …_api.sql) and the slices it changes. */
type Command = {
  fn: string
  args: Record<string, unknown>
  slices: Slice[]
}

const command = (fn: string, args: Record<string, unknown>, ...slices: Slice[]): Command => ({ fn, args, slices })

/** The backend call for a site action, or null for actions that only change local state. */
export function toCommand(action: SiteAction): Command | null {
  switch (action.type) {
    case 'site/update':
      return null
    case 'site/reset':
      // The moderator's time zone puts the seeded sessions on their local evenings.
      return command('reset_site', { p_time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone }, ...SLICES)

    case 'announcement/update':
      return command(
        'update_announcement',
        { p_text: action.patch.text ?? null, p_visible: action.patch.visible ?? null },
        'settings',
      )
    case 'stream/update':
      return command(
        'update_stream',
        {
          p_title: action.patch.title ?? null,
          p_host: action.patch.host ?? null,
          p_url: action.patch.url ?? null,
          p_is_live: action.patch.isLive ?? null,
        },
        'settings',
      )

    case 'schedule/add': {
      const { id, title, category, startsAt } = action.session
      return command(
        'add_session',
        { p_id: id, p_title: title, p_category: category, p_starts_at: startsAt },
        'schedule',
      )
    }
    case 'schedule/remove':
      return command('remove_session', { p_id: action.id }, 'schedule')

    case 'chat/send':
      return command(
        'send_chat_message',
        { p_id: action.id, p_text: action.text, p_as_moderator: action.fromModerator },
        'chat',
      )
    case 'chat/remove':
      return command('remove_chat_message', { p_id: action.id }, 'chat')
    case 'chat/togglePin':
      return command('toggle_chat_pin', { p_id: action.id }, 'chat')
    case 'chat/clear':
      return command('clear_chat', {}, 'chat')

    case 'poll/vote':
      return command('cast_vote', { p_category: action.category, p_option_id: action.optionId }, 'polls')
    case 'poll/update':
      return command(
        'update_poll',
        { p_category: action.category, p_title: action.patch.title ?? null, p_is_open: action.patch.isOpen ?? null },
        'polls',
      )
    case 'poll/addOption':
      return command(
        'add_poll_option',
        { p_id: action.id, p_category: action.category, p_title: action.title, p_note: action.note },
        'polls',
      )
    case 'poll/removeOption':
      return command('remove_poll_option', { p_option_id: action.optionId }, 'polls')
    case 'poll/resetVotes':
      return command('reset_poll_votes', { p_category: action.category }, 'polls')
    case 'anime/startSeason':
      return command(
        'start_anime_season',
        { p_year: action.season.year, p_season: action.season.name, p_title: action.title, p_shows: action.shows },
        'polls',
      )

    case 'lfg/post': {
      const { id, game, mode, rank, roles, slots, note } = action.post
      return command(
        'post_lfg',
        { p_id: id, p_game: game, p_mode: mode, p_rank: rank, p_roles: roles, p_slots: slots, p_note: note },
        'lfg',
      )
    }
    case 'lfg/join':
      return command('set_lfg_join', { p_post_id: action.id, p_joining: action.joining }, 'lfg')
    case 'lfg/remove':
      return command('remove_lfg_post', { p_post_id: action.id }, 'lfg')
    case 'lfg/clear':
      return command('clear_lfg', {}, 'lfg')

    case 'music/update':
      return command('update_playlist', { p_url: action.patch.playlistUrl ?? '' }, 'settings')
    case 'track/add': {
      const { id, title, artist, url } = action.track
      return command('add_track', { p_id: id, p_title: title, p_artist: artist, p_url: url }, 'tracks')
    }
    case 'track/like':
      return command('set_track_like', { p_track_id: action.id, p_liking: action.liking }, 'tracks')
    case 'track/remove':
      return command('remove_track', { p_id: action.id }, 'tracks')

    // The server acts for the signed-in caller, so member ids aren't sent.
    case 'room/join':
      return command('join_room', { p_game: action.game }, 'rooms')
    case 'room/leave':
      return command('leave_room', { p_game: action.game }, 'rooms')
    case 'room/setStart':
      return command('set_room_start', { p_game: action.game, p_starts_at: action.startsAt }, 'rooms')
    case 'room/pickEnemy':
      return command('pick_enemy', { p_game: action.game, p_hero: action.hero }, 'rooms')
    case 'room/unpickEnemy':
      return command('unpick_enemy', { p_game: action.game, p_hero: action.hero }, 'rooms')
    case 'room/clearPicks':
      return command('clear_enemy_picks', { p_game: action.game }, 'rooms')
    case 'room/reset':
      return command('reset_room', { p_game: action.game }, 'rooms')
  }
}
