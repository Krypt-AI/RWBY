# Backend

RWBY Afterlight runs on [Supabase](https://supabase.com): Postgres holds the data, Supabase Auth handles Discord
sign-in, and Supabase Realtime pushes changes to everyone online. There's no server of our own to host. The backend
logic is a set of database functions, the API, defined in
[`…_api.sql`](../database/supabase/migrations/20261006000600_api.sql). This folder holds their tests and this
reference. Tables, setup and schema changes are covered in [database/README.md](../database/README.md).

## How a change travels

1. A page dispatches a site action, such as `poll/vote` (`SiteAction` in `frontend/src/lib/siteReducer.ts`).
2. `SiteContext` applies it right away, so the click feels instant.
3. `frontend/src/services/backend/shared/commands.ts` turns the action into one API call:
   `supabase.rpc('cast_vote', { p_category, p_option_id })`.
4. The function checks who's calling, validates the input and writes. Triggers update the counts.
5. The client reloads the part of the site that changed. Realtime tells every other open copy of the site to reload
   it too.
6. If the server refuses (the room is full, voting closed, not a moderator…), its reason appears in a notice and the
   reload undoes the instant change.

New rows carry the id the browser generated, so the instant copy and the stored row match.

### Local demo mode

Without `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, the site runs exactly as before: the same pages,
with data kept in the visitor's browser and moderator mode behind the demo passcode. `services/backend/index.ts`
picks the mode, so nothing else in the app checks for it.

## Who can do what

| Who | How | Can |
| --- | --- | --- |
| Visitor | Not signed in | Read everything public. Trying to take part opens a "sign in" prompt. |
| Member | Signed in with Discord | Chat, vote, RSVP, post and join squads, add and like songs, join a game room, and run a room they're in (start time, enemy picks). Remove their own squad posts. Rename themselves. |
| Moderator | `profiles.role = 'moderator'` | Everything a member can, plus the moderator tools: stream, banner, playlist, schedule, polls, any squad post or song, any room, and resetting the site. |

The server enforces every rule. The UI hides controls people can't use, but a request that skips the UI gets the same
refusal. The frontend's moderator mode is only a view: switching it on needs a moderator account, and the server
checks the role on every moderator call anyway.

## API

Every function runs as the table owner and checks the caller first. Members are signed-in users; "room members" are
the people in that game's room. Arguments named `p_id` take the client-generated id of a new row.

| Site action | Function | Who | Notes |
| --- | --- | --- | --- |
| *(rename)* | `update_display_name(p_name)` | Member | 1 to 24 characters. Past messages keep the old name. |
| `announcement/update` | `update_announcement(p_text?, p_visible?)` | Moderator | Omitted fields stay as they are. |
| `stream/update` | `update_stream(p_title?, p_host?, p_url?, p_is_live?)` | Moderator | Omitted fields stay as they are. |
| `music/update` | `update_playlist(p_url)` | Moderator | |
| `schedule/add` | `add_session(p_id, p_title, p_category, p_starts_at)` | Moderator | |
| `schedule/remove` | `remove_session(p_id)` | Moderator | Removes its RSVPs. |
| *(RSVP)* | `set_rsvp(p_session_id, p_going)` | Member | |
| `chat/send` | `send_chat_message(p_id, p_text, p_as_moderator)` | Member | 1 to 280 characters. The Mod badge only sticks for moderators. Keeps the newest 200. |
| `chat/remove` | `remove_chat_message(p_id)` | Moderator | |
| `chat/togglePin` | `toggle_chat_pin(p_id)` | Moderator | One pinned message at a time. |
| `chat/clear` | `clear_chat()` | Moderator | |
| `poll/vote` | `cast_vote(p_category, p_option_id)` | Member | Open polls only. Voting again moves the ballot. |
| `poll/update` | `update_poll(p_category, p_title?, p_is_open?)` | Moderator | |
| `poll/addOption` | `add_poll_option(p_id, p_category, p_title, p_note)` | Moderator | |
| `poll/removeOption` | `remove_poll_option(p_option_id)` | Moderator | Removes its ballots. |
| `poll/resetVotes` | `reset_poll_votes(p_category)` | Moderator | Clears ballots and starts a new round. |
| `anime/startSeason` | `start_anime_season(p_year, p_season, p_title, p_shows)` | Moderator | `p_shows`: JSON array of `{ title, note }`. Opens a fresh round. |
| `lfg/post` | `post_lfg(p_id, p_game, p_mode, p_rank, p_roles, p_slots, p_note)` | Member | Keeps the newest 50. |
| `lfg/join` | `set_lfg_join(p_post_id, p_joining)` | Member | Not on your own post. Refuses once the squad is full. |
| `lfg/remove` | `remove_lfg_post(p_post_id)` | Author or moderator | |
| `lfg/clear` | `clear_lfg()` | Moderator | |
| `track/add` | `add_track(p_id, p_title, p_artist, p_url)` | Member | Keeps the newest 100. |
| `track/like` | `set_track_like(p_track_id, p_liking)` | Member | One like per member. |
| `track/remove` | `remove_track(p_id)` | Moderator | |
| `room/join` | `join_room(p_game)` | Member | Five seats. |
| `room/leave` | `leave_room(p_game)` | Member | |
| `room/setStart` | `set_room_start(p_game, p_starts_at)` | Room member or moderator | `null` clears it. |
| `room/pickEnemy` | `pick_enemy(p_game, p_hero)` | Room member or moderator | Five picks, kept in pick order, no repeats. |
| `room/unpickEnemy` | `unpick_enemy(p_game, p_hero)` | Room member or moderator | |
| `room/clearPicks` | `clear_enemy_picks(p_game)` | Room member or moderator | |
| `room/reset` | `reset_room(p_game)` | Moderator | No members, no start time, no picks. |
| `site/reset` | `reset_site(p_time_zone)` | Moderator | Restores the starter content. Accounts stay. Sessions land on the moderator's local evenings. |

Reads go straight to the tables (`supabase.from(...).select(...)`), filtered by row-level security. The selects live
in `frontend/src/services/backend/shared/rows.ts`.

## Frontend side

```
frontend/src/services/backend/
  index.ts            picks the shared backend or the local demo
  types.ts            what both modes provide: site store, viewer store, account service
  local.ts            the local demo (browser storage)
  shared/
    client.ts         the Supabase client
    accountService.ts Discord sign-in and the member's profile
    siteStore.ts      loading, realtime, sending actions, reconciling
    siteQueries.ts    the site's parts ("slices") and how each loads
    commands.ts       site action → API call
    rows.ts           table rows → app types
    viewerStore.ts    the member's own ballots, RSVPs, joins and likes
```

React gets it through `AccountContext` (sign-in, the sign-in prompt), `ModeContext` (moderator view),
`SiteContext` (data and actions), `ViewerContext` (the member's own choices) and `NoticeContext` (refusals).

## Tests

```bash
cd backend
npm install
npm test
```

The tests boot a real Postgres in-process ([PGlite](https://pglite.dev), no Docker), add the few Supabase pieces the
migrations expect (`tests/supabase-stub.sql`), apply the real migrations and seed, then call the API as visitors,
members and moderators, with grants and row-level security in force. The 35 tests cover sign-up, every permission
rule, the counters, the room, squad and chat limits, pick and lineup ordering, privacy of personal rows, and the site
reset. Node 22 or newer.
