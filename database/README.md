# Database (planned)

No database exists yet. Today the whole site state is one JSON object in the browser
(`localStorage` key `rwby.site.v3`), and each visitor's own data sits under `rwby.viewer.v1`.

## Data model to migrate

The shapes are defined in `frontend/src/lib/types.ts`. Planned tables:

| Table | From | Notes |
| --- | --- | --- |
| `announcement`, `stream` | `SiteState.announcement`, `SiteState.stream` | Single-row settings |
| `sessions` + `rsvps` | `Session`, `ViewerState.rsvps` | RSVPs become one row per user and session |
| `chat_messages` | `ChatMessage` | Keep the 200-message cap or paginate |
| `polls`, `poll_options`, `ballots` | `Poll`, `PollOption`, `Ballot` | One ballot per user and poll replaces the per-browser ballot. The seasonal anime poll also stores its season (`year`, `season`) |
| `game_rooms`, `room_members`, `room_enemy_picks` | `GameRoom`, `RoomMember` | One room per game with `starts_at`; at most 5 members and 5 picks per room. Realtime, so the whole squad sees the draft |
| `lfg_posts` + `lfg_joins` | `LfgPost`, `ViewerState.joinedPosts` | `joined` becomes a count of join rows |
| `tracks` + `track_likes` | `Track`, `ViewerState.likedTracks` | `likes` becomes a count of like rows |
| `settings` | `Music.playlistUrl` | Shared playlist link |

## Seed and reference data

- Initial content: `frontend/src/lib/seed.ts`, which becomes the database seed script.
- Game guides (`frontend/src/data/games/`) are versioned, per-patch snapshots. They can stay as files
  in the frontend, or move here if moderators should edit them in the app.
- Live MLBB stats come from the Rone Arena API at runtime and are not stored. The MLBB hero snapshot
  (`mlbbHeroes.ts`) is a generated fallback, not data to migrate.
- Seasonal anime lineups (`frontend/src/data/anime/lineups.ts`) could move here, or come from MyAnimeList once
  that source is connected.
