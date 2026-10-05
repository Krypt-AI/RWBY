-- The starter content: what a fresh site shows, and what "Reset everything" in the control
-- room restores. Mirrors createSeedState() in frontend/src/lib/seed.ts, which the site still
-- uses when no Supabase project is configured. Keep the two in step.

-- p_days from today at p_hour o'clock, in the given time zone.
create function private.local_time(p_days integer, p_hour integer, p_time_zone text)
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select (date_trunc('day', now() at time zone p_time_zone) + make_interval(days => p_days, hours => p_hour))
    at time zone p_time_zone;
$$;

-- Replaces all shared content with the starter content. Accounts and profiles stay.
-- p_time_zone sets the local hour of the seeded sessions (e.g. 'Asia/Kuala_Lumpur').
create function private.seed_site(p_time_zone text default 'UTC')
returns void
language plpgsql
set search_path = ''
as $$
declare
  tz text := case
    when exists (select 1 from pg_catalog.pg_timezone_names where name = p_time_zone) then p_time_zone
    else 'UTC'
  end;
  -- Two hours out, on the next quarter hour.
  soon timestamptz := date_bin('15 minutes', now() + interval '2 hours 14 minutes 59 seconds', timestamptz '2000-01-01');
begin
  -- Child rows (RSVPs, ballots, joins, likes, members, picks) go with their parents.
  delete from public.chat_messages where true;
  delete from public.sessions where true;
  delete from public.polls where true;
  delete from public.lfg_posts where true;
  delete from public.tracks where true;
  delete from public.game_rooms where true;

  insert into public.site_settings (
    id, announcement_text, announcement_visible, stream_title, stream_host, stream_url, stream_is_live, playlist_url
  )
  values (
    true,
    'Welcome to Beacon. MLBB stats are live, the game rooms are open and the Fall 2026 anime vote has started.',
    true, 'Friday Squad Night', 'Team RWBY', '', false, ''
  )
  on conflict (id) do update set
    announcement_text = excluded.announcement_text,
    announcement_visible = excluded.announcement_visible,
    stream_title = excluded.stream_title,
    stream_host = excluded.stream_host,
    stream_url = excluded.stream_url,
    stream_is_live = excluded.stream_is_live,
    playlist_url = excluded.playlist_url,
    updated_at = now();

  insert into public.sessions (title, category, starts_at) values
    ('MLBB 5-stack customs', 'game', private.local_time(1, 21, tz)),
    ('Listening party', 'music', private.local_time(2, 20, tz)),
    ('Valorant ranked push', 'game', private.local_time(3, 21, tz)),
    ('Movie night', 'movie', private.local_time(6, 21, tz));

  insert into public.polls (category, title, season_year, season_name) values
    ('game', 'Next squad game night', null, null),
    ('music', 'Song of the week', null, null),
    ('anime', 'Anime of the season · Fall 2026', 2026, 'fall'),
    ('movie', 'Movie night pick', null, null);

  -- One row per statement keeps the listed order (options are listed by created_at).
  insert into public.poll_options (category, title, note) values ('game', 'Mobile Legends: Bang Bang', '5-stack customs · Brawl');
  insert into public.poll_options (category, title, note) values ('game', 'Valorant', 'Unrated stack + 5v5 customs');
  insert into public.poll_options (category, title, note) values ('game', 'Lethal Company', 'Co-op horror · 4 players');
  insert into public.poll_options (category, title, note) values ('game', 'Minecraft', 'Shared survival server');

  insert into public.poll_options (category, title, note) values ('music', 'Red Like Roses Pt. II', 'Jeff Williams ft. Casey Lee Williams');
  insert into public.poll_options (category, title, note) values ('music', 'Enemy', 'Imagine Dragons & JID');
  insert into public.poll_options (category, title, note) values ('music', 'Legends Never Die', 'Against The Current');
  insert into public.poll_options (category, title, note) values ('music', 'RISE', 'The Glitch Mob, Mako & The Word Alive');

  -- The newest curated lineup (frontend/src/data/anime/lineups.ts).
  insert into public.poll_options (category, title, note) values ('anime', 'The Apothecary Diaries', 'Season 3 · OLM · from Oct 2');
  insert into public.poll_options (category, title, note) values ('anime', 'Black Clover', 'Season 2 · Pierrot · from Oct 3');
  insert into public.poll_options (category, title, note) values ('anime', 'Aoashi', 'Season 2 · TMS Entertainment · from Oct 4');
  insert into public.poll_options (category, title, note) values ('anime', 'Magic Knight Rayearth', 'New series · E&H Production · from Oct 7');
  insert into public.poll_options (category, title, note) values ('anime', 'The Detective Is Already Dead', 'Season 2 · ENGI · from Oct 7');
  insert into public.poll_options (category, title, note) values ('anime', 'Firefly Wedding', 'New series · David Production · from Oct 9');
  insert into public.poll_options (category, title, note) values ('anime', 'Overgeared', 'New series · J.C.STAFF');
  insert into public.poll_options (category, title, note) values ('anime', 'PSYREN', 'New series · Satelight');

  insert into public.poll_options (category, title, note) values ('movie', 'Spirited Away', 'Studio Ghibli · 2001');
  insert into public.poll_options (category, title, note) values ('movie', 'Your Name', 'CoMix Wave · 2016');
  insert into public.poll_options (category, title, note) values ('movie', 'Akira', 'TMS · 1988');
  insert into public.poll_options (category, title, note) values ('movie', 'Perfect Blue', 'Madhouse · 1997');

  insert into public.lfg_posts (game, mode, rank, roles, slots, note, author_name, created_at) values
    ('mlbb', 'Ranked', 'Mythic', '{Roam,Jungle}', 2,
     'Pushing to Mythical Glory tonight. Voice on, no tilt.', 'Weiss', now() - interval '1 hour'),
    ('valorant', 'Unrated', 'Any rank', '{Controller}', 1,
     'Chill games, trying the new Warden. Need someone who smokes.', 'Yang', now() - interval '3 hours');

  insert into public.tracks (title, artist, added_by) values ('This Will Be the Day', 'Jeff Williams ft. Casey Lee Williams', 'Team RWBY');
  insert into public.tracks (title, artist, added_by) values ('Paint the Town Blue', 'Ashnikko', 'Team RWBY');
  insert into public.tracks (title, artist, added_by) values ('Phoenix', 'Cailin Russo & Chrissy Costanza', 'Team RWBY');

  insert into public.game_rooms (game, starts_at) values ('mlbb', soon), ('valorant', null);
  insert into public.room_members (game, name) values ('mlbb', 'Weiss');
  insert into public.room_members (game, name) values ('mlbb', 'Blake');
end;
$$;
