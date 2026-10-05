-- Accounts and the helpers every API function uses to check who is calling.
-- The `private` schema is not exposed through the API, so clients can't call these directly.

create schema if not exists private;
revoke all on schema private from public;

-- ---------------------------------------------------------------------------
-- Profiles: created on first sign-in from the Discord account details
-- ---------------------------------------------------------------------------

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  -- Discord's display name first, then its username, then a random Beacon name.
  name text := coalesce(
    nullif(btrim(meta -> 'custom_claims' ->> 'global_name'), ''),
    nullif(btrim(meta ->> 'full_name'), ''),
    nullif(btrim(meta ->> 'name'), ''),
    nullif(btrim(meta ->> 'user_name'), ''),
    'Huntsman-' || (1000 + floor(random() * 9000))::int
  );
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, left(name, 24), nullif(meta ->> 'avatar_url', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Caller checks
-- ---------------------------------------------------------------------------

-- The signed-in caller's id. Raises for visitors who aren't signed in.
create function private.require_user()
returns uuid
language plpgsql
stable
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null or not exists (select 1 from public.profiles where id = uid) then
    raise exception 'Sign in to do that.' using errcode = '28000';
  end if;
  return uid;
end;
$$;

create function private.is_moderator()
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'moderator');
$$;

-- The signed-in caller's id. Raises unless they are a moderator.
create function private.require_moderator()
returns uuid
language plpgsql
stable
set search_path = ''
as $$
declare
  uid uuid := private.require_user();
begin
  if not private.is_moderator() then
    raise exception 'Only moderators can do that.' using errcode = '42501';
  end if;
  return uid;
end;
$$;

create function private.display_name(p_user_id uuid)
returns text
language sql
stable
set search_path = ''
as $$
  select display_name from public.profiles where id = p_user_id;
$$;

-- ---------------------------------------------------------------------------
-- Input checks with messages people can act on (the table checks are the backstop)
-- ---------------------------------------------------------------------------

-- Trims the text and requires 1 to p_max characters.
create function private.required_text(p_value text, p_label text, p_max integer)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  value text := btrim(coalesce(p_value, ''));
begin
  if value = '' then
    raise exception '% can''t be empty.', p_label using errcode = '22023';
  end if;
  if char_length(value) > p_max then
    raise exception '% can be at most % characters.', p_label, p_max using errcode = '22023';
  end if;
  return value;
end;
$$;

-- Trims the text, allows it to be empty and requires at most p_max characters.
create function private.optional_text(p_value text, p_label text, p_max integer)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  value text := btrim(coalesce(p_value, ''));
begin
  if char_length(value) > p_max then
    raise exception '% can be at most % characters.', p_label, p_max using errcode = '22023';
  end if;
  return value;
end;
$$;
