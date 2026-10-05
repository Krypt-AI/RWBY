-- Streams row changes to connected clients, so a vote, chat message or room pick shows up
-- for everyone without a reload. Realtime applies the same read policies as the API, so
-- personal rows (ballots, RSVPs, joins, likes) only reach their owner.

alter publication supabase_realtime add table
  public.profiles,
  public.site_settings,
  public.sessions,
  public.rsvps,
  public.chat_messages,
  public.polls,
  public.poll_options,
  public.ballots,
  public.lfg_posts,
  public.lfg_joins,
  public.tracks,
  public.track_likes,
  public.game_rooms,
  public.room_members,
  public.room_enemy_picks;
