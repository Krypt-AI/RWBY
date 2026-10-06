-- The game rooms only list people who joined: the starter content no longer seats Weiss and Blake in
-- the MLBB room. Supersedes private.seed_site() from 20261006000800_seed_without_sample_squads.sql.
-- Mirrors createSeedState() in frontend/src/lib/seed.ts. Keep the two in step.

-- Removes the sample members already seeded. Only seeded members have no account behind them.
delete from public.room_members where user_id is null;

-- Replaces all shared content with the starter content. Accounts and profiles stay.
-- p_time_zone sets the local hour of the seeded sessions (e.g. 'Asia/Kuala_Lumpur').
create or replace function private.seed_site(p_time_zone text default 'UTC')
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

  insert into public.tracks (title, artist, added_by) values ('This Will Be the Day', 'Jeff Williams ft. Casey Lee Williams', 'Team RWBY');
  insert into public.tracks (title, artist, added_by) values ('Paint the Town Blue', 'Ashnikko', 'Team RWBY');
  insert into public.tracks (title, artist, added_by) values ('Phoenix', 'Cailin Russo & Chrissy Costanza', 'Team RWBY');

  insert into public.game_rooms (game, starts_at) values ('mlbb', soon), ('valorant', null);
end;
$$;
