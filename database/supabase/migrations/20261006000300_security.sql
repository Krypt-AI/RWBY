-- Who can read what. Writes never happen through the tables: every change goes through an
-- API function that checks the caller first (see 20261006000600_api.sql).

-- Supabase grants anon and authenticated full table access by default. Keep reads, take writes back.
revoke insert, update, delete, truncate, references, trigger on all tables in schema public from anon, authenticated;
grant select on all tables in schema public to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.sessions enable row level security;
alter table public.rsvps enable row level security;
alter table public.chat_messages enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.ballots enable row level security;
alter table public.lfg_posts enable row level security;
alter table public.lfg_joins enable row level security;
alter table public.tracks enable row level security;
alter table public.track_likes enable row level security;
alter table public.game_rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.room_enemy_picks enable row level security;

-- ---------------------------------------------------------------------------
-- Community content: readable by every visitor, signed in or not
-- ---------------------------------------------------------------------------

create policy "Everyone can read profiles" on public.profiles for select to anon, authenticated using (true);
create policy "Everyone can read site settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Everyone can read the schedule" on public.sessions for select to anon, authenticated using (true);
create policy "Everyone can read chat" on public.chat_messages for select to anon, authenticated using (true);
create policy "Everyone can read polls" on public.polls for select to anon, authenticated using (true);
create policy "Everyone can read poll options" on public.poll_options for select to anon, authenticated using (true);
create policy "Everyone can read squad posts" on public.lfg_posts for select to anon, authenticated using (true);
create policy "Everyone can read the song queue" on public.tracks for select to anon, authenticated using (true);
create policy "Everyone can read game rooms" on public.game_rooms for select to anon, authenticated using (true);
create policy "Everyone can read room members" on public.room_members for select to anon, authenticated using (true);
create policy "Everyone can read enemy picks" on public.room_enemy_picks for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- Personal choices: only the person who made them can see them.
-- Totals stay public through the counters on poll_options, tracks and lfg_posts.
-- ---------------------------------------------------------------------------

create policy "Members can read their own RSVPs" on public.rsvps
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Members can read their own ballots" on public.ballots
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Members can read their own squad joins" on public.lfg_joins
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Members can read their own song likes" on public.track_likes
  for select to authenticated using (user_id = (select auth.uid()));
