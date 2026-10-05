# Roadmap

How RWBY Afterlight gets from a single-browser demo to a shared community site. Stages run in order. Each one says
what "done" means and which decisions it needs first.

## Where things stand (2026-10-05)

- Built and working locally: game guides with live MLBB stats, game rooms with a start-time countdown and an MLBB
  counter-pick helper, the seasonal anime poll, the squad board, music, the live stream page and votes.
- Not shipped: `main` is one commit ahead of GitHub (the Vercel setup), and the 2026-10-05 features are committed on
  the `feat/live-stats-rooms-anime` branch but not merged or pushed.
- All community data (chat, squads, songs, votes, game rooms, moderator changes) lives in each visitor's browser, so
  nothing is shared between people yet.
- No automated tests, lint or CI.

## Stage 1: Ship what's built (small)

- [ ] **1a.** Commit the 2026-10-05 features on a feature branch, review them, then merge to `main`.
- [ ] **1b.** Clean up the abandoned GitHub Pages attempt: delete the untracked `.github/workflows/deploy.yml` (never
  commit it) and decide whether to keep the no-op `basename` in [App.tsx](../frontend/src/App.tsx).
- [ ] **1c.** Push `main`, import the repo into Vercel and set `VITE_MOD_PASSCODE` (see "Deploy (Vercel)" in the
  root README).
- [ ] **1d.** Check production:
  - live MLBB stats load on the Vercel domain
  - refreshing a deep link works
  - the art and phone layout look right

**Done when:** the public URL works end to end. Community data is still saved per browser.

## Stage 2: Shared backend (large)

**Decision first:** approve Supabase (recommended) and choose a sign-in method.

- [ ] **2a. Safety net first:** Vitest tests for the reducer, counter scoring, room phases and season maths; ESLint
  and Prettier; optionally CI on pull requests.
- [ ] **2b.** Supabase project, schema and row-level security from [database/README.md](../database/README.md),
  including the room tables: 5 seats, 5 picks and one vote per user per poll.
- [ ] **2c.** Real sign-in, with a moderator role replacing the passcode. Discord suits a gaming group; a magic link
  is the alternative.
- [ ] **2d.** Save one change at a time instead of the whole site state, behind the existing hooks (`usePoll`,
  `useLfg`, `useGameRoom`…) so pages barely change. The database computes vote, like and join counts.
- [ ] **2e.** Live updates for chat, votes, squad joins and rooms (seats, start time, enemy picks), plus a "who's in
  the room" indicator.
- [ ] **2f.** Seed the database from [seed.ts](../frontend/src/lib/seed.ts), stop storing site data in the browser,
  and fix the docs that call `storage.ts` the only swap point (the "Swap point" section of
  [backend/README.md](../backend/README.md) and two notes in the root README).

**Done when:** two friends on different devices see the same room, draft, chat and votes live, and the server
enforces moderator rules.

## Stage 3: Data integrations (medium)

- [ ] **3a. MyAnimeList lineup:** a Vercel function fetches MAL's season list with a client id kept on the server and
  caches it for a day. A MAL lineup source (see [seasonalAnime.ts](../frontend/src/services/seasonalAnime.ts)) then
  switches on "Connect MyAnimeList". Doesn't need the backend.
- [ ] **3b. Automatic season rollover:** a scheduled job opens the new poll on 1 Jan, Apr, Jul and Oct, and archives
  the old results. Needs 2b.
- [ ] **3c. Proxy Rone Arena through a cached Vercel function:** one upstream call per 10 minutes for everyone, and
  one place to swap sources if it goes down. Doesn't need the backend.
- [ ] **3d.** A scheduled `data:mlbb` run that opens a pull request when heroes or counter relations change.
- [ ] **3e. Valorant live stats (decision):** keep the snapshot and links (recommended), or use Riot's API, which
  needs an approved production key and our own match aggregation.

## Stage 4: Rooms and draft v2 (medium, needs Stage 2)

- [ ] **4a. Full draft board:** ally picks and bans (both dropped from suggestions), team synergy from Moonton's
  "pairs well with" data, and hints when the team is missing a role.
- [ ] **4b.** An optional shared draft pick timer, alongside the start-time countdown.
- [ ] **4c.** Rooms opened from squad posts (several per game), a ready check and room chat.
- [ ] **4d.** Reminders before the start time through a Discord webhook or browser notifications, plus a calendar
  (.ics) export.

## Stage 5: Polish and launch (small to medium)

- [ ] **5a. Performance:** split the 307 KB bundle by page so the hero data loads only in the room, and convert the
  art to WebP or AVIF.
- [ ] **5b.** Accessibility checks on the hero grid and countdown, security headers in
  [vercel.json](../frontend/vercel.json), error monitoring and a health check for the live feed.
- [ ] **5c.** README screenshots, a portfolio case study, an updated [Documentation.docx](Documentation.docx), and a
  custom domain if wanted.

## Order

1, then 2, then 3 and 4 in either order, then 5. Items 3a and 3c can fill gaps during Stage 2.

## Open decisions

In the order they block work:

1. The GitHub Pages leftovers (1b).
2. Supabase and the sign-in method (Stage 2).
3. GitHub workflows for CI and the snapshot refresh (2a, 3d).
4. Vercel functions for the two proxies (3a, 3c).
5. The Valorant data source (3e).
