-- Vote, like and join counts are kept by the database, one row change at a time, so
-- simultaneous clicks never lose a count and clients never write a total themselves.

create function private.tally_ballot()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.option_id = new.option_id then
    return null;
  end if;
  if tg_op in ('UPDATE', 'DELETE') then
    update public.poll_options set votes = votes - 1 where id = old.option_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    update public.poll_options set votes = votes + 1 where id = new.option_id;
  end if;
  return null;
end;
$$;

create trigger ballots_tally
  after insert or delete or update of option_id on public.ballots
  for each row execute function private.tally_ballot();

create function private.tally_track_like()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.tracks set likes = likes + 1 where id = new.track_id;
  else
    update public.tracks set likes = likes - 1 where id = old.track_id;
  end if;
  return null;
end;
$$;

create trigger track_likes_tally
  after insert or delete on public.track_likes
  for each row execute function private.tally_track_like();

-- lfg_posts.joined is checked against slots, so a join past a full squad fails here too.
create function private.tally_lfg_join()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.lfg_posts set joined = joined + 1 where id = new.post_id;
  else
    update public.lfg_posts set joined = joined - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger lfg_joins_tally
  after insert or delete on public.lfg_joins
  for each row execute function private.tally_lfg_join();
