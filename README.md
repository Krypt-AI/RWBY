# RWBY Afterlight

A fan-run, RWBY-themed friends community: game guides with live MLBB stats and every meta lineup of the patch
(MLBB, Valorant), game rooms with a start-time countdown and a recommended five-player lineup built around each
member's role and favourites (counter-aware for MLBB, by map for Valorant), a solo queue counter-pick board, a squad
finder, a shared music playlist, a live stream and community votes, including a seasonal anime poll.

## Project structure

```
RWBY/
  frontend/     React + Vite app
  backend/      API reference and tests for the Supabase backend, see backend/README.md
  database/     Supabase schema, security, API functions and seed, see database/README.md
  docs/         project documentation
  package.json  root shortcuts that forward to frontend/ and backend/
```

## Run it

From the `RWBY/` folder (shortcuts forward to `frontend/` and `backend/`):

```bash
npm run install:all   # first time only
npm run dev           # http://localhost:5173
npm run build         # type-check + production build to frontend/dist/
npm run preview       # serve the build at http://localhost:4173
npm test              # backend tests: the real migrations on an in-process Postgres
```

The same scripts also work directly inside `frontend/` and `backend/` (`npm install`, `npm run dev`, ...).

Without Supabase settings the site runs as a **local demo**: everything works, but data stays in your browser and
moderator mode uses a passcode. To share data between people, connect a Supabase project (see
[database/README.md](database/README.md#set-up-a-supabase-project)) and put its settings in `frontend/.env.local`
(copy `frontend/.env.example`).

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

Then add the environment variables (**Settings → Environment Variables**):

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | The project URL (Supabase dashboard, **Project Settings**) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The project's publishable key, from **Project Settings → API Keys** (the legacy anon key also works) |

Both are safe to ship to the browser: row-level security and the API functions decide what anyone can do. Vite builds
them into the site's JavaScript, so redeploy after changing them. Add your Vercel address to Supabase's redirect URLs
too (step 4 in [database/README.md](database/README.md#set-up-a-supabase-project)), or Discord sign-in can't return to
the site.

Without them, the deployed site runs as the local demo. Its passcode then comes from `VITE_MOD_PASSCODE` and defaults
to `beacon`, which anyone can read in this README.

After setup, each push to `main` deploys to production, and every other branch gets its own preview URL.
`frontend/vercel.json` serves `index.html` for every route, so refreshing a deep link such as `/games/mlbb` loads the app
instead of returning a 404.

## Shared data

With Supabase connected, everyone sees the same site, live: chat, votes, squad posts and joins, songs and likes, RSVPs,
game rooms (seats, start times, enemy picks) and every moderator change. Reading needs no account. Taking part asks
for a Discord sign-in. Each change shows at once for the person who made it and reaches everyone else through
Supabase Realtime. If the server refuses one (say the room filled up a moment earlier), the site says why and puts
things back. How it works, and what each role may do: [backend/README.md](backend/README.md).

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

## Members and moderators

- **Visitors** can read everything. Trying to take part opens a "sign in with Discord" prompt.
- **Members** (signed in): chat, vote (one vote per poll, changeable while open), RSVP,
  post and join squads (and close your own posts), add and like songs, and join a game room (five seats).
  Room members choose their own role and up to three favourites, set the start time, and enter the enemy picks
  for the MLBB lineup or pick the map for Valorant.
  Your Discord name is your display name; change it from the account button in the sidebar.
- **Moderators**: everything a member can do, plus gold-marked controls on each page.
  Moderators can go live or end the stream, set the YouTube/Twitch link, pin or delete chat messages,
  open, close or reset polls, add or remove options, load the current anime season's lineup, edit the schedule
  and the banner, set the shared playlist, remove any squad post or song, clear the squad board, run or reset
  any game room, and reset the site.

Moderators are members whose profile has the moderator role ([how to grant it](database/README.md#set-up-a-supabase-project)).
They switch the gold controls on with **Moderator mode** in the sidebar (or the lock icon on mobile). The mode is
stored per tab, so a moderator can keep a normal tab and a moderator tab side by side. The server checks the role on
every moderator action, so the button only changes the view.

In the local demo there are no accounts: **Moderator login** asks for the `VITE_MOD_PASSCODE` passcode (default
`beacon`). That passcode ships in the site's JavaScript, so it's a demo gate, not access control.

## Live stats

MLBB win, pick and ban rates come live from [Rone Arena](https://arena.rone.dev), a free community API that mirrors
the statistics in Moonton's in-game academy (last 7 days, filterable by rank, refreshed daily at the source). The
browser calls it directly: no key, no backend. Responses are cached for 10 minutes and an open page refreshes every
10 minutes. The live rates fill the tier list, the headline tiles and a leaderboard. Rone Arena is unofficial, so if
it stops answering, the guide falls back to its dated snapshot and says so.

Valorant has no public stats API that a browser can call, so its guide shows the patch snapshot plus links to live
stat pages (`liveLinks` in the game file). Feeds are registered per game in `frontend/src/services/liveStats.ts`.

## Game rooms and lineups

Each game has a room at `/games/:game/room`: five seats, a start time with a live countdown (quick picks of
+15 min, +30 min and +1 hr, or any date and time), and a recommended lineup. Everyone in the room can choose
their role (or Fill) and up to three favourite heroes or agents, and the roster shows what each member plays.

**MLBB: a recommended lineup, one hero per lane.** Members who chose a lane get it, first to join first; everyone
else fills an open lane, preferably one their favourites play. Each lane then gets its best hero:

- Open lanes take this patch's strongest pick: live win rate plus tier (the patch snapshot's win rates when the
  feed is down). With nobody in the room, that's the meta lineup.
- A member's lane takes their favourites first, because comfort beats the meta. A favourite only sits out when an
  enemy pick counters it (an official weakness, or a clearly bad live matchup), and then their next favourite comes
  in before any other hero. Among favourites the better matchup wins, and their order settles near-ties. The lane
  says why a top favourite sits out, and the strongest counters still show as alternatives.
- As the enemy picks are entered, every lane re-ranks using this week's matchup stats from Rone Arena (how much each
  hero moves win rate against each enemy) plus Moonton's official counter list. No hero is used twice.

Each lane shows its reasons, a counter rating and two alternatives. The helper also reads the enemy draft for
healing, dive, magic, physical and crowd-control threats and lists items that answer them. Hero scoring lives in
`frontend/src/lib/counterPicks.ts`, and seating and the lineup in `frontend/src/lib/lineupPlanner.ts`.

**MLBB: solo queue.** Playing without a squad, switch the room to **Solo queue**: your own board with your lane,
favourites, the enemy's picks and your teammates' picks, kept in this browser (no sign-in, nothing shared). It ranks
your five best picks with the same scoring, leaves out heroes either team already has, and reads the enemy threats.

**Valorant: lineups by map.** The room lists the guide's pro comps by map (`lineups` in the game file) plus the
ranked comps. A room member picks the map you landed on and one of its comps, and everyone in the room sees the same
one. The squad takes its slots by favourite agent first, then by role, then whoever is left fills. The comp that
suits the squad best on that map is marked.

If the matchup stats can't be reached, counters come from Moonton's official counter relations, bundled in
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

The lineups are real ones from the current patch, each with its record. MLBB's pro lineups come from the MPL
Indonesia and Philippines Season 18 drafts on 2.2.16 (Liquipedia). No pro team repeated a full lineup, so each is a
hero pair drafted together in 7+ games, shown through its most typical winning draft. Valorant's are every comp
played twice or more on one map at Champions 2026 (vlr.gg), plus the most played and best-winning ranked comps
(metabot.gg). The Lineups tab lists them all, filterable by map or source. Refresh them with the patch.

To add a game, create a new file with the `GameGuide` shape (`data/games/types.ts`), add its id to `GameId`
in `lib/types.ts`, give it a room in the seed (`lib/seed.ts`), and register it in `data/games/index.ts`.
For the shared backend, add a migration that extends the `game_id` type, allows it in `lfg_posts.game`, inserts
its `game_rooms` row and adds its role ids to `private.room_roles()`, and add the room to `private.seed_site()`.
The hub, routes and squad board pick it up automatically. A `draft` kit gives its room the counter-aware lineup;
without one, the room shows the guide's lineups.

## Frontend layout

```
frontend/src/
  App.tsx            providers + routes
  main.tsx           entry, global styles
  layout/            app shell, nav config, moderator route guard
  pages/             one file per route
  components/        UI building blocks (poll, chat, player, schedule, editors...)
    games/           tier list, live stats bar and leaderboard, lineups, builds, roles, game cards
    rooms/           game room: lobby, countdown, roster, role and favourites, drafts, lineups, solo queue
    anime/           seasonal anime poll card and moderator controls
    squad/           LFG card and form
    music/           playlist embed and song queue
  data/games/        game guide snapshots (one file per game) and the MLBB hero snapshot
  data/anime/        curated seasonal lineups
  hooks/             useSite, useMode, useViewer, useAccount, useNotice, usePoll, useLfg, useTracks,
                     useGameRoom, useSoloDraft, useLiveStats, useMatchups, useDraftRates, useSeasonalPoll, useNow
  lib/               types, seed data, reducer, context providers, rooms, seasons, counter scoring, lineup planner
  services/backend/  data access: the Supabase backend, or the local demo (see backend/README.md)
  services/          also browser storage, live stats feeds, anime lineup source
  utils/             formatting, ids, caching, YouTube/Twitch embed parsing
  styles/            tokens, base, layout, components, pages, games, rooms, community
  assets/images/     RWBY artwork
frontend/scripts/    fetch-mlbb-heroes.mjs (regenerates the MLBB hero snapshot)
```
