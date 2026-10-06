-- Room members say which role they play and which heroes or agents they'd like to play. The game
-- room builds its recommended lineup around them (frontend/src/lib/lineupPlanner.ts).

-- The roles each game's room offers. Mirrors the GameRole ids in frontend/src/data/games/.
create function private.room_roles(p_game public.game_id)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select case p_game
    when 'mlbb' then array['exp', 'jungle', 'mid', 'gold', 'roam']
    when 'valorant' then array['duelist', 'initiator', 'controller', 'sentinel']
  end;
$$;

alter table public.room_members
  -- Null while the member fills whatever the squad needs.
  add column role text
    constraint room_members_role_check check (role is null or role = any (private.room_roles(game))),
  -- Favourites, most wanted first.
  add column picks text[] not null default '{}'
    constraint room_members_picks_check check (cardinality(picks) <= 3);

-- Sets the caller's role (null: fill) and favourites. Picks are trimmed and repeats dropped.
create function public.set_room_preferences(p_game public.game_id, p_role text, p_picks text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
  role_id text := nullif(btrim(coalesce(p_role, '')), '');
  pick_names text[];
begin
  if role_id is not null and not role_id = any (private.room_roles(p_game)) then
    raise exception 'That isn''t a role in this game.' using errcode = '22023';
  end if;

  select coalesce(array_agg(name order by first_seen), '{}')
  into pick_names
  from (
    select private.required_text(pick, 'Pick', 40) as name, min(position) as first_seen
    from unnest(coalesce(p_picks, '{}')) with ordinality as entry (pick, position)
    group by 1
  ) as distinct_picks;
  if cardinality(pick_names) > 3 then
    raise exception 'Pick up to 3 favourites.' using errcode = '22023';
  end if;

  update public.room_members set role = role_id, picks = pick_names where game = p_game and user_id = uid;
  if not found then
    raise exception 'Join the room first.' using errcode = '42501';
  end if;
end;
$$;

revoke execute on function public.set_room_preferences(public.game_id, text, text[]) from public, anon;
grant execute on function public.set_room_preferences(public.game_id, text, text[]) to authenticated;

