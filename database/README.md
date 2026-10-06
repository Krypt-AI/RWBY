# Database

The shared data lives in a [Supabase](https://supabase.com) Postgres database. Everything is defined in SQL under
`supabase/`, so a new project gets the same schema, permissions, API and starter content. How the site talks to it
is in [backend/README.md](../backend/README.md).

## Layout

```
database/supabase/
  config.toml                 Supabase CLI settings (local stack, Discord sign-in)
  seed.sql                    loads the starter content
  migrations/                 applied in order
    …_schema.sql              tables, constraints, indexes
    …_auth.sql                profiles created on first sign-in, caller checks, input checks
    …_security.sql            read access and row-level security
    …_counters.sql            vote, like and join counts, kept by triggers
    …_seed_content.sql        the starter content, also what "Reset everything" restores
    …_api.sql                 the API: one function per site action
    …_realtime.sql            live updates
    …_seed_without_sample_squads.sql
                              the starter content without sample squad posts (replaces …_seed_content.sql's)
    …_room_preferences.sql    each room member's role and favourite heroes or agents
    …_room_lineup_choice.sql  the lineup a room settles on (a Valorant map's comp), shared by everyone in it
```

## Tables

The shapes mirror `frontend/src/lib/types.ts`.

| Table | Holds | Frontend type |
| --- | --- | --- |
| `profiles` | One row per member: display name, Discord avatar, role (`member` or `moderator`) | `Account` |
| `site_settings` | A single row: announcement banner, stream, shared playlist link | `Announcement`, `Stream`, `Music.playlistUrl` |
| `sessions`, `rsvps` | The schedule, and who's going (one row per member and session) | `Session`, `ViewerState.rsvps` |
| `chat_messages` | Live chat, newest 200 kept | `ChatMessage` |
| `polls`, `poll_options`, `ballots` | One poll per category, its options with a vote count, one ballot per member and poll | `Poll`, `PollOption`, `Ballot` |
| `lfg_posts`, `lfg_joins` | The squad board (newest 50), with a join count | `LfgPost`, `ViewerState.joinedPosts` |
| `tracks`, `track_likes` | The song queue (newest 100), with a like count | `Track`, `ViewerState.likedTracks` |
| `game_rooms`, `room_members`, `room_enemy_picks` | One room per game: start time, chosen lineup, members with their role and favourites, enemy picks in pick order | `GameRoom`, `RoomMember` |

What the database guarantees on its own:

- **Counts can't drift.** `poll_options.votes`, `tracks.likes` and `lfg_posts.joined` are kept by triggers, one row
  change at a time, so simultaneous clicks never lose a count.
- **Limits hold under load.** Five seats and five enemy picks per room, a role the game has and at most three
  favourites per member, a squad's open spots, one ballot per member and poll, and one pinned chat message. Room and
  squad changes lock the row first, so two people can't take the last spot.
- **Choices stay private.** Ballots, RSVPs, squad joins and song likes are readable only by their owner. The totals
  stay public.
- **No direct writes.** Visitors and members can read the tables but never write them. Every change goes through an
  API function that checks the caller (see [backend/README.md](../backend/README.md#api)).

## Set up a Supabase project

1. **Create a project** at [supabase.com](https://supabase.com). The free tier is enough for a friends group.
2. **Check the time zone** in `supabase/seed.sql`. It's `'Asia/Kuala_Lumpur'`, so the seeded game nights land on
   Malaysian evenings. Change it if your group lives elsewhere.
3. **Apply the migrations and seed.** With the [Supabase CLI](https://supabase.com/docs/guides/cli), from this folder:

   ```bash
   cd database
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push --include-seed
   ```

   Without the CLI, paste each file from `supabase/migrations/` into the dashboard's **SQL Editor** in order, then
   `supabase/seed.sql`.

   Seed only a new project: the seed replaces all shared content (chat, votes, squad posts) with the starter set.
   For later schema changes, run `npx supabase db push` without `--include-seed`.
4. **Turn on Discord sign-in.**
   1. In the [Discord Developer Portal](https://discord.com/developers/applications), create an application. Under
      **OAuth2**, add the redirect `https://<your-project-ref>.supabase.co/auth/v1/callback` and copy the client ID
      and client secret.
   2. In Supabase, open **Authentication → Providers → Discord**, turn it on and paste both values.
   3. Under **Authentication → URL Configuration**, set the site URL to your Vercel address and add these redirect
      URLs: `https://<your-site>.vercel.app/**` and `http://localhost:5173/**`.
5. **Connect the site.** Copy the project URL and the publishable key (both under **Project Settings**) into the
   frontend environment (see [Deploy](../README.md#deploy-vercel)).
6. **Make yourself a moderator.** Sign in on the site once, so your profile exists, then run in the SQL Editor:

   ```sql
   update public.profiles set role = 'moderator'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

   Moderators get a **Moderator mode** button the next time they open the site. Demote someone with
   `role = 'member'`.

## Local stack (optional)

`npx supabase start` from this folder runs Postgres, Auth and Realtime locally (needs Docker), and
`npx supabase db reset` applies the migrations and seed. Point the frontend at the printed API URL and publishable
key. For Discord sign-in locally, put `SUPABASE_AUTH_DISCORD_CLIENT_ID` and `SUPABASE_AUTH_DISCORD_SECRET` in
`supabase/.env`.

You don't need the stack for the tests: `npm test` in [backend/](../backend/README.md#tests) runs the migrations on
an in-process Postgres.

## Changing the schema

Never edit a migration that has been applied. Add a new one (`npx supabase migration new <name>`), then:

- keep `frontend/src/services/backend/shared/rows.ts` (columns and mappers) and `commands.ts` (API calls) in step;
- if the starter content changes, redefine `private.seed_site()` in the new migration (`create or replace`, starting
  from its latest definition) and update `frontend/src/lib/seed.ts`, which the local demo uses;
- add or adjust tests in `backend/tests/`.

New tables need `enable row level security`, a read policy, and a line in the realtime publication. The access tests
fail when any public table is missing row-level security or the realtime publication.
