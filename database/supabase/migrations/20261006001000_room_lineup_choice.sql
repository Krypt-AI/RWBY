-- A room can settle on one of its guide's lineups (for Valorant, the comp for a map), shared by
-- everyone in it, so the whole squad plans around the same comp and seats
-- (frontend/src/components/rooms/MapLineups.tsx).

-- A guide lineup's name, e.g. 'Lotus'. Null until someone picks one; the room then shows the first.
alter table public.game_rooms
  add column lineup text constraint game_rooms_lineup_check check (char_length(lineup) between 1 and 40);

-- Null goes back to the guide's first lineup.
create function public.set_room_lineup(p_game public.game_id, p_lineup text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  lineup_name text := case when p_lineup is null then null else private.required_text(p_lineup, 'Lineup', 40) end;
begin
  perform private.require_room_editor(p_game);
  update public.game_rooms set lineup = lineup_name, updated_at = now() where game = p_game;
end;
$$;

revoke execute on function public.set_room_lineup(public.game_id, text) from public, anon;
grant execute on function public.set_room_lineup(public.game_id, text) to authenticated;

-- Empties the room: no members, no start time, no picks, no chosen lineup.
-- Supersedes public.reset_room() from 20261006000600_api.sql.
create or replace function public.reset_room(p_game public.game_id)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_moderator();
  delete from public.room_members where game = p_game;
  delete from public.room_enemy_picks where game = p_game;
  update public.game_rooms set starts_at = null, lineup = null, updated_at = now() where game = p_game;
end;
$$;
