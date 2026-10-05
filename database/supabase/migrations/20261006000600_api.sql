-- The backend API. One function per site action (SiteAction in frontend/src/lib/siteReducer.ts),
-- called with supabase.rpc(). Each one runs as the table owner, so it checks the caller itself:
--   private.require_user()       any signed-in member
--   private.require_moderator()  moderators only
-- Create functions take the id the client already generated, so the optimistic copy and the
-- stored row share one id.
--
-- Supabase blocks DELETE without WHERE on API requests, hence `where true` when clearing a table.

-- ===========================================================================
-- Account
-- ===========================================================================

create function public.update_display_name(p_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  update public.profiles
  set display_name = private.required_text(p_name, 'Name', 24)
  where id = uid;
end;
$$;

-- ===========================================================================
-- Announcement, stream and playlist (moderators)
-- ===========================================================================

-- Null arguments leave that field as it is.
create function public.update_announcement(p_text text default null, p_visible boolean default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  update public.site_settings
  set announcement_text = case when p_text is null then announcement_text else private.optional_text(p_text, 'Announcement', 200) end,
      announcement_visible = coalesce(p_visible, announcement_visible),
      updated_at = now()
  where id;
end;
$$;

-- Null arguments leave that field as it is.
create function public.update_stream(
  p_title text default null,
  p_host text default null,
  p_url text default null,
  p_is_live boolean default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  update public.site_settings
  set stream_title = case when p_title is null then stream_title else private.required_text(p_title, 'Stream title', 120) end,
      stream_host = case when p_host is null then stream_host else private.optional_text(p_host, 'Host', 60) end,
      stream_url = case when p_url is null then stream_url else private.optional_text(p_url, 'Stream link', 500) end,
      stream_is_live = coalesce(p_is_live, stream_is_live),
      updated_at = now()
  where id;
end;
$$;

create function public.update_playlist(p_url text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  update public.site_settings
  set playlist_url = private.optional_text(p_url, 'Playlist link', 500),
      updated_at = now()
  where id;
end;
$$;

-- ===========================================================================
-- Schedule
-- ===========================================================================

create function public.add_session(p_id uuid, p_title text, p_category public.category, p_starts_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  insert into public.sessions (id, title, category, starts_at)
  values (coalesce(p_id, gen_random_uuid()), private.required_text(p_title, 'Session title', 80), p_category, p_starts_at);
end;
$$;

create function public.remove_session(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  delete from public.sessions where id = p_id;
end;
$$;

create function public.set_rsvp(p_session_id uuid, p_going boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  if not p_going then
    delete from public.rsvps where session_id = p_session_id and user_id = uid;
    return;
  end if;
  if not exists (select 1 from public.sessions where id = p_session_id) then
    raise exception 'That session was removed from the schedule.';
  end if;
  insert into public.rsvps (session_id, user_id) values (p_session_id, uid) on conflict do nothing;
end;
$$;

-- ===========================================================================
-- Chat
-- ===========================================================================

-- p_as_moderator marks the message with the Mod badge, and only counts for moderators.
create function public.send_chat_message(p_id uuid, p_text text, p_as_moderator boolean default false)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  insert into public.chat_messages (id, author_id, author_name, text, from_moderator)
  values (
    coalesce(p_id, gen_random_uuid()),
    uid,
    private.display_name(uid),
    private.required_text(p_text, 'Message', 280),
    coalesce(p_as_moderator, false) and private.is_moderator()
  );

  -- Keep the newest 200 messages.
  delete from public.chat_messages
  where id in (select id from public.chat_messages order by created_at desc offset 200);
end;
$$;

create function public.remove_chat_message(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  delete from public.chat_messages where id = p_id;
end;
$$;

-- Pins the message, or unpins it if it is already pinned. Only one message is pinned at a time.
create function public.toggle_chat_pin(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  was_pinned boolean;
begin
  perform private.require_moderator();
  select pinned into was_pinned from public.chat_messages where id = p_id;
  if not found then
    return;
  end if;
  update public.chat_messages set pinned = false where pinned;
  if not was_pinned then
    update public.chat_messages set pinned = true where id = p_id;
  end if;
end;
$$;

create function public.clear_chat()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  delete from public.chat_messages where true;
end;
$$;

-- ===========================================================================
-- Polls
-- ===========================================================================

-- Casts the caller's ballot, or moves it to another option.
create function public.cast_vote(p_category public.category, p_option_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  if not exists (select 1 from public.polls where category = p_category and is_open) then
    raise exception 'Voting is closed for this poll.';
  end if;
  if not exists (select 1 from public.poll_options where id = p_option_id and category = p_category) then
    raise exception 'That option is no longer in the poll.';
  end if;

  insert into public.ballots (category, user_id, option_id)
  values (p_category, uid, p_option_id)
  on conflict (category, user_id) do update
    set option_id = excluded.option_id, cast_at = now()
    where public.ballots.option_id <> excluded.option_id;
end;
$$;

-- Null arguments leave that field as it is.
create function public.update_poll(p_category public.category, p_title text default null, p_is_open boolean default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  update public.polls
  set title = case when p_title is null then title else private.required_text(p_title, 'Poll title', 120) end,
      is_open = coalesce(p_is_open, is_open)
  where category = p_category;
end;
$$;

create function public.add_poll_option(p_id uuid, p_category public.category, p_title text, p_note text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  insert into public.poll_options (id, category, title, note)
  values (
    coalesce(p_id, gen_random_uuid()),
    p_category,
    private.required_text(p_title, 'Option', 120),
    private.optional_text(p_note, 'Detail', 120)
  );
end;
$$;

-- Removing an option also removes the ballots cast for it.
create function public.remove_poll_option(p_option_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  delete from public.poll_options where id = p_option_id;
end;
$$;

-- Clears every ballot and starts a new round, so everyone can vote again.
create function public.reset_poll_votes(p_category public.category)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  delete from public.ballots where category = p_category;
  update public.poll_options set votes = 0 where category = p_category;
  update public.polls set round = round + 1 where category = p_category;
end;
$$;

-- Replaces the seasonal anime poll's options with a new season's lineup and opens a fresh round.
-- p_shows is a JSON array of { "title": text, "note": text }.
create function public.start_anime_season(
  p_year integer,
  p_season public.season_name,
  p_title text,
  p_shows jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  show jsonb;
begin
  perform private.require_moderator();
  if jsonb_typeof(p_shows) is distinct from 'array' or jsonb_array_length(p_shows) = 0 then
    raise exception 'The season lineup has no shows.';
  end if;

  delete from public.poll_options where category = 'anime';
  -- One insert per show keeps the lineup order (options are listed by created_at).
  for show in select value from jsonb_array_elements(p_shows) loop
    insert into public.poll_options (category, title, note)
    values (
      'anime',
      private.required_text(show ->> 'title', 'Show title', 120),
      private.optional_text(show ->> 'note', 'Show note', 120)
    );
  end loop;

  update public.polls
  set title = private.required_text(p_title, 'Poll title', 120),
      is_open = true,
      round = round + 1,
      season_year = p_year,
      season_name = p_season
  where category = 'anime';
end;
$$;

-- ===========================================================================
-- Squad board
-- ===========================================================================

create function public.post_lfg(
  p_id uuid,
  p_game text,
  p_mode text,
  p_rank text,
  p_roles text[],
  p_slots integer,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  insert into public.lfg_posts (id, game, mode, rank, roles, slots, note, author_id, author_name)
  values (
    coalesce(p_id, gen_random_uuid()),
    p_game,
    private.required_text(p_mode, 'Mode', 40),
    private.optional_text(p_rank, 'Rank', 24),
    coalesce(p_roles, '{}'),
    p_slots,
    private.optional_text(p_note, 'Note', 140),
    uid,
    private.display_name(uid)
  );

  -- Keep the newest 50 posts.
  delete from public.lfg_posts
  where id in (select id from public.lfg_posts order by created_at desc offset 50);
end;
$$;

-- Takes or gives up one of the post's open spots.
create function public.set_lfg_join(p_post_id uuid, p_joining boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  post public.lfg_posts;
begin
  if not p_joining then
    delete from public.lfg_joins where post_id = p_post_id and user_id = uid;
    return;
  end if;

  -- Lock the post so two people can't take its last spot at once.
  select * into post from public.lfg_posts where id = p_post_id for update;
  if not found then
    raise exception 'That squad post was removed.';
  end if;
  if post.author_id = uid then
    raise exception 'You can''t join your own squad.';
  end if;
  if exists (select 1 from public.lfg_joins where post_id = p_post_id and user_id = uid) then
    return;
  end if;
  if post.joined >= post.slots then
    raise exception 'That squad is already full.';
  end if;

  insert into public.lfg_joins (post_id, user_id) values (p_post_id, uid);
end;
$$;

-- Authors can remove their own posts; moderators can remove any post.
create function public.remove_lfg_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  delete from public.lfg_posts
  where id = p_post_id and (author_id = uid or private.is_moderator());
  if not found and exists (select 1 from public.lfg_posts where id = p_post_id) then
    raise exception 'Only the author or a moderator can remove that post.' using errcode = '42501';
  end if;
end;
$$;

create function public.clear_lfg()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  delete from public.lfg_posts where true;
end;
$$;

-- ===========================================================================
-- Music queue
-- ===========================================================================

create function public.add_track(p_id uuid, p_title text, p_artist text, p_url text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  insert into public.tracks (id, title, artist, url, added_by_id, added_by)
  values (
    coalesce(p_id, gen_random_uuid()),
    private.required_text(p_title, 'Song title', 80),
    private.required_text(p_artist, 'Artist', 80),
    private.optional_text(p_url, 'Song link', 500),
    uid,
    private.display_name(uid)
  );

  -- Keep the newest 100 songs.
  delete from public.tracks
  where id in (select id from public.tracks order by created_at desc offset 100);
end;
$$;

create function public.set_track_like(p_track_id uuid, p_liking boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  if not p_liking then
    delete from public.track_likes where track_id = p_track_id and user_id = uid;
    return;
  end if;
  if not exists (select 1 from public.tracks where id = p_track_id) then
    raise exception 'That song was removed from the queue.';
  end if;
  insert into public.track_likes (track_id, user_id) values (p_track_id, uid) on conflict do nothing;
end;
$$;

create function public.remove_track(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  delete from public.tracks where id = p_id;
end;
$$;

-- ===========================================================================
-- Game rooms
-- ===========================================================================

-- Locks the room so seat and pick limits hold when several members act at once.
create function private.lock_room(p_game public.game_id)
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform 1 from public.game_rooms where game = p_game for update;
  if not found then
    raise exception 'There is no room for that game.';
  end if;
end;
$$;

-- Room members run their room; moderators can step in.
create function private.require_room_editor(p_game public.game_id)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  if not exists (select 1 from public.room_members where game = p_game and user_id = uid)
     and not private.is_moderator() then
    raise exception 'Join the room to change it.' using errcode = '42501';
  end if;
  return uid;
end;
$$;

create function public.join_room(p_game public.game_id)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  perform private.lock_room(p_game);
  if exists (select 1 from public.room_members where game = p_game and user_id = uid) then
    return;
  end if;
  if (select count(*) from public.room_members where game = p_game) >= 5 then
    raise exception 'The room is full.';
  end if;
  insert into public.room_members (game, user_id, name) values (p_game, uid, private.display_name(uid));
end;
$$;

create function public.leave_room(p_game public.game_id)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  delete from public.room_members where game = p_game and user_id = uid;
end;
$$;

-- Null clears the start time.
create function public.set_room_start(p_game public.game_id, p_starts_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_room_editor(p_game);
  update public.game_rooms set starts_at = p_starts_at, updated_at = now() where game = p_game;
end;
$$;

create function public.pick_enemy(p_game public.game_id, p_hero text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  hero_name text := private.required_text(p_hero, 'Hero', 40);
begin
  perform private.require_room_editor(p_game);
  perform private.lock_room(p_game);
  if exists (select 1 from public.room_enemy_picks where game = p_game and hero = hero_name) then
    return;
  end if;
  if (select count(*) from public.room_enemy_picks where game = p_game) >= 5 then
    raise exception 'The enemy team already has 5 picks.';
  end if;
  insert into public.room_enemy_picks (game, hero) values (p_game, hero_name);
end;
$$;

create function public.unpick_enemy(p_game public.game_id, p_hero text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_room_editor(p_game);
  delete from public.room_enemy_picks where game = p_game and hero = p_hero;
end;
$$;

create function public.clear_enemy_picks(p_game public.game_id)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_room_editor(p_game);
  delete from public.room_enemy_picks where game = p_game;
end;
$$;

-- Empties the room: no members, no start time, no picks.
create function public.reset_room(p_game public.game_id)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  delete from public.room_members where game = p_game;
  delete from public.room_enemy_picks where game = p_game;
  update public.game_rooms set starts_at = null, updated_at = now() where game = p_game;
end;
$$;

-- ===========================================================================
-- Whole site (moderators)
-- ===========================================================================

-- Restores the starter content (see 20261006000500_seed_content.sql). Accounts stay.
-- p_time_zone is the moderator's, so seeded sessions land on sensible local hours.
create function public.reset_site(p_time_zone text default 'UTC')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  perform private.seed_site(p_time_zone);
end;
$$;

-- ===========================================================================
-- Access: signed-in members call the API; visitors only read
-- ===========================================================================

revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
