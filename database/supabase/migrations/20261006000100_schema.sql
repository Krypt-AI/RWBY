-- Tables for everything the community shares. Shapes mirror frontend/src/lib/types.ts.
-- Clients never write these tables directly: every change goes through an API function
-- (see 20261006000600_api.sql), and counts (votes, likes, joins) are kept by triggers.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.category as enum ('game', 'music', 'anime', 'movie');
create type public.game_id as enum ('mlbb', 'valorant');
create type public.season_name as enum ('winter', 'spring', 'summer', 'fall');
create type public.user_role as enum ('member', 'moderator');

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------

-- One row per signed-in user, created on first sign-in (see 20261006000200_auth.sql).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  avatar_url text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Site settings: announcement banner, stream and shared playlist (single row)
-- ---------------------------------------------------------------------------

create table public.site_settings (
  id boolean primary key default true check (id),
  announcement_text text not null default '' check (char_length(announcement_text) <= 200),
  announcement_visible boolean not null default false,
  stream_title text not null default '' check (char_length(stream_title) <= 120),
  stream_host text not null default '' check (char_length(stream_host) <= 60),
  stream_url text not null default '' check (char_length(stream_url) <= 500),
  stream_is_live boolean not null default false,
  playlist_url text not null default '' check (char_length(playlist_url) <= 500),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Schedule
-- ---------------------------------------------------------------------------

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  category public.category not null,
  starts_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index sessions_starts_at_idx on public.sessions (starts_at);

create table public.rsvps (
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create index rsvps_user_id_idx on public.rsvps (user_id);

-- ---------------------------------------------------------------------------
-- Chat
-- ---------------------------------------------------------------------------

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  author_name text not null check (char_length(author_name) between 1 and 24),
  text text not null check (char_length(text) between 1 and 280),
  from_moderator boolean not null default false,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index chat_messages_created_at_idx on public.chat_messages (created_at desc);
-- Only one message can be pinned at a time.
create unique index chat_messages_one_pinned_idx on public.chat_messages (pinned) where pinned;

-- ---------------------------------------------------------------------------
-- Polls: one per category, each with options and one ballot per user
-- ---------------------------------------------------------------------------

create table public.polls (
  category public.category primary key,
  title text not null check (char_length(title) between 1 and 120),
  is_open boolean not null default true,
  -- Bumped whenever votes are reset, so clients drop ballots from earlier rounds.
  round integer not null default 1 check (round >= 1),
  -- The season the options air in. Only the seasonal anime poll has one.
  season_year smallint,
  season_name public.season_name,
  check ((season_year is null) = (season_name is null))
);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  category public.category not null references public.polls (category) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  note text not null default '' check (char_length(note) <= 120),
  -- Kept by a trigger on ballots.
  votes integer not null default 0 check (votes >= 0),
  -- clock_timestamp keeps insertion order for options added in one transaction.
  created_at timestamptz not null default clock_timestamp(),
  -- Lets ballots check that their option belongs to the poll they are cast in.
  unique (category, id)
);

create table public.ballots (
  category public.category not null references public.polls (category) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  option_id uuid not null,
  cast_at timestamptz not null default now(),
  primary key (category, user_id),
  foreign key (category, option_id) references public.poll_options (category, id) on delete cascade
);

create index ballots_option_id_idx on public.ballots (category, option_id);
create index ballots_user_id_idx on public.ballots (user_id);

-- ---------------------------------------------------------------------------
-- Squad board ("looking for group")
-- ---------------------------------------------------------------------------

create table public.lfg_posts (
  id uuid primary key default gen_random_uuid(),
  game text not null check (game in ('mlbb', 'valorant', 'other')),
  mode text not null check (char_length(mode) between 1 and 40),
  rank text not null default '' check (char_length(rank) <= 24),
  roles text[] not null default '{}' check (cardinality(roles) <= 8),
  slots smallint not null check (slots between 1 and 4),
  -- Kept by a trigger on lfg_joins. The check rejects a join once the squad is full.
  joined smallint not null default 0 check (joined between 0 and slots),
  note text not null default '' check (char_length(note) <= 140),
  -- Null for seeded posts that no signed-in user wrote.
  author_id uuid references public.profiles (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 24),
  created_at timestamptz not null default now()
);

create index lfg_posts_created_at_idx on public.lfg_posts (created_at desc);

create table public.lfg_joins (
  post_id uuid not null references public.lfg_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index lfg_joins_user_id_idx on public.lfg_joins (user_id);

-- ---------------------------------------------------------------------------
-- Music queue
-- ---------------------------------------------------------------------------

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  artist text not null check (char_length(artist) between 1 and 80),
  url text not null default '' check (char_length(url) <= 500),
  added_by_id uuid references public.profiles (id) on delete set null,
  added_by text not null check (char_length(added_by) between 1 and 24),
  -- Kept by a trigger on track_likes.
  likes integer not null default 0 check (likes >= 0),
  created_at timestamptz not null default clock_timestamp()
);

create index tracks_created_at_idx on public.tracks (created_at);

create table public.track_likes (
  track_id uuid not null references public.tracks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  liked_at timestamptz not null default now(),
  primary key (track_id, user_id)
);

create index track_likes_user_id_idx on public.track_likes (user_id);

-- ---------------------------------------------------------------------------
-- Game rooms: one lobby per game, with up to 5 members and 5 enemy picks
-- ---------------------------------------------------------------------------

create table public.game_rooms (
  game public.game_id primary key,
  -- Planned start time, or null until a member sets one.
  starts_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.room_members (
  id uuid primary key default gen_random_uuid(),
  game public.game_id not null references public.game_rooms (game) on delete cascade,
  -- Null for seeded members that no signed-in user is behind.
  user_id uuid references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  joined_at timestamptz not null default clock_timestamp(),
  unique (game, user_id)
);

create index room_members_game_idx on public.room_members (game, joined_at);

create table public.room_enemy_picks (
  game public.game_id not null references public.game_rooms (game) on delete cascade,
  hero text not null check (char_length(hero) between 1 and 40),
  picked_at timestamptz not null default clock_timestamp(),
  primary key (game, hero)
);
