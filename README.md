# RWBY Afterlight

A fan-run, RWBY-themed friends community: game meta guides (MLBB, Valorant), a squad finder,
a shared music playlist, live watch-alongs and community votes.

## Run it

From the `RWBY/` folder (shortcuts forward to `frontend/`):

```bash
npm run install:all   # first time only
npm run dev           # http://localhost:5173
npm run build         # type-check + production build to frontend/dist/
npm run preview       # serve the build at http://localhost:4173
```

The same scripts also work directly inside `frontend/` (`npm install`, `npm run dev`, ...).

## Pages

| Route                     | Who        | Purpose                                                          |
| ------------------------- | ---------- | ---------------------------------------------------------------- |
| `/`                       | Everyone   | Home: hero, meta cards, latest squads, top songs, votes, schedule |
| `/games`                  | Everyone   | Game guide hub, game nights, game-night vote                     |
| `/games/:game/:section?`  | Everyone   | `mlbb` or `valorant`; sections `meta` (default), `lineups`, `builds`, `roles` |
| `/squad`                  | Everyone   | Looking-for-group board: post, join, filter by game              |
| `/music`                  | Everyone   | Shared Spotify/YouTube playlist, song queue with likes, song of the week |
| `/live`                   | Everyone   | Stream player, live chat, schedule with RSVP                     |
| `/votes/:category`        | Everyone   | `game`, `music`, `anime`, `manga` or `movie` poll                |
| `/control`                | Moderators | Control room: stream, banner, polls, schedule, reset             |

## User vs moderator mode

- **User** (default): watch, chat, vote (one vote per poll, changeable while open), RSVP,
  post and join squads (and close your own posts), add and like songs.
- **Moderator**: everything a user can do, plus gold-marked controls on each page.
  Moderators can go live or end the stream, set the YouTube/Twitch link, pin or delete chat messages,
  open, close or reset polls, add or remove options, edit the schedule and the banner, set the shared playlist,
  remove any squad post or song, clear the squad board, and reset the site.

Use **Moderator login** in the sidebar (or the lock icon on mobile).
The passcode comes from `VITE_MOD_PASSCODE` (see `frontend/.env.example`) and defaults to `beacon`.
Mode is stored per tab, so you can open a user tab and a moderator tab side by side and watch changes sync.

> **Security note:** the passcode and all data live in the browser (`localStorage`). This is a demo gate,
> not access control. For real moderators, replace `src/services/storage.ts` with a backend
> (e.g. Supabase with auth roles and row-level security).

## Updating the game guides

The meta guides are static, dated snapshots, not live feeds. Each game is one typed file:

- `frontend/src/data/games/mlbb.ts`: MLBB, Season 42, patch 2.2.16
- `frontend/src/data/games/valorant.ts`: Valorant, patch 13.06

Both were taken on 2026-10-05. When a patch lands, edit the tiers, lineups, builds, equipment and notes, then bump `patch` and `asOf`
and update `sources`. Leave out any rate the sources don't publish, and the tier list shows a dash.
To add a game, create a new file with the `GameGuide` shape (`data/games/types.ts`), add its id to `GameId`
in `lib/types.ts`, and register it in `data/games/index.ts`. The hub, routes and squad board pick it up automatically.

## Frontend layout

```
frontend/src/
  App.tsx            providers + routes
  main.tsx           entry, global styles
  layout/            app shell, nav config, moderator route guard
  pages/             one file per route
  components/        UI building blocks (poll, chat, player, schedule, editors...)
    games/           tier list, lineups, builds, roles, game cards
    squad/           LFG card and form
    music/           playlist embed and song queue
  data/games/        game guide snapshots (one file per game)
  hooks/             useSite, useMode, useViewer, usePoll, useLfg, useTracks
  lib/               types, seed data, reducer, context providers
  services/          persistence (localStorage, the swap point for a backend)
  utils/             formatting, ids, YouTube/Twitch embed parsing
  styles/            tokens, base, layout, components, pages
  assets/images/     RWBY artwork
```
