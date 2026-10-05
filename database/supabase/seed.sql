-- Starter content for a new project. Runs on `supabase db reset`, or with
-- `supabase db push --include-seed` on a project that hasn't been seeded yet.
-- Running it again replaces all shared content (chat, votes, squad posts, songs, rooms) with
-- the starter set; accounts stay. The time zone puts the seeded sessions on local evenings.
select private.seed_site('Asia/Kuala_Lumpur');
