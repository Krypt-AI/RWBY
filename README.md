# RWBY Afterlight

A fan-run, RWBY-themed friends community: game guides with live MLBB stats (MLBB, Valorant), game rooms with
a start-time countdown and an MLBB counter-pick helper, a squad finder, a shared music playlist, a live stream and
community votes, including a seasonal anime poll.

## Project structure

```
RWBY/
  frontend/     React + Vite app (everything that runs today)
  backend/      planned API: not built yet, see backend/README.md
  database/     planned schema: not built yet, see database/README.md
  docs/         project documentation
  package.json  root shortcuts that forward to frontend/
```

## Run it

From the `RWBY/` folder (shortcuts forward to `frontend/`):

```bash
npm run install:all   # first time only
npm run dev           # http://localhost:5173
npm run build         # type-check + production build to frontend/dist/
npm run preview       # serve the build at http://localhost:4173
```

The same scripts also work directly inside `frontend/` (`npm install`, `npm run dev`, ...).

## Deploy (Vercel)

The site is a static build hosted on [Vercel](https://vercel.com). To set it up, import this repo once
(**Add New → Project**) with these settings:

| Setting          | Value           |
| ---------------- | --------------- |
| Root Directory   | `frontend`      |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Node.js Version  | 20.x or newer   |

Then add the environment variable `VITE_MOD_PASSCODE` with your own passcode (**Settings → Environment Variables**).
If it's unset, the passcode is `beacon`, which anyone can read in this README. Vite builds the value into the
site's JavaScript, so you have to redeploy after changing it, and anyone who reads that JavaScript can still find it
(see the security note below).

After setup, each push to `main` deploys to production, and every other branch gets its own preview URL.
`frontend/vercel.json` serves `index.html` for every route, so refreshing a deep link such as `/games/mlbb` loads the app
instead of returning a 404.

> **Shared features are not shared yet.** All data still lives in each visitor's own browser. Pages, guides, live MLBB
> stats and the stream and playlist embeds work for everyone. But chat, squad posts, songs, votes, game rooms (seats,
> start times, enemy picks) and moderator changes stay on the device where they were made. Sharing them needs the
> backend planned in `backend/` and `database/`.

## Pages

| Route                     | Who        | Purpose                                                          |
| ------------------------- | ---------- | ---------------------------------------------------------------- |
| `/`                       | Everyone   | Home: hero, meta cards, latest squads, top songs, votes, schedule |
| `/games`                  | Everyone   | Game guide hub, game rooms, game nights, game-night vote         |
| `/games/:game/:section?`  | Everyone   | `mlbb` or `valorant`; sections `meta` (default), `lineups`, `builds`, `roles`, `room` |
| `/squad`                  | Everyone   | Looking-for-group board: post, join, filter by game              |
| `/music`                  | Everyone   | Shared Spotify/YouTube playlist, song queue with likes, song of the week |
| `/live`                   | Everyone   | Stream player, live chat, schedule with RSVP                     |
| `/votes/:category`        | Everyone   | `game`, `music`, `anime` (seasonal) or `movie` poll              |
| `/control`                | Moderators | Control room: stream, banner, polls, game rooms, schedule, reset |

## User vs moderator mode

- **User** (default): watch, chat, vote (one vote per poll, changeable while open), RSVP,
  post and join squads (and close your own posts), add and like songs, and join a game room (five seats).
  Room members set the start time and enter the enemy picks for the MLBB counter helper.
- **Moderator**: everything a user can do, plus gold-marked controls on each page.
  Moderators can go live or end the stream, set the YouTube/Twitch link, pin or delete chat messages,
  open, close or reset polls, add or remove options, load the current anime season's lineup, edit the schedule
  and the banner, set the shared playlist, remove any squad post or song, clear the squad board, run or reset
  any game room, and reset the site.

Use **Moderator login** in the sidebar (or the lock icon on mobile).
The passcode comes from `VITE_MOD_PASSCODE` (see `frontend/.env.example`) and defaults to `beacon`.
Mode is stored per tab, so you can open a user tab and a moderator tab side by side and watch changes sync.

> **Security note:** the passcode and all data live in the browser (`localStorage`). This is a demo gate,
> not access control. For real moderators, replace `frontend/src/services/storage.ts` with a backend
> (e.g. Supabase with auth roles and row-level security). The plan is in `backend/` and `database/`.

## Live stats

MLBB win, pick and ban rates come live from [Rone Arena](https://arena.rone.dev), a free community API that mirrors
the statistics in Moonton's in-game academy (last 7 days, filterable by rank, refreshed daily at the source). The
browser calls it directly: no key, no backend. Responses are cached for 10 minutes and an open page refreshes every
10 minutes. The live rates fill the tier list, the headline tiles and a leaderboard. Rone Arena is unofficial, so if
it stops answering, the guide falls back to its dated snapshot and says so.

Valorant has no public stats API that a browser can call, so its guide shows the patch snapshot plus links to live
stat pages (`liveLinks` in the game file). Feeds are registered per game in `frontend/src/services/liveStats.ts`.

## Game rooms and counter picks

Each game has a room at `/games/:game/room`: five seats, a start time with a live countdown (quick picks of
+15 min, +30 min and +1 hr, or any date and time), and for MLBB a counter-pick helper. Room members enter the
enemy picks; suggestions re-rank after each pick using this week's matchup stats from Rone Arena (how much each
hero moves win rate against each enemy) plus Moonton's official counter list. Overall win rate and tier only break
ties. The helper also reads the enemy draft for healing, dive, magic, physical and crowd-control threats and lists
items that answer them. The scoring lives in `frontend/src/lib/counterPicks.ts`.

If the matchup stats can't be reached, suggestions come from Moonton's official counter relations, bundled in
`frontend/src/data/games/mlbbHeroes.ts`. Regenerate that snapshot when a patch lands:

```bash
npm --prefix frontend run data:mlbb
```

## Seasonal anime poll

The anime poll is the anime of the season: its options are the shows airing that season (Fall 2026 to start). When a
new season begins, a moderator clicks **Load <season> lineup** on `/votes/anime` to open a fresh poll. Lineups are
curated in `frontend/src/data/anime/lineups.ts` for now.

MyAnimeList is planned as the lineup source. `frontend/src/services/seasonalAnime.ts` defines the `LineupSource` shape
that a MyAnimeList source would implement (`GET /v2/anime/season/{year}/{season}`). The MyAnimeList API needs a client
id and doesn't accept browser requests, so it needs a small proxy, such as a Vercel function.

## Updating the game guides

Tier placements, lineups, builds and notes are static, dated snapshots. Each game is one typed file:

- `frontend/src/data/games/mlbb.ts`: MLBB, Season 42, patch 2.2.16
- `frontend/src/data/games/valorant.ts`: Valorant, patch 13.06

Both were taken on 2026-10-05. When a patch lands, edit the tiers, lineups, builds, equipment and notes, then bump `patch` and `asOf`
and update `sources`. Leave out any rate the sources don't publish, and the tier list shows a dash.
To add a game, create a new file with the `GameGuide` shape (`data/games/types.ts`), add its id to `GameId`
in `lib/types.ts`, give it a room in the seed (`lib/seed.ts`), and register it in `data/games/index.ts`.
The hub, routes and squad board pick it up automatically. A `draft` kit adds the counter helper to its room.

## Frontend layout

```
frontend/src/
  App.tsx            providers + routes
  main.tsx           entry, global styles
  layout/            app shell, nav config, moderator route guard
  pages/             one file per route
  components/        UI building blocks (poll, chat, player, schedule, editors...)
    games/           tier list, live stats bar and leaderboard, lineups, builds, roles, game cards
    rooms/           game room: lobby, countdown, roster, enemy draft, counter suggestions
    anime/           seasonal anime poll card and moderator controls
    squad/           LFG card and form
    music/           playlist embed and song queue
  data/games/        game guide snapshots (one file per game) and the MLBB hero snapshot
  data/anime/        curated seasonal lineups
  hooks/             useSite, useMode, useViewer, usePoll, useLfg, useTracks, useGameRoom,
                     useLiveStats, useMatchups, useSeasonalPoll, useNow
  lib/               types, seed data, reducer, context providers, rooms, seasons, counter-pick scoring
  services/          persistence (localStorage, the swap point for a backend), live stats feeds, anime lineup source
  utils/             formatting, ids, caching, YouTube/Twitch embed parsing
  styles/            tokens, base, layout, components, pages, games, rooms, community
  assets/images/     RWBY artwork
frontend/scripts/    fetch-mlbb-heroes.mjs (regenerates the MLBB hero snapshot)
```
